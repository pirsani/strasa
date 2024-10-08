import { getExcelColumnNames } from ".";

// map column excel to field database/zod schema
//Nomor	ID Provinsi	Nama Provisi	Satuan	 Fullboard 	 Fullday/Halfday 	 Luar Kota 	 Dalam Kota 	 Diklat 	Tahun
export const columnsMap = {
  Nomor: "nomor",
  "ID Provinsi": "provinsiId",
  "Nama Provisi": "provinsi",
  Satuan: "satuan",
  Besaran: "besaran",
  Tahun: "tahun",
};

export const extractFromColumns = getExcelColumnNames(columnsMap);

export const columnsWithEmptyValueAllowed = [];

export function mapColumnExcelToField(
  data: Record<string, any>,
  columnMapping: Record<string, string>
) {
  const mappedData: Record<string, any> = {};

  for (const [column, field] of Object.entries(columnMapping)) {
    if (data[column] !== undefined) {
      mappedData[field] = data[column];
    }
  }

  return mappedData;
}

const exampleData = [
  {
    Nomor: "1",
    "ID Provinsi": "11",
    "Nama Provisi": "ACEH",
    Satuan: "Orang/Kali",
    Besaran: "120.000",
    Tahun: "2024",
  },
];

const mappedData = mapColumnExcelToField(exampleData, columnsMap);
