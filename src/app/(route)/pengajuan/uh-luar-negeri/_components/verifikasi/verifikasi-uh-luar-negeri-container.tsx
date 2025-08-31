import { PesertaKegiatanLuarNegeri } from "@/actions/kegiatan/peserta/luar-negeri";
import setujuiPengajuanUhLuarNegeri, {
  DetailUhLuarNegeriPeserta,
  revisiPengajuanUhLuarNegeri,
} from "@/actions/kegiatan/uang-harian/verifikasi-luar-negeri";
import { TabelHariPesertaKegiatan } from "@/app/(route)/verifikasi/_components/uang-harian/tabel-peserta-kegiatan-luar-negeri";
import FloatingComponent from "@/components/floating-component";
import { DokumenKegiatan, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
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
      toast.success("Pengajuan disetujui");
      updateStatus && updateStatus("APPROVED");
    } else {
      toast.error(`Terjadi kesalahan: ${updated.error} ${updated.message}`);
    }
  };

  const handleRevisi = async (catatanRevisi: string) => {
    const updated = await revisiPengajuanUhLuarNegeri(
      kegiatanId,
      catatanRevisi
    );
    if (updated.success) {
      toast.success("Pengajuan dikembalikan ke revisi");
    } else {
      toast.error(`Terjadi kesalahan: ${updated.error} ${updated.message}`);
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
