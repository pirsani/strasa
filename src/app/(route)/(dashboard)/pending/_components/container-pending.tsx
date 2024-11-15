import {
  KegiatanIncludeSatker,
  RiwayatPengajuanIncludePengguna,
} from "@/data/kegiatan/riwayat-pengajuan";
import TabelKegiatan from "./tabel-kegiatan";

interface ContainerProps {
  riwayatPengajuan: RiwayatPengajuanIncludePengguna[];
}
const Container = ({ riwayatPengajuan }: ContainerProps) => {
  const kegiatan: KegiatanIncludeSatker[] = riwayatPengajuan
    .map((riwayat) => riwayat.kegiatan)
    .filter(
      (kegiatan): kegiatan is KegiatanIncludeSatker => kegiatan !== undefined
    );

  return (
    <div>
      <div></div>
      <TabelKegiatan data={kegiatan} riwayatPengajuan={riwayatPengajuan} />
    </div>
  );
};

export default Container;
