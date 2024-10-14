export type StatusLangkah =
  | "Draft"
  | "Submitted"
  | "Revise"
  | "Revised"
  | "Verified"
  | "Approved"
  | "Paid"
  | "End";

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
      return "bg-green-300 text-green-800";
    case "Approved":
      return "text-green-300 bg-red-800";
    case "Paid":
      return "bg-green-300 text-green-800";
    case "End":
      return "bg-green-300 text-green-800";
    default:
      return "text-white bg-gray-800";
  }
};
