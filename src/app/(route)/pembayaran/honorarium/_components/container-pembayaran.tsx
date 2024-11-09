import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import DlBuktiPembayaran from "./dl-bukti-pembayaran";
import FormPembayaran from "./form-pembayaran";
interface ContainerPembayaranProps {
  riwayatPengajuanId: string;
  statusPengajuanHonorarium?: STATUS_PENGAJUAN | null;
}
const ContainerPembayaran = ({
  riwayatPengajuanId,
  statusPengajuanHonorarium,
}: ContainerPembayaranProps) => {
  switch (statusPengajuanHonorarium) {
    case "REQUEST_TO_PAY":
      return <FormPembayaran riwayatPengajuanId={riwayatPengajuanId} />;
      break;
    case "PAID":
    case "DONE":
    case "END":
      return (
        <DlBuktiPembayaran
          riwayatPengajuanId={riwayatPengajuanId}
          status={statusPengajuanHonorarium}
        />
      );
      break;
    default:
      return null;
      break;
  }
};

export default ContainerPembayaran;
