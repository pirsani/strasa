"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { PesertaKegiatan, UhDalamNegeri } from "@prisma-honorarium/client";

export interface PesertaKegiatanDalamNegeri extends PesertaKegiatan {
  uhDalamNegeri: UhDalamNegeri | null;
}
const getPesertaKegiatanDalamNegeri = async (
  kegiatanId: string
): Promise<ActionResponse<PesertaKegiatanDalamNegeri[]>> => {
  const data = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId,
    },
    include: {
      uhDalamNegeri: true,
    },
  });

  console.log("[getPesertaKegiatanDalamNegeri]", data);
  return {
    success: true,
    data,
  };
};

export default getPesertaKegiatanDalamNegeri;
