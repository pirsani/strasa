import { dbHonorarium } from "@/lib/db-honorarium";
import {
  Kota,
  SbmTransporDalamKotaPulangPergi,
  SbmTransporIbukotaKeKotaKab,
  SbmTransporJakartaKeKotaKabSekitar,
} from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmTransporDalamKotaPulangPergiPlainObject = Omit<
  SbmTransporDalamKotaPulangPergi,
  "besaran"
> & {
  besaran: number | Decimal;
};

export type SbmTransporIbukotaKeKotaKabPlainObject = Omit<
  SbmTransporIbukotaKeKotaKab,
  "besaran"
> & {
  besaran: number | Decimal;
};

export type SbmTransporJakartaKeKotaKabSekitarPlainObject = Omit<
  SbmTransporJakartaKeKotaKabSekitar,
  "besaran"
> & {
  besaran: number | Decimal;
  kota: Kota;
};

export const getSbmTransporDalamKotaPulangPergi = async (
  tahunAnggaran?: number
) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const sbmTransporDalamKotaPulangPergi =
    await dbHonorarium.sbmTransporDalamKotaPulangPergi.findMany({
      where: {
        tahun: tahun,
      },
      orderBy: {
        tahun: "asc",
      },
    });
  // Convert Decimal objects to plain numbers
  return sbmTransporDalamKotaPulangPergi;
};

export const getSbmTransporIbukotaKeKotaKab = async (
  tahunAnggaran?: number
) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const sbmTransporIbukotaKeKotaKab =
    await dbHonorarium.sbmTransporIbukotaKeKotaKab.findMany({
      where: {
        tahun: tahun,
      },
      orderBy: {
        tahun: "asc",
      },
    });
  // Convert Decimal objects to plain numbers
  return sbmTransporIbukotaKeKotaKab;
};

export const getSbmTransporJakartaKeKotaKabSekitar = async (
  tahunAnggaran?: number
) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const sbmTransporJakartaKeKotaKabSekitar =
    await dbHonorarium.sbmTransporJakartaKeKotaKabSekitar.findMany({
      where: {
        tahun: tahun,
      },
      include: {
        kota: true,
      },
      orderBy: {
        tahun: "asc",
      },
    });
  // Convert Decimal objects to plain numbers
  return sbmTransporJakartaKeKotaKabSekitar;
};
