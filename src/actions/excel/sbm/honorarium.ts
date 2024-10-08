"use server";
import { ActionResponse } from "@/actions";
import {
  columnsMap,
  columnsWithEmptyValueAllowed,
  extractFromColumns,
  mapColumnExcelToField,
} from "@/constants/excel/sbm-honorarium";
import getReferensiSbmHonorarium, {
  SbmHonorariumWithNumber,
} from "@/data/sbm-honorarium";
import { dbHonorarium } from "@/lib/db-honorarium";
import parseExcelOnServer, {
  ParseExcelOptions,
} from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { excelDataReferensiSchema } from "@/zod/schemas/excel";
import { SbmHonorarium } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export const importExcelSbmHonorarium = async (
  formData: FormData
): Promise<ActionResponse<SbmHonorariumWithNumber[]>> => {
  let data: SbmHonorariumWithNumber[];

  // step 1: parse the form data
  try {
    console.log("[try to parse]", formData);
    // Convert FormData to a plain object
    const plainObject = formDataToObject(formData);

    const parsedForm = excelDataReferensiSchema.parse(plainObject);
    console.log("[parsedForm]", parsedForm);

    const { file } = parsedForm;
    // parse the xlsx file
    if (file) {
      const rows = await parseDataSbmHonorariumDariExcel(file);
      const result = await saveDataSbmHonorariumToDatabase(rows);
      if (!result) {
        return {
          success: false,
          error: "No result Error saving data to database",
          message: "No result Error saving data to database",
        };
      } else {
        revalidatePath("/data-referensi/sbm/honorarium");
        return {
          success: true,
          data: result,
          message: "Data sbmHonorarium berhasil diimport",
        };
      }
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[ZodError]", error.errors);
    } else {
      console.error("[UnknownError]", error);
    }
    return {
      success: false,
      error: "Error parsing form data",
      message: "Error parsing form data",
    };
  }

  // step 2: save the data to the database
  // data ready to be saved
  return {
    success: false,
    error: "Error saving data to database",
    message: "Error saving data to database",
  };
};

// Function to convert FormData to a plain object
const formDataToObject = (formData: FormData) => {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

async function parseDataSbmHonorariumDariExcel(file: File) {
  // parse the form data
  const options: ParseExcelOptions = {
    extractFromColumns: extractFromColumns,
  };
  try {
    const dataSbmHonorariumDariExcel = await parseExcelOnServer(file, options);

    // check if there is no missing columns and empty values : harusnya ini sdh dilakukan di sisi client jadi gak perlu diulang

    if (dataSbmHonorariumDariExcel.rows.length === 0) {
      throw new Error("No data found in the excel file");
    }

    // check if there is emtpy values
    if (Object.keys(dataSbmHonorariumDariExcel.emptyValues).length != 0) {
      const result = splitEmptyValues(
        dataSbmHonorariumDariExcel.emptyValues,
        columnsWithEmptyValueAllowed
      );
      const { shouldNotEmpty, allowEmpty } = result;
      if (Object.keys(shouldNotEmpty).length != 0) {
        console.log("There are empty values in the required columns");
        throw new Error("There are empty values in the required columns");
      }
    }

    return dataSbmHonorariumDariExcel.rows;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

async function saveDataSbmHonorariumToDatabase(
  data: Record<string, any>[],
  createdBy: string = "admin"
): Promise<SbmHonorariumWithNumber[] | void> {
  // loop over the data and save it to the database, convert into SbmHonorarium object
  try {
    const sbmHonorarium: SbmHonorarium[] = data.map((row) => {
      const mappedData = mapColumnExcelToField(row, columnsMap);
      mappedData.createdBy = createdBy;
      return mappedData as SbmHonorarium;
    });

    console.log("[sbmHonorarium]", sbmHonorarium);

    const inserted = await dbHonorarium.sbmHonorarium.createMany({
      data: sbmHonorarium,
    });

    console.log("[inserted]", inserted);
    // Fetch the created records
    const createdSbmHonorarium = await getReferensiSbmHonorarium();
    const convertedData = createdSbmHonorarium.map((item) => ({
      ...item,
      besaran: item.besaran.toNumber(), // Convert Decimal to number
    }));

    return convertedData;
  } catch (error) {
    console.error("Error saving data to database:", error);
    throw new Error("Error saving data to database");
  }
}
