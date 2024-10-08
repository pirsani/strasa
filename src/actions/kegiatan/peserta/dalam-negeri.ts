"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { PesertaKegiatan } from "@prisma-honorarium/client";

const getPesertaKegiatanDalamNegeri = async (
  kegiatanId: string
): Promise<ActionResponse<PesertaKegiatan[]>> => {
  const data = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId,
    },
  });

  console.log("[getPesertaKegiatanDalamNegeri]", data);
  return {
    success: true,
    data,
  };
};

export default getPesertaKegiatanDalamNegeri;
