"use server";
import { faker } from "@faker-js/faker";

export const getDataRealisasi = async (year: number) => {
  const pagu = faker.number.int({ min: 0, max: 2000 });
  const pembayaran = faker.number.int({ min: 0, max: pagu });
  const belumDibayar = faker.number.int({ min: 0, max: pagu - pembayaran });
  const sisa = pagu - pembayaran - belumDibayar;

  const data = [pagu, pembayaran, belumDibayar, sisa];
  console.log(data);
  return data;
};

export default getDataRealisasi;
