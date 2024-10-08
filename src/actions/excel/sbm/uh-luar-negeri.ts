"use server";
import { ActionResponse } from "@/actions";
import {
  columnsMap,
  columnsWithEmptyValueAllowed,
  extractFromColumns,
  mapColumnExcelToField,
} from "@/constants/excel/sbm-uh-luar-negeri";
import getReferensiSbmUhLuarNegeri, {
  SbmUhLuarNegeriPlainObject,
} from "@/data/sbm-uh-luar-negeri";
import { dbHonorarium } from "@/lib/db-honorarium";
import parseExcelOnServer, {
  ParseExcelOptions,
} from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { excelDataReferensiSchema } from "@/zod/schemas/excel";
import { SbmUhLuarNegeri } from "@prisma-honorarium/client";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export const importExcelSbmUhLuarNegeri = async (
  formData: FormData
): Promise<ActionResponse<SbmUhLuarNegeriPlainObject[]>> => {
  let data: SbmUhLuarNegeriPlainObject[];

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
      const rows = await parseDataSbmUhLuarNegeriDariExcel(file);
      console.log("[rows]", rows);
      const result = await saveDataSbmUhLuarNegeriToDatabase(rows);
      if (!result) {
        return {
          success: false,
          error: "No result Error saving data to database",
          message: "No result Error saving data to database",
        };
      } else {
        revalidatePath("/data-referensi/sbm/uh-luar-negeri");
        return {
          success: true,
          data: result,
          message: "Data sbmUhLuarNegeri berhasil diimport",
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

async function parseDataSbmUhLuarNegeriDariExcel(file: File) {
  // parse the form data
  const options: ParseExcelOptions = {
    extractFromColumns: extractFromColumns,
  };
  try {
    const dataSbmUhLuarNegeriDariExcel = await parseExcelOnServer(
      file,
      options
    );

    // check if there is no missing columns and empty values : harusnya ini sdh dilakukan di sisi client jadi gak perlu diulang

    if (dataSbmUhLuarNegeriDariExcel.rows.length === 0) {
      throw new Error("No data found in the excel file");
    }

    //console.log("[dataSbmUhLuarNegeriDariExcel]", dataSbmUhLuarNegeriDariExcel);

    // check if there is emtpy values
    if (Object.keys(dataSbmUhLuarNegeriDariExcel.emptyValues).length != 0) {
      const result = splitEmptyValues(
        dataSbmUhLuarNegeriDariExcel.emptyValues,
        columnsWithEmptyValueAllowed
      );
      const { shouldNotEmpty, allowEmpty } = result;
      if (Object.keys(shouldNotEmpty).length != 0) {
        console.log("[shouldNotEmpty]", shouldNotEmpty);
        console.log("There are empty values in the required columns");
        throw new Error("There are empty values in the required columns");
      }
    }

    return dataSbmUhLuarNegeriDariExcel.rows;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

async function saveDataSbmUhLuarNegeriToDatabase(
  data: Record<string, any>[],
  createdBy: string = "admin"
): Promise<SbmUhLuarNegeriPlainObject[] | void> {
  // loop over the data and save it to the database, convert into SbmUhLuarNegeri object
  try {
    const sbmUhLuarNegeri: SbmUhLuarNegeri[] = data.map((row) => {
      const mappedData = mapColumnExcelToField(row, columnsMap);
      console.log("[mappedData]", mappedData);

      delete mappedData.nama; // remove nama negara
      mappedData.createdBy = createdBy;
      mappedData.id =
        mappedData.urutan.toString() + "-" + mappedData.tahun.toString();
      delete mappedData.urutan;
      return mappedData as SbmUhLuarNegeri;
    });

    console.log("[sbmUhLuarNegeri]", sbmUhLuarNegeri);

    const inserted = await dbHonorarium.sbmUhLuarNegeri.createMany({
      data: sbmUhLuarNegeri,
    });

    console.log("[inserted]", inserted);
    // Fetch the created records
    const createdSbmUhLuarNegeri = await getReferensiSbmUhLuarNegeri();
    const convertedData = createdSbmUhLuarNegeri.map((item) => ({
      ...item,
      golonganA: item.golonganA.toNumber(),
      golonganB: item.golonganB.toNumber(),
      golonganC: item.golonganC.toNumber(),
      golonganD: item.golonganD.toNumber(),
    }));

    return convertedData as SbmUhLuarNegeriPlainObject[];
  } catch (error) {
    console.error("Error saving data to database:", error);
    throw new Error("Error saving data to database");
  }
}
