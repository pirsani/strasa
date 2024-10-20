export const columns = [
  "NO",
  "Nama",
  "NIP",
  "NIK",
  "NPWP",
  "Golongan/Ruang",
  "Jabatan",
  "Eselon",
  "Golongan UH LN",
  "Berangkat",
  "Kembali",
  "Nama Rekening",
  "Bank",
  "Nomor Rekening",
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
