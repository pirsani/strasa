import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getSessionPengguna } from "@/actions/pengguna/session";
import { getObjPlainPengajuanPembayaran } from "@/data/pembayaran";
import TabelPengajuanPembayaran from "./_components/tabel-pengajuan-pembayaran";

const PembayaranPage = async () => {
  const pengguna = await getSessionPengguna();
  if (!pengguna.success) {
    return null;
  }

  const tahun = await getTahunAnggranPilihan();
  const satkerId = pengguna.data?.satkerId ?? "";

  const dataPengajuanPembayaran = await getObjPlainPengajuanPembayaran(
    satkerId,
    tahun
  );
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col ">
      <h1 className="mb-2">Alur Proses &gt; 1. Pembayaran </h1>
      <TabelPengajuanPembayaran data={dataPengajuanPembayaran} />
    </div>
  );
};

export default PembayaranPage;
