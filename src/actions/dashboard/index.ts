"use server";
import { getDistinctInStatusPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import { faker } from "@faker-js/faker";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";

export const getDataRealisasi = async (year: number) => {
  const pagu = faker.number.int({ min: 0, max: 2000 });
  const pembayaran = faker.number.int({ min: 0, max: pagu });
  const belumDibayar = faker.number.int({ min: 0, max: pagu - pembayaran });
  const sisa = pagu - pembayaran - belumDibayar;

  const data = [pagu, pembayaran, belumDibayar, sisa];
  console.log(data);
  return data;
};

export const countStatusPengajuan = async (year: number) => {
  const inStatus: STATUS_PENGAJUAN[] = [
    "SUBMITTED",
    "REVISE",
    "REQUEST_TO_PAY",
    "PAID",
    "END",
  ];
  const data = await getDistinctInStatusPengajuan(year, inStatus);
  return data;
};

export default getDataRealisasi;
