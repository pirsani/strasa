import { JENIS_PENGAJUAN, STATUS_PENGAJUAN } from "@prisma-honorarium/client";
import DlBuktiPembayaran from "./dl-bukti-pembayaran";
import FormPembayaran from "./form-pembayaran";
interface ContainerPembayaranProps {
  riwayatPengajuanId: string;
  statusPengajuan?: STATUS_PENGAJUAN | null;
  jenisPengajuan?: JENIS_PENGAJUAN;
}
const ContainerPembayaran = ({
  riwayatPengajuanId,
  statusPengajuan,
  jenisPengajuan,
}: ContainerPembayaranProps) => {
  switch (statusPengajuan) {
    case "REQUEST_TO_PAY":
      return (
        <FormPembayaran
          riwayatPengajuanId={riwayatPengajuanId}
          jenisPengajuan={jenisPengajuan}
        />
      );
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
