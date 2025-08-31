import { getProsesPermissions } from "@/actions/pengguna/session";
import PengajuanContainer from "./_components/pengajuan-container";

const PengajuanPage = async () => {
  //data daftar pengajuan sesuai tahun aktif dan unit kerjanya
  //jika ada satu saja pengajuan yang di ajukan, maka status kegiatan menjadi "SUBMITTED" sehingga bisa mulai muncul di proses verifikasi
  const dataKegiatan = [];

  const prosesPermissions = await getProsesPermissions();

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-300">
      <h1 className="mb-2">Alur Proses &gt; 1. Pengajuan </h1>
      <PengajuanContainer prosesPermissions={prosesPermissions} />
    </div>
  );
};

export default PengajuanPage;
