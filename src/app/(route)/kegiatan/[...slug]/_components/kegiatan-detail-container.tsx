"use client";
import FloatingComponent from "@/components/floating-component";
import PdfPreviewContainer from "@/components/pdf-preview-container";
import { KegiatanIncludeAllDetail } from "@/data/kegiatan";
import useFileStore from "@/hooks/use-file-store";
import RiwayatPengajuan from "./riwayat-pengajuan";
import TabelPesertaKegiatan from "./tabel-peserta";

interface KegiatanDetailContainerProps {
  kegiatan: KegiatanIncludeAllDetail | null;
}
const KegiatanDetailContainer = ({
  kegiatan,
}: KegiatanDetailContainerProps) => {
  const { fileUrl, isPreviewHidden } = useFileStore();
  const handleOnHide = () => {
    useFileStore.setState({ isPreviewHidden: true });
  };

  return (
    <div className="flex gap-2 flex-col">
      <div>
        <TabelPesertaKegiatan data={kegiatan?.pesertaKegiatan || []} />
      </div>
      <div>
        <RiwayatPengajuan />
      </div>
      <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
        <PdfPreviewContainer className="border-2 h-full border-gray-500" />
      </FloatingComponent>
    </div>
  );
};

export default KegiatanDetailContainer;
