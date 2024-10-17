import { KegiatanWithDetail } from "@/actions/kegiatan";
import { JENIS_PENGAJUAN } from "@prisma-honorarium/client";
import FormPengajuanGenerateRampungan from "../form-pengajuan-generate-rampungan";

interface DisplayFormPengajuanGenerateRampunganProps {
  jenisPengajuan?: JENIS_PENGAJUAN | null;
  kegiatan: KegiatanWithDetail | null;
  handleSuccess: (kegiatan: KegiatanWithDetail) => void; // harusnya update ke atas
}

export const DisplayFormPengajuanGenerateRampungan = ({
  jenisPengajuan,
  kegiatan,
  handleSuccess,
}: DisplayFormPengajuanGenerateRampunganProps) => {
  if (!kegiatan) return null;

  const riwayatPengajuan = kegiatan.riwayatPengajuan;

  // Check if there's an existing rampungan
  const pengajuanRampungan = riwayatPengajuan?.find(
    (riwayat) => riwayat.jenis === "GENERATE_RAMPUNGAN"
  );

  // Render the form if GENERATE_RAMPUNGAN is selected and there's no existing rampungan
  if (jenisPengajuan === "GENERATE_RAMPUNGAN" && !pengajuanRampungan) {
    return (
      <FormPengajuanGenerateRampungan
        kegiatanId={kegiatan.id}
        handleSuccess={handleSuccess}
      />
    );
  }

  // Render the status message if GENERATE_RAMPUNGAN is selected, rampungan exists, and is SUBMITTED
  const shouldShowStatusMessage =
    jenisPengajuan === "GENERATE_RAMPUNGAN" &&
    pengajuanRampungan?.status === "SUBMITTED";

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
