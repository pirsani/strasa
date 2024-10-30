import { KegiatanWithDetail } from "@/actions/kegiatan";
import {
  getPesertaKegiatanLuarNegeriExcludeIDN,
  PesertaKegiatanLuarNegeri,
} from "@/actions/kegiatan/peserta/luar-negeri";
import setujuiPengajuanUhLuarNegeri, {
  DetailUhLuarNegeriPeserta,
} from "@/actions/kegiatan/uang-harian/verifikasi-luar-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import VerifikasiDataDukungUangHarianLuarNegeri from "./data-dukung-luar-negeri";
import { TabelHariPesertaKegiatan } from "./tabel-peserta-kegiatan-luar-negeri";

interface UangHarianLuarNegeriContainerProps {
  kegiatan: KegiatanWithDetail;
}
const UangHarianLuarNegeriContainer = ({
  kegiatan,
}: UangHarianLuarNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatanLuarNegeri[] | null>(
    null
  );

  const [detailUhLuarNegeriPeserta, setDetailUhLuarNegeriPeserta] = useState<
    DetailUhLuarNegeriPeserta[] | null
  >(null);

  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanLuarNegeri[] | null
  >(null);
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const handleOnHide = () => {
    setIsPreviewHidden(true);
  };

  useEffect(() => {
    const getPesertaKegiatan = async () => {
      if (!kegiatan) return;
      const peserta = await getPesertaKegiatanLuarNegeriExcludeIDN(kegiatan.id);
      if (peserta.success) {
        setPeserta(peserta.data);
        console.log(peserta.data);
      } else {
        setPeserta(null);
        console.error(peserta.message);
      }
    };
    getPesertaKegiatan();
  }, [kegiatan]);

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

  const handleSimpanUpdatedData = () => {
    if (pesertaUpdated) {
      console.log("pesertaUpdated", pesertaUpdated);
    }
  };

  const handleSetujuVerifikasiUhLuarNegeri = async () => {
    if (!kegiatan || !pesertaUpdated) {
      toast.error("Silakan periksa kembali data peserta");
      return;
    }
    const updated = await setujuiPengajuanUhLuarNegeri(
      kegiatan?.id,
      pesertaUpdated,
      detailUhLuarNegeriPeserta
    );
    if (updated.success) {
      toast.success(
        "Berhasil menverifikasi data peserta dan menyetujui pengajuan"
      );
    } else {
      toast.error(`Terjadi kesalahan ${updated.error} ${updated.message}`);
    }
  };

  const riwayatPengajuan = kegiatan?.riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "UH_LUAR_NEGERI"
  );

  if (!riwayatPengajuan) {
    return <div>Belum ada data pengajuan uang harian luar negeri</div>;
  }

  const statusPengajuan = riwayatPengajuan.status;

  return (
    <div>
      <VerifikasiDataDukungUangHarianLuarNegeri
        dokumenKegiatan={kegiatan?.dokumenKegiatan}
      />
      {peserta && (
        <>
          <Button
            type="button"
            onClick={() => setIsPreviewHidden(false)}
            className={cn("m-1", !isPreviewHidden && "hidden")}
          >
            Lihat Daftar Peserta
          </Button>
          <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
            <TabelHariPesertaKegiatan
              data={peserta}
              onDataChange={handleDataChange}
              onDetailUhLuarNegeriChange={handleDetailUhLuarNegeriPesertaChange}
            />
          </FloatingComponent>
        </>
      )}

      {statusPengajuan === "SUBMITTED" && (
        <div className="flex flex-col w-full gap-2">
          <div>
            <h3 className="text-lg font-bold">Keterangan Revisi</h3>
            <textarea
              className="w-full h-24 border border-gray-300 rounded p-2 ring-blue-500 outline-red-500"
              placeholder="Tulis catatan disini"
            ></textarea>
          </div>
          <div className="flex flex-row gap-2">
            <Button
              type="button"
              className="w-1/3"
              variant={"destructive"}
              onClick={handleSimpanUpdatedData}
            >
              Revisi
            </Button>
            <Button
              type="button"
              className="w-full"
              onClick={handleSetujuVerifikasiUhLuarNegeri}
            >
              Setuju
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UangHarianLuarNegeriContainer;
