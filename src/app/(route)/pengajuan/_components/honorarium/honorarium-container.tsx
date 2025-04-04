"use client";
import { DialogTambahKelas } from "@/app/(route)/data-referensi/kelas/_components/dialog-tambah-kelas";
import { DialogTambahMateri } from "@/app/(route)/data-referensi/materi/_components/dialog-tambah-materi";
import DialogTambahNarasumber from "@/app/(route)/data-referensi/narasumber/_components/dialog-tambah-narasumber";
import DaftarJadwal from "@/components/kegiatan/honorarium/daftar-jadwal";
import { Kegiatan } from "@prisma-honorarium/client";
import { useState } from "react";
import TambahJadwalContainer from "./tambah-jadwal-container";

interface HonorariumContainerProps {
  kegiatan: Kegiatan;
}
const HonorariumContainer = ({ kegiatan }: HonorariumContainerProps) => {
  const [jadwalUpdatedAt, setJadwalUpdatedAt] = useState<number>(0);
  const handleOnSuccess = () => {
    setJadwalUpdatedAt(jadwalUpdatedAt + 1);
  };
  return (
    <div className="mt-6">
      <h1 className="font-semibold">Pengajuan Honorarium</h1>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-1 max-w-full">
          <div className="">
            <TambahJadwalContainer
              kegiatanId={kegiatan.id}
              onSuccess={handleOnSuccess}
            />
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
          <DaftarJadwal
            triggerUpdate={jadwalUpdatedAt}
            kegiatanId={kegiatan.id}
            proses={"PENGAJUAN"}
          />
        </div>
      </div>
    </div>
  );
};

export default HonorariumContainer;
