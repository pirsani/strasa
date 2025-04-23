"use server";

import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { dbHonorarium } from "@/lib/db-honorarium";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "../pengguna/session";
import { KegiatanIncludeSatker, ParamsGetKegiatan } from "./index";

export const getKegiatanHasStatusPengajuan = async (
  status: STATUS_PENGAJUAN | null
): Promise<KegiatanIncludeSatker[]> => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const pengguna = await getLoggedInPengguna();
  if (!pengguna) {
    return [];
  }

  const readOwn = await checkSessionPermission({
    actions: ["read:own"],
    resource: "workbench",
    redirectOnUnauthorized: false,
  });

  const readAny = await checkSessionPermission({
    actions: "read:any",
    resource: "workbench",
    redirectOnUnauthorized: false,
  });

  const satkerId = pengguna.satkerId;
  const unitKerjaId = pengguna.unitKerjaId;

  const params: ParamsGetKegiatan = {};
  if (readAny) {
    console.log("[workbench read:any]", pengguna);
    params.satkerId = satkerId!;
  } else if (readOwn) {
    console.log("[workbench read:own]", pengguna);
    params.unitKerjaId = unitKerjaId!;
  }

  const riwayatPengajuan = await dbHonorarium.riwayatPengajuan.findMany({
    where: {
      kegiatan: {
        tanggalMulai: {
          gte: new Date(`${tahunAnggaran}-01-01`),
          lte: new Date(`${tahunAnggaran}-12-31`),
        },
        ...(satkerId && { satkerId }),
        ...(unitKerjaId && { unitKerjaId }),
      },
      ...(status && { status }),
    },
    include: {
      kegiatan: {
        include: {
          satker: true,
          unitKerja: true,
        },
      },
    },
  });
  // filter unique kegiatan
  const kegiatan = riwayatPengajuan.map((item) => item.kegiatan);
  const kegiatanUnique = kegiatan.filter(
    (item, index, self) => index === self.findIndex((t) => t.id === item.id)
  );
  return kegiatanUnique;

  //return riwayatPengajuan.map((item) => item.kegiatan);
};

export const getCountStatusPengajuan = async (
  name: string
): Promise<number> => {
  // random number for testing
  const names = ["workbench", "pending"];
  if (!names.includes(name)) {
    return 0;
  }
  const tahunAnggaran = await getTahunAnggranPilihan();

  let status: STATUS_PENGAJUAN[] = [];

  const statusPengajuanWorkbench: STATUS_PENGAJUAN[] = [
    "DRAFT",
    "SUBMITTED",
    "REVISE",
    "REVISED",
    "VERIFIED",
    "APPROVED",
    "REQUEST_TO_PAY",
  ];

  const statusPengajuanPending: STATUS_PENGAJUAN[] = ["PAID"];

  switch (name) {
    case "workbench":
      status = statusPengajuanWorkbench;
      break;
    case "pending":
      status = statusPengajuanPending;
      break;
    default:
      break;
  }

  const countPengajuan = await dbHonorarium.riwayatPengajuan.count({
    where: {
      kegiatan: {
        tanggalMulai: {
          gte: new Date(`${tahunAnggaran}-01-01`),
          lte: new Date(`${tahunAnggaran}-12-31`),
        },
      },
      ...(status.length > 0 && { status: { in: status } }),
    },
  });

  // TODO get count dari database
  const randomNumber = Math.floor(Math.random() * 100);
  return countPengajuan;
};
