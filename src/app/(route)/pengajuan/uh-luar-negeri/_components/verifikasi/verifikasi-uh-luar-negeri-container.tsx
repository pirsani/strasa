import { PesertaKegiatanLuarNegeri } from "@/actions/kegiatan/peserta/luar-negeri";
import setujuiPengajuanUhLuarNegeri, {
  DetailUhLuarNegeriPeserta,
  revisiPengajuanUhLuarNegeri,
} from "@/actions/kegiatan/uang-harian/verifikasi-luar-negeri";
import { TabelHariPesertaKegiatan } from "@/app/(route)/verifikasi/_components/uang-harian/tabel-peserta-kegiatan-luar-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DokumenKegiatan, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import { Dispatch, SetStateAction, useState } from "react";
import DataDukungUangHarianLuarNegeriView from "../../../_components/data-dukung-uh-luar-negeri-view";
import FormVerifikasiUhLuarNegeri from "./form-verifikasi";

interface VerifikasiUhLuarNegeriContainerProps {
  kegiatanId: string;
  dokumenKegiatan?: DokumenKegiatan[] | null;
  pesertaKegiatan?: PesertaKegiatanLuarNegeri[] | null;
  updateStatus?: Dispatch<SetStateAction<STATUS_PENGAJUAN | null>>;
}
const VerifikasiUhLuarNegeriContainer = ({
  kegiatanId,
  dokumenKegiatan,
  pesertaKegiatan,
  updateStatus,
}: VerifikasiUhLuarNegeriContainerProps) => {
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanLuarNegeri[] | null
  >(null);
  const [detailUhLuarNegeriPeserta, setDetailUhLuarNegeriPeserta] = useState<
    DetailUhLuarNegeriPeserta[] | null
  >(null);
  const { toast } = useToast();

  const handleDataChange = (data: PesertaKegiatanLuarNegeri[]) => {
    setPesertaUpdated(data);
  };

  const handleDetailUhLuarNegeriPesertaChange = (
    data: DetailUhLuarNegeriPeserta[]
  ) => {
    //console.log("DetailUhLuarNegeriPeserta change");
    //console.log(data);
    setDetailUhLuarNegeriPeserta(data);
  };

  const handleSetuju = async () => {
    if (!pesertaUpdated) return;

    const updated = await setujuiPengajuanUhLuarNegeri(
      kegiatanId,
      pesertaUpdated,
      detailUhLuarNegeriPeserta
    );
    if (updated.success) {
      toast({
        title: "Verifikasi berhasil",
        description: "Pengajuan uang harian telah diverifikasi dan disetujui",
        action: <Button>OK</Button>,
      });
      updateStatus && updateStatus("APPROVED");
    } else {
      toast({
        title: "Terjadi kesalahan",
        description: `${updated.error} ${updated.message}`,
        duration: 9000,
      });
    }
  };

  const handleRevisi = async (catatanRevisi: string) => {
    const updated = await revisiPengajuanUhLuarNegeri(
      kegiatanId,
      catatanRevisi
    );
    if (updated.success) {
      toast({
        title: "Pengajuan dikembalikan",
        description: "Pengajuan uang harian telah dikembalikan ke revisi",
        duration: 9000,
      });
    } else {
      toast({
        title: "Terjadi kesalahan",
        description: `${updated.error} ${updated.message}`,
        duration: 9000,
      });
    }
    updateStatus && updateStatus("REVISE");
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <DataDukungUangHarianLuarNegeriView dokumenKegiatan={dokumenKegiatan} />
      <FormVerifikasiUhLuarNegeri
        kegiatanId={kegiatanId}
        onSetuju={handleSetuju}
        onRevisi={handleRevisi}
      />
      <FloatingComponent
        hide={isPreviewHidden}
        onHide={() => setIsPreviewHidden(true)}
      >
        <div className="flex flex-col w-full">
          <h1 className="bg-gray-500 text-gray-50 p-2 rounded-t-sm">
            Peserta Kegiatan
          </h1>
          <TabelHariPesertaKegiatan
            data={pesertaKegiatan || []}
            onDataChange={handleDataChange}
            onDetailUhLuarNegeriChange={handleDetailUhLuarNegeriPesertaChange}
          />
        </div>
      </FloatingComponent>
    </div>
  );
};

export default VerifikasiUhLuarNegeriContainer;
