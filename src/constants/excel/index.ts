/**
 * Extracts the column names from the given columns map.
 *
 * @param columnsMap - A mapping of column names to field names.
 * @returns An array of column names.
 *
 * @example
 * const columnsMap = {
 *   ID: "id",
 *   Nama: "nama",
 *   NIP: "nip",
 *   NIK: "nik",
 *   NPWP: "npwp",
 *   "Golongan/Ruang": "pangkatGolonganId",
 *   Jabatan: "jabatan",
 *   Eselon: "eselon",
 *   "Nama Rekening": "namaRekening",
 *   Bank: "bank",
 *   "Nomor Rekening": "nomorRekening",
 * };
 *
 * const columnNames = getExcelColumnNames(columnsMap);
 * console.log(columnNames); // ["ID", "Nama", "NIP", "NIK", "NPWP", "Golongan/Ruang", "Jabatan", "Eselon", "Nama Rekening", "Bank", "Nomor Rekening"]
 */
export function getExcelColumnNames(
  columnsMap: Record<string, string>
): string[] {
  return Object.keys(columnsMap);
}

/**
 * Maps the data from the given columns to the corresponding fields.
 *
 * @param data - The data to map.
 * @param columnMapping - A mapping of column names to field names.
 * @returns The mapped data.
 *
 * @example
 * const data = {
 *   ID: "1",
 *   Nama: "John Doe",
 *   NIP: "123456789012345678",
 *   NIK: "1234567890123456",
 *   NPWP: "1234567890",
 *   "Golongan/Ruang": "III/d",
 *   Jabatan: "Manager",
 *   Eselon: "IV",
 *   "Nama Rekening": "John Doe",
 *   Bank: "Bank ABC",
 *   "Nomor Rekening": "1234567890",
 * };
 *
 * const columnsMap = {
 *   ID: "id",
 *   Nama: "nama",
 *   NIP: "nip",
 *   NIK: "nik",
 *   NPWP: "npwp",
 *   "Golongan/Ruang": "pangkatGolonganId",
 *   Jabatan: "jabatan",
 *   Eselon: "eselon",
 *   "Nama Rekening": "namaRekening",
 *   Bank: "bank",
 *   "Nomor Rekening": "nomorRekening",
 * };
 *
 * const mappedData = mapExcelColumnsToFields(data, columnsMap);
 * console.log(mappedData);
 * // {
 * //   id: "1",
 * //   nama: "John Doe",
 * //   nip: "123456789012345678",
 * //   nik: "1234567890123456",
 * //   npwp: "1234567890",
 * //   pangkatGolonganId: "III/d",
 * //   jabatan: "Manager",
 * //   eselon: "IV",
 * //   namaRekening: "John Doe",
 * //   bank: "Bank ABC",
 * //   nomorRekening: "1234567890",
 * // }
 */
export function mapExcelColumnsToFields(
  data: Record<string, any>,
  columnMapping: Record<string, string>
): Record<string, any> {
  const mappedData: Record<string, any> = {};

  for (const [column, field] of Object.entries(columnMapping)) {
    if (data[column] !== undefined) {
      mappedData[field] = data[column];
    }
  }

  return mappedData;
}
