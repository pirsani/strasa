"use client";
import TextDokumenWithPreviewButton from "@/components/kegiatan/text-dokumen-with-preview-button";
import { DokumenKegiatan } from "@prisma-honorarium/client";
interface VerifikasiDataDukungUangHarianLuarNegeriProps {
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const VerifikasiDataDukungUangHarianLuarNegeri = ({
  dokumenKegiatan,
}: VerifikasiDataDukungUangHarianLuarNegeriProps) => {
  const laporanKegiatan = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "laporan-kegiatan"
  );
  const daftarHadir = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "daftar-hadir"
  );
  const dokumentasi = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "dokumentasi-kegiatan"
  );
  const rampungan = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "rampungan-terstempel"
  );

  const suratPersetujuanJaldisSetneg = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "surat-persetujuan-jaldis-setneg"
  );

  const paspor = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "paspor"
  );

  const tikerBoardingPass = dokumenKegiatan?.find(
    (dokumen) => dokumen.jenisDokumenId === "tiket-boarding-pass"
  );

  return (
    <div className="" id="VDDKUHLN-8789">
      <h1 className="font-semibold text-lg py-2 p-2 border-b border-gray-300">
        Data Dukung Pengajuan Uang Harian Luar Negeri
      </h1>
      <div className="flex flex-col gap-8 p-2 pb-8">
        <div className="w-full flex flex-col gap-2">
          <TextDokumenWithPreviewButton
            label="Laporan Kegiatan"
            dokumen={laporanKegiatan}
          />
          <TextDokumenWithPreviewButton
            label="Daftar Hadir"
            dokumen={daftarHadir}
          />
          <TextDokumenWithPreviewButton
            label="Dokumentasi"
            dokumen={dokumentasi}
          />
          <TextDokumenWithPreviewButton
            label="Rampungan yang distempel"
            dokumen={rampungan}
          />

          <TextDokumenWithPreviewButton
            label="Surat Persetujuan Jaldis Setneg"
            dokumen={suratPersetujuanJaldisSetneg}
          />

          <TextDokumenWithPreviewButton label="Paspor" dokumen={paspor} />

          <TextDokumenWithPreviewButton
            label="Tiket Boarding Pass"
            dokumen={tikerBoardingPass}
          />
        </div>
      </div>
    </div>
  );
};

export default VerifikasiDataDukungUangHarianLuarNegeri;
