import { KegiatanWithDetail } from "@/actions/kegiatan";
import getPesertaKegiatanDalamNegeri, {
  PesertaKegiatanDalamNegeri,
} from "@/actions/kegiatan/peserta/dalam-negeri";
import FloatingComponent from "@/components/floating-component";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { PesertaKegiatanTable } from "../../uang-harian/peserta-kegiatan-table-dalam-negeri";
import VerifikasiDataDukungUangHarianDalamNegeri from "./data-dukung-dalam-negeri";

interface UangHarianDalamNegeriContainerProps {
  kegiatan: KegiatanWithDetail | null;
}
const UangHarianDalamNegeriContainer = ({
  kegiatan,
}: UangHarianDalamNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatanDalamNegeri[] | null>(
    null
  );
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
            <PesertaKegiatanTable data={peserta} />
          </FloatingComponent>
        </>
      )}
    </div>
  );
};

export default UangHarianDalamNegeriContainer;
