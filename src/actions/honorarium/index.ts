"use server";

import { getObPlainJadwalByKegiatanIdWithStatusDisetujui } from "@/data/jadwal";
import { dbHonorarium } from "@/lib/db-honorarium";

export const getMateri = async (materi?: string) => {
  const dataMateri = await dbHonorarium.materi.findMany({});
  return dataMateri;
};

export const getOptionsMateri = async () => {
  const dataMateri = await dbHonorarium.materi.findMany({});
  // map dataMateri to options
  const optionsMateri = dataMateri.map((materi) => ({
    value: materi.id,
    label: materi.kode + "-" + materi.nama,
  }));

  return optionsMateri;
};

export const getNarasumber = async (narasumber?: string) => {
  const dataNarasumber = await dbHonorarium.narasumber.findMany({});
  return dataNarasumber;
};

export const getOptionsNarasumber = async () => {
  const dataNarasumber = await dbHonorarium.narasumber.findMany({});
  console.log("[NARASUMBER]", dataNarasumber);
  // map dataNarasumber to options
  const optionsNarasumber = dataNarasumber.map((narasumber) => ({
    value: narasumber.id,
    label: narasumber.id + "-" + narasumber.nama,
    //id: narasumber.id,
  }));

  return optionsNarasumber;
};

export interface OptionJadwal {
  value: string;
  label: string;
  kelas: string;
  materi: string;
  tanggal: string | Date;
}
export const getOptionsJadwalDisetujui = async (kegiatanId: string) => {
  const dataJadwal = await getObPlainJadwalByKegiatanIdWithStatusDisetujui(
    kegiatanId
  );
  const optionsJadwal: OptionJadwal[] = dataJadwal.map((jadwal) => ({
    value: jadwal.id,
    label: jadwal.kelas.nama + "-" + jadwal.materi.nama,
    kelas: jadwal.kelas.nama,
    materi: jadwal.materi.nama,
    tanggal: jadwal.tanggal.toString(),
  }));
  return optionsJadwal;
};
