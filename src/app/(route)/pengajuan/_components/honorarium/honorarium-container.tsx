import TambahNarasumber from "@/approute/data-referensi/narasumber/_components/tambah-narasumber";
import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import { Kegiatan } from "@prisma-honorarium/client";
import TambahJadwalContainer from "./tambah-jadwal-container";
import TambahKelasContainer from "./tambah-kelas-container";
import TambahMateriContainer from "./tambah-materi-container";

interface HonorariumContainerProps {
  kegiatan: Kegiatan;
}
const HonorariumContainer = ({ kegiatan }: HonorariumContainerProps) => {
  return (
    <div className="mt-6">
      <h1 className="font-semibold">Pengajuan Honorarium</h1>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-1 max-w-full">
          <div className="">
            <TambahJadwalContainer />
          </div>
          <div className="">
            <TambahKelasContainer />
          </div>
          <div className="">
            <TambahMateriContainer />
          </div>
          <div className="w-1/4">
            <TambahNarasumber />
          </div>
        </div>

        <div>
          <DaftarJadwal kegiatanId={kegiatan.id} proses={"pengajuan"} />
        </div>
      </div>
    </div>
  );
};

export default HonorariumContainer;
