import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { dbHonorarium } from "@/lib/db-honorarium";
import { SbmHonorarium } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmHonorariumWithNumber = Omit<
  SbmHonorarium,
  "besaran" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  besaran: Decimal | number;
};

export type SbmHonorariumPlainObject = Omit<
  SbmHonorarium,
  "besaran" | "createdAt" | "updatedAt"
> & {
  besaran: Decimal | number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const getReferensiSbmHonorarium = async (tahunAnggaran?: number) => {
  const tahun = tahunAnggaran || new Date().getFullYear();
  const sbmHonorarium = await dbHonorarium.sbmHonorarium.findMany({
    where: {
      tahun: tahun,
    },
    orderBy: {
      tahun: "asc",
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmHonorarium;
};

export default getReferensiSbmHonorarium;
