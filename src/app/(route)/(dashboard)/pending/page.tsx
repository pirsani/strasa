import { getSessionPenggunaForAction } from "@/actions/pengguna";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getRiwayatKegiatanUntukDokumenAkhir } from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import Container from "./_components/container-pending";

const PendingPage = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    return pengguna;
  }
  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;
  const penggunaName = pengguna.data.penggunaName;

  const status: STATUS_PENGAJUAN[] = ["PAID", "END"];

  const riwayatPengajuan = await getRiwayatKegiatanUntukDokumenAkhir(
    satkerId,
    tahunAnggaran
  );

  if (!riwayatPengajuan) {
    return "Belum ada data";
  }

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-200/90">
      <h1 className="mb-2">Upload Dokumen Akhir</h1>
      <div className="flex-grow w-full border p-2 bg-gray-100 rounded-lg pb-24">
        <Container riwayatPengajuan={riwayatPengajuan} />
      </div>
    </div>
  );
};

export default PendingPage;
