import { checkSessionPermission } from "@/actions/pengguna/session";
import { ALUR_PROSES, STATUS_PENGAJUAN } from "./constants";

export const checkPermissionAlurProses = async (
  statusPengajuan?: STATUS_PENGAJUAN | null
) => {
  let proses: ALUR_PROSES | null = null;

  const createAnyProsesPengajuan = await checkSessionPermission({
    actions: ["create:any"],
    resource: "proses-pengajuan",
    redirectOnUnauthorized: false,
  });

  const createOwnProsesPengajuan = await checkSessionPermission({
    actions: ["create:own"],
    resource: "proses-pengajuan",
    redirectOnUnauthorized: false,
  });

  const createAnyProsesVerifikasi = await checkSessionPermission({
    actions: ["create:any"],
    resource: "proses-verifikasi",
    redirectOnUnauthorized: false,
  });

  const createOwnProsesVerifikasi = await checkSessionPermission({
    actions: ["create:own"],
    resource: "proses-verifikasi",
    redirectOnUnauthorized: false,
  });

  const createAnyProsesNominatif = await checkSessionPermission({
    actions: ["create:any"],
    resource: "proses-daftar-nominatif",
    redirectOnUnauthorized: false,
  });

  const createOwnProsesNominatif = await checkSessionPermission({
    actions: ["create:own"],
    resource: "proses-daftar-nominatif",
    redirectOnUnauthorized: false,
  });

  const createAnyProsesPembayaran = await checkSessionPermission({
    actions: ["create:any"],
    resource: "proses-pembayaran",
    redirectOnUnauthorized: false,
  });

  const createOwnProsesPembayaran = await checkSessionPermission({
    actions: ["create:own"],
    resource: "proses-pembayaran",
    redirectOnUnauthorized: false,
  });

  if (
    !createAnyProsesPengajuan &&
    !createOwnProsesPengajuan &&
    !createAnyProsesVerifikasi &&
    !createOwnProsesVerifikasi &&
    !createAnyProsesNominatif &&
    !createOwnProsesNominatif &&
    !createAnyProsesPembayaran &&
    !createOwnProsesPembayaran
  ) {
    return false;
  }

  console.log("statusPengajuan", statusPengajuan);

  switch (statusPengajuan) {
    case "REVISE":
    case "DRAFT":
      proses = "PENGAJUAN";
      break;
    case "SUBMITTED":
    case "REVISED":
      createAnyProsesVerifikasi || createOwnProsesVerifikasi
        ? (proses = "VERIFIKASI")
        : null;
      break;
    case "APPROVED":
    case "VERIFIED":
      createAnyProsesNominatif || createOwnProsesNominatif
        ? (proses = "NOMINATIF")
        : null;
      break;
    case "REQUEST_TO_PAY":
      createAnyProsesPembayaran || createOwnProsesPembayaran
        ? (proses = "PEMBAYARAN")
        : null;
      break;
    case "PAID":
      proses = "SELESAI";
      break;
    case "END":
      proses = "SELESAI";
      break;
    default:
      console.log("default proses");
      createAnyProsesPengajuan || createOwnProsesPengajuan
        ? (proses = "PENGAJUAN")
        : null;
      break;
  }

  return {
    proses,
    createAnyProsesPengajuan,
    createOwnProsesPengajuan,
    createAnyProsesVerifikasi,
    createOwnProsesVerifikasi,
    createAnyProsesNominatif,
    createOwnProsesNominatif,
    createAnyProsesPembayaran,
    createOwnProsesPembayaran,
  };
};
