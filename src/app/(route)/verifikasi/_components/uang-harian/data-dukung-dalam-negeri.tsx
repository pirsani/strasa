import TextDokumenWithPreviewButton from "@/components/kegiatan/text-dokumen-with-preview-button";
import { DokumenKegiatan } from "@prisma-honorarium/client";
interface VerifikasiDataDukungUangHarianDalamNegeriProps {
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const VerifikasiDataDukungUangHarianDalamNegeri = ({
  dokumenKegiatan,
}: VerifikasiDataDukungUangHarianDalamNegeriProps) => {
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
  return (
    <div className="">
      <h1 className="font-semibold text-lg py-2 p-2 border-b border-gray-300">
        Data Dukung Pengajuan Uang Harian Dalam Negeri
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
        </div>
      </div>
    </div>
  );
};

export default VerifikasiDataDukungUangHarianDalamNegeri;
