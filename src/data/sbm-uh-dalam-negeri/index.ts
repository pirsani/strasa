import { dbHonorarium } from "@/lib/db-honorarium";
import { Provinsi, SbmUhDalamNegeri } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmUhDalamNegeriPlainObject = Omit<
  SbmUhDalamNegeri,
  | "fullboard"
  | "fulldayHalfday"
  | "luarKota"
  | "dalamKota"
  | "diklat"
  | "createdAt"
  | "updatedAt" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  fullboard: Decimal | number;
  fulldayHalfday: Decimal | number;
  luarKota: Decimal | number;
  dalamKota: Decimal | number;
  diklat: Decimal | number;
  createdAt: Date | string;
  updatedAt: Date | string;
  provinsi: Provinsi;
};

const getReferensiSbmUhDalamNegeri = async (tahunAnggaran?: number) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const sbmUhDalamNegeri = await dbHonorarium.sbmUhDalamNegeri.findMany({
    where: {
      tahun: tahun,
    },
    orderBy: {
      tahun: "asc",
    },
    include: {
      provinsi: true,
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmUhDalamNegeri;
};

export default getReferensiSbmUhDalamNegeri;
