"use server";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getDataRealisasi } from "@/data/dasboard/realisasi";
import { getDistinctInStatusPengajuan } from "@/data/kegiatan/riwayat-pengajuan";
import {
  getPaguRealisasiUnitKerjaBySatker,
  getPaguUnitKerja,
  type ResultPaguRealisasi,
} from "@/data/pagu";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";

export type { ResultPaguRealisasi };

export const getPaguRealisasi = async (
  year: number
): Promise<ResultPaguRealisasi[]> => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    // redirect to login page
    return [];
  }

  const paguRealisasi = await getPaguRealisasiUnitKerjaBySatker(
    year,
    pengguna.data.satkerId
  );
  return paguRealisasi;
};

export const getRealisasi = async (year: number) => {
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    // redirect to login page
    return [];
  }

  let pagu = 0;
  const dataRealisai = await getDataRealisasi(pengguna.data.satkerId, year);
  const PaguSatker = await getPaguUnitKerja(pengguna.data.satkerId, year);

  if (!PaguSatker) {
    pagu = 0;
  } else {
    pagu = Number(PaguSatker.pagu);
  }

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
