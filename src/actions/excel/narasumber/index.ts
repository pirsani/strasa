"use server";
import { ActionResponse } from "@/actions";
import {
  columnsMap,
  columnsWithEmptyValueAllowed,
  extractFromColumns,
  mapColumnExcelToField,
} from "@/constants/excel/narasumber";
import { dbHonorarium } from "@/lib/db-honorarium";
import { CustomPrismaClientError } from "@/types/custom-prisma-client-error";
import parseExcelOnServer, {
  ParseExcelOptions,
} from "@/utils/excel/parse-excel-on-server";
import { splitEmptyValues } from "@/utils/excel/split-empty-values";
import { excelDataReferensiSchema } from "@/zod/schemas/excel";
import { Narasumber } from "@prisma-honorarium/client";
import { ZodError } from "zod";

export const importExcelNarasumber = async (
  formData: FormData
): Promise<ActionResponse<Narasumber[]>> => {
  let data: Narasumber[];

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
      const rows = await parseDataNarasumberDariExcel(file);
      const result = await saveDataNarasumberToDatabase(rows);
      if (result)
        return {
          success: true,
          data: result,
          message: "Data narasumber berhasil diimport",
        };
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("[ZodError]", error.errors);
    } else {
      const customError = error as CustomPrismaClientError;
      if (customError.code === "P2002") {
        return {
          success: false,
          error: customError.code,
          message: "Narasumber dengan NIK yang sama sudah ada",
        };
      }
      console.error("[customError]", customError.code, customError.message);
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

async function parseDataNarasumberDariExcel(file: File) {
  // parse the form data
  const options: ParseExcelOptions = {
    extractFromColumns: extractFromColumns,
  };
  try {
    const dataNarasumberDariExcel = await parseExcelOnServer(file, options);

    // check if there is no missing columns and empty values : harusnya ini sdh dilakukan di sisi client jadi gak perlu diulang

    if (dataNarasumberDariExcel.rows.length === 0) {
      throw new Error("No data found in the excel file");
    }

    // check if there is emtpy values
    if (Object.keys(dataNarasumberDariExcel.emptyValues).length != 0) {
      const result = splitEmptyValues(
        dataNarasumberDariExcel.emptyValues,
        columnsWithEmptyValueAllowed
      );
      const { shouldNotEmpty, allowEmpty } = result;
      if (Object.keys(shouldNotEmpty).length != 0) {
        console.log("There are empty values in the required columns");
        throw new Error("There are empty values in the required columns");
      }
    }

    return dataNarasumberDariExcel.rows;
  } catch (error) {
    console.error("Error parsing xlsx file:", error);
    throw new Error("Error parsing xlsx file");
  }
}

const emptyStringToNull = (data: Record<string, any>) => {
  const newData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === "") {
      newData[key] = null;
    } else {
      newData[key] = value;
    }
  }
  return newData;
};

async function saveDataNarasumberToDatabase(
  data: Record<string, any>[],
  createdBy: string = "admin"
): Promise<Narasumber[] | void> {
  // loop over the data and save it to the database, convert into Narasumber object
  try {
    const narasumber: Narasumber[] = data.map((row) => {
      const mappedData = mapColumnExcelToField(row, columnsMap);
      mappedData.id = mappedData.NIK;
      mappedData.createdBy = createdBy;
      // Delete the NIK property from mappedData karena sudah dijadikan id
      delete mappedData.NIK;

      // convert empty string to null
      const cleanedData = emptyStringToNull(mappedData);

      return cleanedData as Narasumber;
    });

    const result = await dbHonorarium.$transaction(async (prisma) => {
      await prisma.narasumber.createMany({
        data: narasumber,
      });

      // Fetch the created records
      const createdNarasumber = await dbHonorarium.narasumber.findMany({
        where: {
          id: {
            in: narasumber.map((n) => n.id),
          },
        },
      });
      return createdNarasumber;
    });
    return result;
  } catch (error) {
    throw error;
    // console.error("Error saving data to database:", error);
    // throw new Error("Error saving data to database");
  }
}
