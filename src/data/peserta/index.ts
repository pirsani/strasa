import { dbHonorarium } from "@/lib/db-honorarium";
import { Peserta } from "@prisma-honorarium/client";

export type PesertaWithStringDate = Omit<Peserta, "createdAt" | "updatedAt"> & {
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

export const getPeserta = async () => {
  const peserta = await dbHonorarium.peserta.findMany({});
  return peserta;
};
