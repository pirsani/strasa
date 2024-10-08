import { getExcelColumnNames } from ".";

// const extractFromColumns = [
//   "ID",
//   "Nama",
//   "NIP",
//   "NIK",
//   "NPWP",
//   "Golongan/Ruang",
//   "Jabatan",
//   "Eselon",
//   "Nama Rekening",
//   "Bank",
//   "Nomor Rekening",
// ];
// const columnsWithEmptyValueAllowed = [
//   "NIP",
//   "Eselon",
//   "Golongan/Ruang",
//   "NPWP",
//   "Nama Rekening",
//   "Bank",
//   "Nomor Rekening",
// ];

export const columnsMap = {
  ID: "id",
  Nama: "nama",
  NIP: "NIP",
  NIK: "NIK",
  NPWP: "NPWP",
  "Golongan/Ruang": "pangkatGolonganId",
  Jabatan: "jabatan",
  Eselon: "eselon",
  "Nama Rekening": "namaRekening",
  Bank: "bank",
  "Nomor Rekening": "nomorRekening",
};

export const extractFromColumns = getExcelColumnNames(columnsMap);

export const columnsWithEmptyValueAllowed = [
  "NIP",
  "Eselon",
  "Golongan/Ruang",
  "NPWP",
  "Nama Rekening",
  "Bank",
  "Nomor Rekening",
];

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
    ID: "1",
    Nama: "John Doe",
    NIP: "1234567890",
    NIK: "1234567890123456",
    NPWP: "123456789012345",
    "Golongan/Ruang": "IV/a",
    Jabatan: "Kepala Sekolah",
    Eselon: "III",
    "Nama Rekening": "John Doe",
    Bank: "Bank Mandiri",
    "Nomor Rekening": "1234567890",
  },
];

const mappedData = mapColumnExcelToField(exampleData, columnsMap);

// console.log(mappedData);
// mappedData = [
//   {
//     id: "1",
//     nama: "John Doe",
//     nip: "123456789",
//     nik: "1234567890123456",
//     npwp: "123456789012345",
//     pangkatGolonganId: "IV/a",
//     jabatan: "Kepala Sekolah",
//     eselon: "III",
//     namaRekening: "John Doe",
//     bank: "Bank Mandiri",
//     nomorRekening: "123",
//   },
// ];
