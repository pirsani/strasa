"use client";
import FloatingComponent from "@/components/floating-component";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { KegiatanIncludeAllDetail } from "@/data/kegiatan";
import useFileStore from "@/hooks/use-file-store";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { useEffect } from "react";
import RiwayatPengajuan from "./riwayat-pengajuan";
import TabelPesertaKegiatan from "./tabel-peserta";
import TabelPesertaKegiatanDalamNegeri from "./tabel-peserta-uh-dalam-negeri";
import TabelPesertaKegiatanLuarNegeri from "./tabel-peserta-uh-luar-negeri";

interface KegiatanDetailContainerProps {
  kegiatan: KegiatanIncludeAllDetail;
}
const KegiatanDetailContainer = ({
  kegiatan,
}: KegiatanDetailContainerProps) => {
  const { fileUrl, isPreviewHidden } = useFileStore();
  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
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
    <div className="flex gap-2 flex-col">
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

      <div className="flex flex-col w-full">
        <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
          Riwayat Pengajuan
        </h1>
        <RiwayatPengajuan kegiatanId={kegiatan?.id || null} />
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default KegiatanDetailContainer;
