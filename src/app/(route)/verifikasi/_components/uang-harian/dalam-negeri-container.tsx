import { KegiatanWithDetail } from "@/actions/kegiatan";
import getPesertaKegiatanDalamNegeri, {
  PesertaKegiatanDalamNegeri,
} from "@/actions/kegiatan/peserta/dalam-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import VerifikasiDataDukungUangHarianDalamNegeri from "./data-dukung-dalam-negeri";
import { TabelHariPesertaKegiatan } from "./tabel-peserta-kegiatan-dalam-negeri";

interface UangHarianDalamNegeriContainerProps {
  kegiatan: KegiatanWithDetail | null;
}
const UangHarianDalamNegeriContainer = ({
  kegiatan,
}: UangHarianDalamNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatanDalamNegeri[] | null>(
    null
  );
  const [pesertaUpdated, setPesertaUpdated] = useState<
    PesertaKegiatanDalamNegeri[] | null
  >();
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

  return (
    <div>
      <VerifikasiDataDukungUangHarianDalamNegeri
        dokumenKegiatan={kegiatan?.dokumenKegiatan}
      />
      {peserta && (
        <>
          <Button type="button" onClick={() => setIsPreviewHidden(false)}>
            Daftar Peserta
          </Button>
          <FloatingComponent hide={isPreviewHidden} onHide={handleOnHide}>
            <TabelHariPesertaKegiatan
              data={peserta}
              onDataChange={handleDataChange}
            />
            <div className="flex w-full justify-end p-4 gap-2">
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
            </div>
          </FloatingComponent>
        </>
      )}
    </div>
  );
};

export default UangHarianDalamNegeriContainer;
