import { PesertaKegiatanDalamNegeri } from "@/actions/kegiatan/peserta/dalam-negeri";
import setujuiPengajuanUhDalamNegeri, {
  revisiPengajuanUhDalamNegeri,
} from "@/actions/kegiatan/uang-harian/verifikasi-dalam-negeri";
import { TabelHariPesertaKegiatan } from "@/app/(route)/verifikasi/_components/uang-harian/tabel-peserta-kegiatan-dalam-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DokumenKegiatan, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import { Dispatch, SetStateAction, useState } from "react";
import DataDukungUangHarianDalamNegeriView from "../../../_components/data-dukung-uh-dalam-negeri-view";
import FormVerifikasiUhDalamNegeri from "./form-verifikasi";

interface VerifikasiUhDalamNegeriContainerProps {
  kegiatanId: string;
  dokumenKegiatan?: DokumenKegiatan[] | null;
  pesertaKegiatan?: PesertaKegiatanDalamNegeri[] | null;
  updateStatus?: Dispatch<SetStateAction<STATUS_PENGAJUAN | null>>;
}
const VerifikasiUhDalamNegeriContainer = ({
  kegiatanId,
  dokumenKegiatan,
  pesertaKegiatan,
  updateStatus,
}: VerifikasiUhDalamNegeriContainerProps) => {
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanDalamNegeri[] | null
  >(null);
  const { toast } = useToast();

  const handleDataChange = (data: PesertaKegiatanDalamNegeri[]) => {
    setPesertaUpdated(data);
  };

  const handleSetuju = async () => {
    if (!pesertaUpdated) return;

    const updated = await setujuiPengajuanUhDalamNegeri(
      kegiatanId,
      pesertaUpdated
    );
    if (updated.success) {
      toast({
        title: "Verifikasi berhasil",
        description: "Pengajuan uang harian telah diverifikasi dan disetujui",
        action: <Button>Undo</Button>,
      });
      updateStatus && updateStatus("APPROVED");
    }
  };

  const handleRevisi = async (catatanRevisi: string) => {
    const updated = await revisiPengajuanUhDalamNegeri(
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
      <DataDukungUangHarianDalamNegeriView dokumenKegiatan={dokumenKegiatan} />
      <FormVerifikasiUhDalamNegeri
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
          />
        </div>
      </FloatingComponent>
    </div>
  );
};

export default VerifikasiUhDalamNegeriContainer;
