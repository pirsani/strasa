import {
  KegiatanIncludeSatker,
  RiwayatPengajuanIncludePengguna,
} from "@/data/kegiatan/riwayat-pengajuan";
import TabelRiwayatPengajuan from "./tabel-riwayat-pengajuan";

interface ContainerProps {
  riwayatPengajuan: RiwayatPengajuanIncludePengguna[];
}
const Container = ({ riwayatPengajuan }: ContainerProps) => {
  // get distinct kegiatan from riwayatPengajuan
  const kegiatan: KegiatanIncludeSatker[] = Array.from(
    riwayatPengajuan
      .map((riwayat) => riwayat.kegiatan)
      .filter(
        (kegiatan): kegiatan is KegiatanIncludeSatker => kegiatan !== undefined
      )
      .reduce((map, kegiatan) => {
        map.set(kegiatan.id, kegiatan); // Assuming 'id' is a unique property of KegiatanIncludeSatker and is a string
        return map;
      }, new Map<string, KegiatanIncludeSatker>())
      .values()
  );

  return (
    <div>
      <TabelRiwayatPengajuan riwayatPengajuan={riwayatPengajuan} />
      {/* <TabelKegiatan data={kegiatan} riwayatPengajuan={riwayatPengajuan} /> */}
    </div>
  );
};

export default Container;
