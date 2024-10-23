"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { PesertaKegiatan, UhLuarNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export interface PesertaKegiatanLuarNegeri extends PesertaKegiatan {
  uhLuarNegeri: PlainObjUhLuarNegeri[] | null;
}

export type PlainObjUhLuarNegeri = Omit<
  UhLuarNegeri,
  "uhPerjalanan" | "uhUangHarian" | "uhDiklat"
> & {
  uhPerjalanan: number | Decimal | null;
  uhUangHarian: number | Decimal | null;
  uhDiklat: number | Decimal | null;
};

export const getPesertaKegiatanLuarNegeriExcludeIDN = async (
  kegiatanId: string
): Promise<ActionResponse<PesertaKegiatanLuarNegeri[]>> => {
  const data = await dbHonorarium.pesertaKegiatan.findMany({
    where: {
      kegiatanId,
    },
    include: {
      uhLuarNegeri: {
        where: {
          keLokasiId: {
            not: "IDN",
          },
        },
      },
    },
  });

  const plainObjPesertaKegiatanLuarNegeri =
    convertSpecialTypesToPlain<PesertaKegiatanLuarNegeri[]>(data);
  return {
    success: true,
    data: plainObjPesertaKegiatanLuarNegeri,
  };
};

export default getPesertaKegiatanLuarNegeriExcludeIDN;
