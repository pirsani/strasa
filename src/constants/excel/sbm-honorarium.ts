import { getExcelColumnNames } from ".";

// map column excel to field database/zod schema
export const columnsMap = {
  Jenis: "jenis",
  Satuan: "satuan",
  Besaran: "besaran",
  Uraian: "uraian",
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
    Jenis: "Narasumber",
    Satuan: "OJ",
    Besaran: "1700000",
    Uraian:
      "Menteri/Pejabat Setingkat Menteri/Pejabat Negara Lainnya/yang disetarakan",
    Tahun: "2024",
  },
];

const mappedData = mapColumnExcelToField(exampleData, columnsMap);
