import { DialogTambahKelas } from "@/app/(route)/data-referensi/kelas/_components/dialog-tambah-kelas";
import { DialogTambahMateri } from "@/app/(route)/data-referensi/materi/_components/dialog-tambah-materi";
import DialogTambahNarasumber from "@/app/(route)/data-referensi/narasumber/_components/dialog-tambah-narasumber";
import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import { Kegiatan } from "@prisma-honorarium/client";
import TambahJadwalContainer from "./tambah-jadwal-container";

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
            <TambahJadwalContainer kegiatanId={kegiatan.id} />
          </div>
          <div className="">
            <DialogTambahKelas
              kegiatanId={kegiatan.id}
              buttonVariant="outline"
            />
          </div>
          <div className="">
            <DialogTambahMateri buttonVariant="outline" />
          </div>
          <div className="w-1/4">
            <DialogTambahNarasumber buttonVariant="outline" />
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
