import { KegiatanWithDetail } from "@/actions/kegiatan";
import getPesertaKegiatanDalamNegeri, {
  PesertaKegiatanDalamNegeri,
} from "@/actions/kegiatan/peserta/dalam-negeri";
import setujuiPengajuanUhDalamNegeri from "@/actions/kegiatan/uang-harian/verifikasi-dalam-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import VerifikasiDataDukungUangHarianDalamNegeri from "./data-dukung-dalam-negeri";
import { TabelHariPesertaKegiatan } from "./tabel-peserta-kegiatan-dalam-negeri";

interface UangHarianDalamNegeriContainerProps {
  kegiatan: KegiatanWithDetail;
}
const UangHarianDalamNegeriContainer = ({
  kegiatan,
}: UangHarianDalamNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatanDalamNegeri[] | null>(
    null
  );
  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanDalamNegeri[] | null
  >(null);
  const [isPreviewHidden, setIsPreviewHidden] = useState(false);
  const handleOnHide = () => {
    setIsPreviewHidden(true);
  };

  useEffect(() => {
    const getPesertaKegiatan = async () => {
      if (!kegiatan) return;
      const peserta = await getPesertaKegiatanDalamNegeri(kegiatan.id);
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

  const handleDataChange = (data: PesertaKegiatanDalamNegeri[]) => {
    setPesertaUpdated(data);
  };

  const handleSimpanUpdatedData = () => {
    if (pesertaUpdated) {
      console.log("pesertaUpdated", pesertaUpdated);
    }
  };

  const handleSetujuVerifikasiUhDalamNegeri = async () => {
    if (!kegiatan || !pesertaUpdated) {
      toast.error("Silakan periksa kembali data peserta");
      return;
    }
    const updated = await setujuiPengajuanUhDalamNegeri(
      kegiatan?.id,
      pesertaUpdated
    );
    if (updated.success) {
      toast.success(
        "Berhasil menverifikasi data peserta dan menyetujui pengajuan"
      );
    } else {
      toast.error(`Terjadi kesalahan ${updated.error} ${updated.message}`);
    }
  };

  return (
    <div>
      <VerifikasiDataDukungUangHarianDalamNegeri
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
            />
            {/* <div className="flex w-full justify-end p-4 gap-2">
              <Button type="button" onClick={handleSimpanUpdatedData}>
                Simpan
              </Button>
              <Button
                type="button"
                variant={"outline"}
                onClick={() => setIsPreviewHidden(true)}
              >
                Tutup
              </Button>
            </div> */}
          </FloatingComponent>
        </>
      )}

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
            onClick={handleSetujuVerifikasiUhDalamNegeri}
          >
            Setuju
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UangHarianDalamNegeriContainer;
