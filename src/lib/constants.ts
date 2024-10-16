export type StatusLangkah =
  | "Draft"
  | "Submitted"
  | "Revise"
  | "Revised"
  | "Verified"
  | "Approved"
  | "RequestToPay"
  | "Paid"
  | "End"
  | null;

export const validStatusLangkah: StatusLangkah[] = [
  "Draft",
  "Submitted",
  "Revise",
  "Revised",
  "Verified",
  "Approved",
  "RequestToPay",
  "Paid",
  "End",
  null,
];

// Convert valid statuses to a Set for O(1) lookup performance
const validStatusLangkahSet = new Set<StatusLangkah>(validStatusLangkah);

/**
 * Checks if a value is a valid StatusLangkah.
 *
 * @param value - The value to check.
 * @returns True if the value is a valid StatusLangkah, otherwise false.
 */
export function isValidStatusLangkah(value: unknown): value is StatusLangkah {
  return validStatusLangkahSet.has(value as StatusLangkah);
}

/**
 * Gets a valid StatusLangkah if the provided value matches, otherwise returns null.
 *
 * @param value - The value to check.
 * @returns The valid StatusLangkah or null if not valid.
 */
export function getStatusLangkah(value: unknown): StatusLangkah {
  return isValidStatusLangkah(value) ? (value as StatusLangkah) : null;
}

export const ALUR_PROSES = [
  "setup",
  "pengajuan",
  "verifikasi",
  "nominatif",
  "pembayaran",
  "selesai",
];

export type AlurProses =
  | "setup"
  | "pengajuan"
  | "verifikasi"
  | "nominatif"
  | "pembayaran"
  | "selesai"
  | null;

export const LANGKAH = [
  "setup",
  "pengajuan",
  "verifikasi",
  "nominatif",
  "pembayaran",
  "selesai",
];

export const mapStatusLangkahToDesc = (status: string | null) => {
  switch (status) {
    case "Draft":
      return "Draft";
    case "Submitted":
      return "Diajukan";
    case "Approved":
      return "Disetujui";
    case "Revise":
      return "Revisi/Perbaiki";
    case "Revised":
      return "Telah diperbaiki";
    case "Verified":
      return "Telah diverifikasi";
    case "RequestToPay":
      return "Permintaan pembayaran";
    case "Paid":
      return "Telah dibayar";
    case "End":
      return "Proses selesai";
    default:
      return "Belum diproses";
  }
};

export const mapStatusLangkahToColor = (status: string | null) => {
  //return "text-white bg-red-800";
  switch (status) {
    case "Draft":
      return "bg-yellow-300 text-yellow-800";
    case "Submitted":
      return "bg-blue-300 text-blue-800";
    case "Revise":
      return "bg-yellow-300 text-yellow-800";
    case "Revised":
      return "bg-yellow-300 text-yellow-800";
    case "Verified":
      return "bg-green-200 text-green-600";
    case "Approved":
      return "bg-green-400 text-green-200 ";
    case "RequestToPay":
      return "bg-green-600 text-green-200";
    case "Paid":
      return "bg-green-700 text-green-200";
    case "End":
      return "bg-blue-700 text-white";
    default:
      return "text-white bg-gray-800";
  }
};
