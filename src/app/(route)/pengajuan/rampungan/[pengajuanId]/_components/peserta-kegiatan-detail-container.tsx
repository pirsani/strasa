"use client";
import TabelPesertaKegiatan from "@/app/(route)/kegiatan/[...slug]/_components/tabel-peserta";
import TabelPesertaKegiatanDalamNegeri from "@/app/(route)/kegiatan/[...slug]/_components/tabel-peserta-uh-dalam-negeri";
import TabelPesertaKegiatanLuarNegeri from "@/app/(route)/kegiatan/[...slug]/_components/tabel-peserta-uh-luar-negeri";
import { Button } from "@/components/ui/button";
import { KegiatanIncludeAllDetail } from "@/data/kegiatan";
import useFileStore from "@/hooks/use-file-store";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";

interface PesertaKegiatanDetailContainerProps {
  kegiatan: KegiatanIncludeAllDetail;
  className?: string;
}
const PesertaKegiatanDetailContainer = ({
  kegiatan,
  className = "",
}: PesertaKegiatanDetailContainerProps) => {
  const { fileUrl, isPreviewHidden } = useFileStore();
  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  const [eyeOn, setEyeOn] = useState(false);

  const toggleEye = () => {
    setEyeOn(!eyeOn);
  };

  const riwayatPengajuan = kegiatan?.riwayatPengajuan || [];

  const inStatus: STATUS_PENGAJUAN[] = [
    "SUBMITTED",
    "APPROVED",
    "REQUEST_TO_PAY",
    "PAID",
    "END",
    "DONE",
  ];

  const riwayatUhDalamNegeri = riwayatPengajuan.filter(
    (riwayat) =>
      riwayat.jenis === "UH_DALAM_NEGERI" && inStatus.includes(riwayat.status)
  );

  const riwayatUhLuarNegeri = riwayatPengajuan.filter(
    (riwayat) =>
      riwayat.jenis === "UH_LUAR_NEGERI" && inStatus.includes(riwayat.status)
  );

  useEffect(() => {
    handleOnHide();
  }, []);

  return (
    <div className={cn("flex gap-2 flex-col", eyeOn ? "w-full" : className)}>
      <div className="flex gap-2 items-center w-full justify-center">
        <Button
          variant={"outline"}
          onClick={toggleEye}
          className="flex gap-2 items-center w-full"
        >
          <Eye className={eyeOn ? "block" : "hidden"} />
          <EyeOff className={eyeOn ? "hidden" : "block"} />
          <span>Daftar Peserta</span>
        </Button>
      </div>
      <div className={cn("flex gap-2 flex-col w-full", { hidden: !eyeOn })}>
        <div className="flex flex-col w-full">
          <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
            Peserta Kegiatan
          </h1>
          <TabelPesertaKegiatan data={kegiatan?.pesertaKegiatan || []} />
        </div>

        {riwayatUhDalamNegeri.length > 0 && (
          <div className="flex flex-col w-full">
            <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
              Detail Uang Harian Peserta Kegiatan Dalam Negeri
            </h1>
            <TabelPesertaKegiatanDalamNegeri
              data={kegiatan?.pesertaKegiatan || []}
            />
          </div>
        )}
        {riwayatUhLuarNegeri.length > 0 && (
          <div className="flex flex-col w-full">
            <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
              Detail Uang Harian Peserta Kegiatan Dalam Negeri
            </h1>
            <TabelPesertaKegiatanLuarNegeri
              data={kegiatan?.pesertaKegiatan || []}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PesertaKegiatanDetailContainer;
