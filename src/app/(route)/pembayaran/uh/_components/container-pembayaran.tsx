import { STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import DlBuktiPembayaran from "./dl-bukti-pembayaran";
import FormPembayaran from "./form-pembayaran";
interface ContainerPembayaranProps {
  riwayatPengajuanId: string;
  statusPengajuan?: STATUS_PENGAJUAN | null;
}
const ContainerPembayaran = ({
  riwayatPengajuanId,
  statusPengajuan,
}: ContainerPembayaranProps) => {
  switch (statusPengajuan) {
    case "REQUEST_TO_PAY":
      return <FormPembayaran riwayatPengajuanId={riwayatPengajuanId} />;
      break;
    case "PAID":
    case "DONE":
    case "END":
      return (
        <DlBuktiPembayaran
          riwayatPengajuanId={riwayatPengajuanId}
          status={statusPengajuan}
        />
      );
      break;
    default:
      return null;
      break;
  }
};

export default ContainerPembayaran;
