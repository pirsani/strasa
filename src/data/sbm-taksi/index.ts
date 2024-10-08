import { dbHonorarium } from "@/lib/db-honorarium";
import { Provinsi, SbmTaksi } from "@prisma-honorarium/client";
import Decimal from "decimal.js";

export type SbmTaksiPlainObject = Omit<
  SbmTaksi,
  "besaran" | "createdAt" | "updatedAt" // kita omit karena klo decimal dia g bs di passing dari server ke client component
> & {
  besaran: Decimal | number;
  createdAt: Date | string;
  updatedAt: Date | string;
  provinsi: Provinsi;
};

const getReferensiSbmTaksi = async () => {
  const sbmTaksi = await dbHonorarium.sbmTaksi.findMany({
    orderBy: {
      tahun: "asc",
    },
    include: {
      provinsi: true,
    },
  });
  // Convert Decimal objects to plain numbers
  return sbmTaksi;
};

export default getReferensiSbmTaksi;
