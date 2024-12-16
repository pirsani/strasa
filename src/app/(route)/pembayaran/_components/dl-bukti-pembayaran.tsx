"use client";
import ButtonEye from "@/components/button-eye-open-document";
import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
interface DlBuktiPembayaranProps {
  status: STATUS_PENGAJUAN | null;
  riwayatPengajuanId: string;
}
const DlBuktiPembayaran = ({
  status,
  riwayatPengajuanId,
}: DlBuktiPembayaranProps) => {
  const hasNominatifHonorarium =
    status === STATUS_PENGAJUAN.PAID ||
    status === STATUS_PENGAJUAN.DONE ||
    status === STATUS_PENGAJUAN.END;

  if (!hasNominatifHonorarium) {
    return null;
  }
  return (
    <div className="flex flex-row w-full p-2 pl-0">
      <div className="px-4 py-2 w-full">Bukti Pembayaran</div>
      <ButtonEye
        url={`/download/bukti-pembayaran-narasumber/${riwayatPengajuanId}`}
      />
    </div>
  );
};

export default DlBuktiPembayaran;
