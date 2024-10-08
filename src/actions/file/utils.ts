export const mapsCuidToJenisDokumen = {
  dokumenSuratTugasCuid: "surat-tugas",
  dokumenNodinMemoSkCuid: "nodin-memo-sk",
  dokumenJadwalCuid: "jadwal-kegiatan",
  dokumenSuratSetnegSptjmCuid: "surat-setneg-sptjm",
  laporanKegiatanCuid: "laporan-kegiatan",
  daftarHadirCuid: "daftar-hadir",
  dokumentasiKegiatanCuid: "dokumentasi-kegiatan",
  rampunganTerstempelCuid: "rampungan-terstempel",
  suratPersetujuanJaldisSetnegCuid: "surat-persetujuan-jaldis-setneg",
  pasporCuid: "paspor",
  tiketBoardingPassCuid: "tiket-boarding-pass",
  pesertaXlsxCuid: "peserta-xlsx",
};

export function getJenisDokumenFromKey(
  key: keyof typeof mapsCuidToJenisDokumen
): string | undefined {
  return mapsCuidToJenisDokumen[key];
}
