"use server";
import { getDataRealisasi } from "@/data/dasboard/realisasi";
import { getDistinctInStatusPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import { faker } from "@faker-js/faker";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";

export const getRealisasi = async (year: number) => {
  const dataRealisai = await getDataRealisasi(year);
  console.log(dataRealisai);

  let sudahDibayar = 0;
  let belumDibayar = 0;

  if (dataRealisai) {
    const unpaidItem = dataRealisai.find(
      (item) => item.payment_status === "BELUM"
    );
    const paidItem = dataRealisai.find(
      (item) => item.payment_status === "SUDAH"
    );

    sudahDibayar = paidItem ? Number(paidItem.total) : 0;
    belumDibayar = unpaidItem ? Number(unpaidItem.total) : 0;
  }

  const fakeMinPagu = sudahDibayar + belumDibayar;

  const pagu = faker.number.int({
    min: fakeMinPagu,
    max: fakeMinPagu + 100000000,
  });
  const sisa = pagu - sudahDibayar - belumDibayar;

  const data = [
    {
      name: "Pagu",
      total: pagu,
    },
    {
      name: "Sudah Dibayar",
      total: sudahDibayar,
    },
    {
      name: "Belum Dibayar",
      total: belumDibayar,
    },
    {
      name: "Sisa",
      total: sisa,
    },
  ];
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
