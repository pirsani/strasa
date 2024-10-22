"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { PesertaKegiatan, UhLuarNegeri } from "@prisma-honorarium/client";

export interface PesertaKegiatanLuarNegeri extends PesertaKegiatan {
  uhLuarNegeri: UhLuarNegeri[] | null;
}
const getPesertaKegiatanLuarNegeri = async (
  kegiatanId: string
): Promise<ActionResponse<PesertaKegiatanLuarNegeri[]>> => {
  const data = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId,
    },
    include: {
      uhLuarNegeri: true,
    },
  });

  console.log("[getPesertaKegiatanLuarNegeri]", data);
  return {
    success: true,
    data,
  };
};

export default getPesertaKegiatanLuarNegeri;
