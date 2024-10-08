import { KegiatanWithDetail } from "@/actions/kegiatan";
import { JenisPengajuan } from "@/types";
import FormPengajuanGenerateRampungan from "../form-pengajuan-generate-rampungan";

interface DisplayFormPengajuanGenerateRampunganProps {
  jenisPengajuan?: JenisPengajuan | null;
  kegiatan: KegiatanWithDetail | null;
  handleSuccess: (kegiatan: KegiatanWithDetail) => void; // harusnya update ke atas
}

export const DisplayFormPengajuanGenerateRampungan = ({
  jenisPengajuan,
  kegiatan,
  handleSuccess,
}: DisplayFormPengajuanGenerateRampunganProps) => {
  if (!kegiatan) return null;

  // Render the form if GENERATE_RAMPUNGAN is selected and there's no existing rampungan
  if (jenisPengajuan === "GENERATE_RAMPUNGAN" && !kegiatan.statusRampungan) {
    return (
      <FormPengajuanGenerateRampungan
        kegiatanId={kegiatan.id}
        handleSuccess={handleSuccess}
      />
    );
  }

  // Render the status message if GENERATE_RAMPUNGAN is selected, rampungan exists, and is not verified
  const shouldShowStatusMessage =
    jenisPengajuan === "GENERATE_RAMPUNGAN" &&
    kegiatan.statusRampungan &&
    kegiatan.statusRampungan !== "terverifikasi";

  if (shouldShowStatusMessage) {
    return (
      <>
        <p className="text-red-500 ring-1 rounded-md p-2 mt-2 bg-green-200">
          <span>
            Pengajuan Generate Rampungan berhasil diajukan, petugas akan
            memverifikasi pengajuan Anda
          </span>
        </p>
        <p>{kegiatan.statusRampungan}</p>
        <p>{kegiatan.lokasi}</p>
      </>
    );
  }

  // Default return, you can add any fallback UI if needed
  return null;
};
