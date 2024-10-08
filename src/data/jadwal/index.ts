"use server";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  Jadwal,
  JadwalNarasumber,
  Kelas,
  Materi,
  Narasumber,
} from "@prisma-honorarium/client";

export interface JadwalNarsum extends JadwalNarasumber {
  narasumber: Narasumber;
}

export interface Narsum extends Narasumber {}

export interface JadwalKelasNarasumber extends Jadwal {
  kelas: Kelas;
  materi: Materi;
  jadwalNarasumber: JadwalNarsum[];
}
export const getJadwalByKegiatanId = async (
  kegiatanId: string
): Promise<JadwalKelasNarasumber[]> => {
  const jadwal = await dbHonorarium.jadwal.findMany({
    where: {
      kegiatanId: kegiatanId,
    },
    include: {
      kelas: true,
      materi: true,
      jadwalNarasumber: {
        include: {
          narasumber: true,
        },
      },
    },
  });
  console.log(["[kegiatanId]"], kegiatanId);
  console.log(["[JadwalKelasNarasumber]"], jadwal);

  return jadwal;
};
