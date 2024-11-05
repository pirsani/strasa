"use client";
import { updateStatusUhLuarNegeri } from "@/actions/kegiatan/proses";
import TextDokumenWithPreviewChangeButton from "@/components/kegiatan/text-dokumen-with-preview-change-button";
import { Button } from "@/components/ui/button";
import { DokumenKegiatan } from "@prisma-honorarium/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DataDukungUangHarianLuarNegeriRevisiProps {
  kegiatanId: string;
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const DataDukungUangHarianLuarNegeriRevisi = ({
  kegiatanId,
  dokumenKegiatan,
}: DataDukungUangHarianLuarNegeriRevisiProps) => {
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

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAjukanPerbaikan = async () => {
    setIsSubmitting(true);
    const updatedRiwayatPengajuan = await updateStatusUhLuarNegeri(
      kegiatanId,
      "SUBMITTED"
    );
    if (updatedRiwayatPengajuan.success) {
      toast.success("Berhasil mengajukan perbaikan");
      router.push(`/kegiatan/${kegiatanId}`);
    } else {
      toast.error("Gagal mengajukan perbaikan");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="" id="VDDKUHLN-8789">
      <h1 className="font-semibold text-lg py-2 p-2 border-b border-gray-300">
        Data Dukung Pengajuan Uang Harian Luar Negeri
      </h1>
      <div className="flex flex-col gap-8 p-2 pb-8">
        <div className="w-full flex flex-col gap-2">
          <TextDokumenWithPreviewChangeButton
            label="Laporan Kegiatan"
            dokumen={laporanKegiatan}
          />
          <TextDokumenWithPreviewChangeButton
            label="Daftar Hadir"
            dokumen={daftarHadir}
          />
          <TextDokumenWithPreviewChangeButton
            label="Dokumentasi"
            dokumen={dokumentasi}
          />
          <TextDokumenWithPreviewChangeButton
            label="Rampungan yang distempel"
            dokumen={rampungan}
          />

          <TextDokumenWithPreviewChangeButton
            label="Surat Persetujuan Jaldis Setneg"
            dokumen={suratPersetujuanJaldisSetneg}
          />

          <TextDokumenWithPreviewChangeButton label="Paspor" dokumen={paspor} />

          <TextDokumenWithPreviewChangeButton
            label="Tiket Boarding Pass"
            dokumen={tikerBoardingPass}
          />
        </div>
        <div className="w-full">
          <Button
            className="w-full bg-blue-500 hover:bg-blue-600"
            type="button"
            onClick={handleAjukanPerbaikan}
            disabled={isSubmitting}
          >
            Ajukan Perbaikan {isSubmitting && "..."}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataDukungUangHarianLuarNegeriRevisi;
