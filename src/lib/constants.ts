import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
export type {
  ALUR_PROSES,
  JENIS_PENGAJUAN,
  LOKASI,
  STATUS_PENGAJUAN,
} from "@prisma-honorarium/client";

// export type StatusLangkah =
//   | "Draft"
//   | "Submitted"
//   | "Revise"
//   | "Revised"
//   | "Verified"
//   | "Approved"
//   | "RequestToPay"
//   | "Paid"
//   | "End"
//   | null;

// export const validStatusLangkah: STATUS_PENGAJUAN[] = [
//   "Draft",
//   "Submitted",
//   "Revise",
//   "Revised",
//   "Verified",
//   "Approved",
//   "RequestToPay",
//   "Paid",
//   "End",
//   null,
// ];

// // Convert valid statuses to a Set for O(1) lookup performance
// const validStatusLangkahSet = new Set<StatusLangkah>(validStatusLangkah);

/**
 * Checks if a value is a valid StatusLangkah.
 *
 * @param value - The value to check.
 * @returns True if the value is a valid StatusLangkah, otherwise false.
//  */
// export function isValidStatusLangkah(value: unknown): value is StatusLangkah {
//   return validStatusLangkahSet.has(value as StatusLangkah);
// }

/**
 * Gets a valid StatusLangkah if the provided value matches, otherwise returns null.
 *
 * @param value - The value to check.
 * @returns The valid StatusLangkah or null if not valid.
 */
// export function getStatusLangkah(value: unknown): STATUS_PENGAJUAN {
//   return isValidStatusLangkah(value) ? (value as StatusLangkah) : null;
// }

export const getStatusPengajuan = (
  status: STATUS_PENGAJUAN | string | null
): STATUS_PENGAJUAN | null => {
  if (status === null || typeof status !== "string") return "DRAFT";
  return STATUS_PENGAJUAN[status as keyof typeof STATUS_PENGAJUAN] || null;
};

export const getJenisPengajuan = (
  jenis?: JENIS_PENGAJUAN | string | null
): JENIS_PENGAJUAN | null => {
  if (!jenis || jenis === null || typeof jenis !== "string") return null;
  return JENIS_PENGAJUAN[jenis as keyof typeof JENIS_PENGAJUAN] || null;
};

export const mapStatusLangkahToDesc = (status: STATUS_PENGAJUAN | null) => {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Diajukan";
    case "REVISE":
      return "Revisi/Perbaiki";
    case "REVISED":
      return "Telah diperbaiki";
    case "APPROVED":
      return "Disetujui";
    case "VERIFIED":
      return "Telah diverifikasi";
    case "REQUEST_TO_PAY":
      return "Permintaan pembayaran";
    case "PAID":
      return "Telah dibayar";
    case "DONE":
    case "END":
      return "Proses selesai";
    default:
      return "Belum diajukan";
  }
};

export const mapStatusLangkahToColor = (status: STATUS_PENGAJUAN | null) => {
  //return "text-white bg-red-800";
  switch (status) {
    case "DRAFT":
      return "bg-yellow-300 text-yellow-800";
    case "SUBMITTED":
      return "bg-blue-300 text-blue-800";
    case "REVISE":
      return "bg-yellow-300 text-yellow-800";
    case "REVISED":
      return "bg-yellow-300 text-yellow-800";
    case "VERIFIED":
      return "bg-green-200 text-green-600";
    case "APPROVED":
      return "bg-green-400 text-green-200 ";
    case "REQUEST_TO_PAY":
      return "bg-green-600 text-green-200";
    case "PAID":
      return "bg-green-700 text-white";
    case "DONE":
    case "END":
      return "bg-blue-700 text-white";
    default:
      return "text-red-500 bg-transparent";
  }
};
