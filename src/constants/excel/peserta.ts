export const columns = [
  "ID",
  "Nama",
  "NIP",
  "Golongan/Ruang",
  "Jabatan",
  "Eselon",
  "NIK",
  "NPWP",
  "Nama Rekening",
  "Bank",
  "Nomor Rekening",
  "Golongan UH LN",
];

// NIP, Golongan/Ruang Boleh kosong karena bisa jadi bukan ASN
// Golongan UH hanya diisi untuk peserta yang bukan ASN karena golongan UH LN acuannya adalah golongan ruang ASN
// referensi https://jdih.kemenkeu.go.id/fulltext/2014/55~PMK.05~2014Per.HTM

export const emptyAllowed = [
  "NIP",
  "Golongan/Ruang",
  "Eselon",
  "ID",
  "Lainny",
  "Golongan UH LN",
];
