import { KegiatanWithDetail } from "@/actions/kegiatan";
import getPesertaKegiatanDalamNegeri from "@/actions/kegiatan/peserta/dalam-negeri";
import { PesertaKegiatan } from "@prisma-honorarium/client";
import { useEffect, useState } from "react";
import { PesertaKegiatanTable } from "../../uang-harian/peserta-kegiatan-table-dalam-negeri";
import VerifikasiDataDukungUangHarianDalamNegeri from "./data-dukung-dalam-negeri";

interface UangHarianDalamNegeriContainerProps {
  kegiatan: KegiatanWithDetail | null;
}
const UangHarianDalamNegeriContainer = ({
  kegiatan,
}: UangHarianDalamNegeriContainerProps) => {
  const [peserta, setPeserta] = useState<PesertaKegiatan[] | null>(null);
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
      {peserta && <PesertaKegiatanTable data={peserta} />}
    </div>
  );
};

export default UangHarianDalamNegeriContainer;
