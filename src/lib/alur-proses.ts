"use server";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
//import { LANGKAH } from "./constants";

// Define the Kegiatan interface with correct types
export interface Kegiatan {
  id: number;
  langkahSekarang: string;
  langkahSelanjutnya: string | null;
  status: STATUS_PENGAJUAN; // Ensure StatusLangkah includes all possible values
  updatedAt?: Date;
}

// Define the LogEntry interface for logging purposes
interface LogEntry {
  id: number;
  kegiatanId: string;
  langkahSekarang: string;
  langkahSelanjutnya: string | null;
  status: STATUS_PENGAJUAN;
  createdAt: Date;
}

// Define the possible actions
type Aksi = "Proceed" | "Revise";

// Main function to update the Kegiatan status and steps
export const updateAlurLangkah = async (
  kegiatan: Kegiatan,
  aksi: Aksi
): Promise<Kegiatan> => {
  console.log("[SEBELUM]", kegiatan);
  console.log("[AKSI]", aksi);

  // Handle the 'End' status case
  if (kegiatan.status === "END") {
    console.log("Kegiatan sudah selesai");
    return kegiatan;
  }

  // Handle different actions
  switch (aksi) {
    case "Revise":
      if (kegiatan.status !== "PAID") {
        kegiatan.status = "REVISE";
      }
      break;
    case "Proceed":
      kegiatan = handleProceedAction(kegiatan);
      break;
    default:
      console.log("Aksi tidak dikenal");
  }

  // Update the timestamp
  kegiatan.updatedAt = new Date();

  console.log("[SESUDAH]", kegiatan);

  return kegiatan;

  // Optional logging function
  // logFlowPost(kegiatan.id, kegiatan.langkahSekarang, kegiatan.langkahSelanjutnya, kegiatan.status);
};

// Function to handle 'Proceed' actions based on current status
const handleProceedAction = (kegiatan: Kegiatan): Kegiatan => {
  switch (kegiatan.status) {
    case "DRAFT":
      kegiatan.status = "SUBMITTED";
      kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
        kegiatan.langkahSekarang,
        kegiatan.status
      );
      break;
    case "SUBMITTED":
      if (kegiatan.langkahSelanjutnya === "END") {
        kegiatan.status = "PAID";
        kegiatan.langkahSelanjutnya = "selesai"; // Stay at the final step
      } else {
        kegiatan.langkahSekarang =
          kegiatan.langkahSelanjutnya || kegiatan.langkahSekarang;
        kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
          kegiatan.langkahSekarang,
          kegiatan.status
        );
      }
      break;
    case "REVISE":
      kegiatan.status = "SUBMITTED";
      kegiatan.langkahSekarang =
        kegiatan.langkahSelanjutnya || kegiatan.langkahSekarang;
      kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
        kegiatan.langkahSekarang,
        kegiatan.status
      );
      break;
    case "REVISED":
      kegiatan.status = "VERIFIED";
      break;
    case "PAID":
      kegiatan.status = "END";
      break;
    case "END":
      console.log("Kegiatan sudah selesai");
      break;
    default:
      break;
  }
  return kegiatan;
};

const STATUS_PENGAJUAN_ARRAY: STATUS_PENGAJUAN[] = [
  "DRAFT",
  "SUBMITTED",
  "REVISE",
  "REVISED",
  "VERIFIED",
  "APPROVED",
  "REQUEST_TO_PAY",
  "PAID",
  "DONE",
  "END",
];
// Determine the next step based on the current step and status
function tentukanLangkahSelanjutnya(
  langkahSekarang: string | null,
  statusBaru: STATUS_PENGAJUAN
): string | null {
  if (!langkahSekarang) return STATUS_PENGAJUAN_ARRAY[0]; // Start from 'setup' if current step is null

  const currentIndex = STATUS_PENGAJUAN_ARRAY.indexOf(
    langkahSekarang as STATUS_PENGAJUAN
  );
  if (currentIndex === -1 || currentIndex === STATUS_PENGAJUAN_ARRAY.length - 1)
    return null; // Last step or not found

  // Move to the next step if status is 'Submitted' or 'Revised'
  return statusBaru === "SUBMITTED" || statusBaru === "REVISED"
    ? STATUS_PENGAJUAN_ARRAY[currentIndex + 1]
    : null;
}
