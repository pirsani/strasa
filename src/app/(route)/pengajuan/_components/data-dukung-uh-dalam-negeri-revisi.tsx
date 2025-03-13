"use client";
import { updateStatusUhDalamNegeri } from "@/actions/kegiatan/proses";
import TextDokumenWithPreviewChangeButton from "@/components/kegiatan/text-dokumen-with-preview-change-button";
import { Button } from "@/components/ui/button";
import { DokumenKegiatan } from "@prisma-honorarium/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DataDukungUangHarianDalamNegeriRevisiProps {
  kegiatanId: string;
  dokumenKegiatan?: DokumenKegiatan[] | null;
}
const DataDukungUangHarianDalamNegeriRevisi = ({
  kegiatanId,
  dokumenKegiatan,
}: DataDukungUangHarianDalamNegeriRevisiProps) => {
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

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAjukanPerbaikan = async () => {
    setIsSubmitting(true);
    const updatedRiwayatPengajuan = await updateStatusUhDalamNegeri(
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
    <div
      id="VDDKUHDN-7189"
      className="w-full mt-6 border border-blue-500 rounded-lg"
    >
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

export default DataDukungUangHarianDalamNegeriRevisi;
