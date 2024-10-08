"use server";
import { LANGKAH, StatusLangkah } from "./constants";

// Define the Kegiatan interface with correct types
export interface Kegiatan {
  id: number;
  langkahSekarang: string;
  langkahSelanjutnya: string | null;
  status: StatusLangkah; // Ensure StatusLangkah includes all possible values
  updatedAt?: Date;
}

// Define the LogEntry interface for logging purposes
interface LogEntry {
  id: number;
  kegiatanId: string;
  langkahSekarang: string;
  langkahSelanjutnya: string | null;
  status: StatusLangkah;
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
  if (kegiatan.status === "End") {
    console.log("Kegiatan sudah selesai");
    return kegiatan;
  }

  // Handle different actions
  switch (aksi) {
    case "Revise":
      if (kegiatan.status !== "Paid") {
        kegiatan.status = "Revise";
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
    case "Draft":
      kegiatan.status = "Submitted";
      kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
        kegiatan.langkahSekarang,
        kegiatan.status
      );
      break;
    case "Submitted":
      if (kegiatan.langkahSelanjutnya === "selesai") {
        kegiatan.status = "Paid";
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
    case "Revised":
      kegiatan.status = "Submitted";
      kegiatan.langkahSekarang =
        kegiatan.langkahSelanjutnya || kegiatan.langkahSekarang;
      kegiatan.langkahSelanjutnya = tentukanLangkahSelanjutnya(
        kegiatan.langkahSekarang,
        kegiatan.status
      );
      break;
    case "Revise":
      kegiatan.status = "Revised";
      break;
    case "Paid":
      kegiatan.status = "End";
      break;
    case "End":
      console.log("Kegiatan sudah selesai");
      break;
    default:
      break;
  }
  return kegiatan;
};

// Determine the next step based on the current step and status
function tentukanLangkahSelanjutnya(
  langkahSekarang: string | null,
  statusBaru: StatusLangkah
): string | null {
  if (!langkahSekarang) return LANGKAH[0]; // Start from 'setup' if current step is null

  const currentIndex = LANGKAH.indexOf(langkahSekarang);
  if (currentIndex === -1 || currentIndex === LANGKAH.length - 1) return null; // Last step or not found

  // Move to the next step if status is 'Submitted' or 'Revised'
  return statusBaru === "Submitted" || statusBaru === "Revised"
    ? LANGKAH[currentIndex + 1]
    : null;
}
