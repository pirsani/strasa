import { getExcelColumnNames } from ".";

// map column excel to field database/zod schema
//Nomor	ID Provinsi	Nama Provisi	Satuan	 Fullboard 	 Fullday/Halfday 	 Luar Kota 	 Dalam Kota 	 Diklat 	Tahun
export const columnsMap = {
  Nomor: "nomor",
  "ID Provinsi": "provinsiId",
  "Nama Provisi": "provinsi",
  Satuan: "satuan",
  Fullboard: "fullboard",
  "Fullday/Halfday": "fulldayHalfday",
  "Luar Kota": "luarKota",
  "Dalam Kota": "dalamKota",
  Diklat: "diklat",
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

//1	11	ACEH	OH	 Rp120.000 	 Rp85.000 	 Rp360.000 	 Rp140.000 	 Rp110.000 	2024

//1	11	ACEH	OH	 Rp120.000 	 Rp85.000 	 Rp360.000 	 Rp140.000 	 Rp110.000 	2024
const exampleData = [
  {
    Nomor: "1",
    "ID Provinsi": "11",
    "Nama Provisi": "ACEH",
    Satuan: "OH",
    Fullboard: "Rp120.000",
    "Fullday/Halfday": "Rp85.000",
    "Luar Kota": "Rp360.000",
    "Dalam Kota": "Rp140.000",
    Diklat: "Rp110.000",
    Tahun: "2024",
  },
];

const mappedData = mapColumnExcelToField(exampleData, columnsMap);
