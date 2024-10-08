import { getExcelColumnNames } from ".";

// map column excel to field database/zod schema
//Nomor	ID Provinsi	Nama Provisi	Satuan	 Fullboard 	 Fullday/Halfday 	 Luar Kota 	 Luar Kota 	 Diklat 	Tahun
export const columnsMap = {
  Nomor: "urutan",
  "ID Negara": "negaraId",
  Nama: "nama",
  Satuan: "satuan",
  "Golongan A": "golonganA",
  "Golongan B": "golonganB",
  "Golongan C": "golonganC",
  "Golongan D": "golonganD",
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

// id,nama,kode_alpha_2,kode_alpha_3,kode_numeric,created_by,created_at,updated_by,updated_at

//1	11	ACEH	OH	 Rp120.000 	 Rp85.000 	 Rp360.000 	 Rp140.000 	 Rp110.000 	2024
const exampleData = [
  {
    Nomor: 1,
    "ID Negara": "ARG",
    "Nama Negara": "Argentina",
    "Golongan A": "120",
    "Golongan B": "85",
    "Golongan C": "90",
    "Golongan D": "90",
    Tahun: 2024,
  },
];

const mappedData = mapColumnExcelToField(exampleData, columnsMap);
