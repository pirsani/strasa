import { getTahunAnggaranPilihan } from "@/actions/pengguna/preference";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import {
  getRiwayatPengajuanUntukDokumenAkhir,
  RiwayatPengajuanIncludePengguna,
} from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { redirect } from "next/navigation";
import Container from "./_components/container-pending";
const PendingPage = async () => {
  const createAny = await checkSessionPermission({
    actions: ["read:any"],
    resource: "pending",
    redirectOnUnauthorized: false,
  });

  const createOwn = await checkSessionPermission({
    actions: ["read:own"],
    resource: "pending",
    redirectOnUnauthorized: false,
  });

  if (!createAny && !createOwn) {
    return "Anda tidak memiliki akses ke halaman ini";
  }

  const pengguna = await getLoggedInPengguna();

  if (!pengguna) {
    redirect("/");
  }

  const tahunAnggaran = await getTahunAnggaranPilihan();

  // TODO memastikan bahwa pengguna yang mengajukan adalah satker pengguna yang terkait dengan kegiatan
  const satkerId = pengguna.satkerId!;
  const unitKerjaId = pengguna.unitKerjaId!;
  const penggunaId = pengguna.id;
  const penggunaName = pengguna.name;

  const status: STATUS_PENGAJUAN[] = ["PAID", "END"];

  const riwayatPengajuan = await getRiwayatPengajuanUntukDokumenAkhir(
    satkerId,
    tahunAnggaran
  );

  if (!riwayatPengajuan) {
    return "Belum ada data";
  }

  const convertedData = riwayatPengajuan.map((item) => ({
    ...convertSpecialTypesToPlain<RiwayatPengajuanIncludePengguna>(item),
  }));

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-200/90">
      <h1 className="mb-2">Upload Dokumen Akhir</h1>
      <div className="flex-grow w-full border p-2 bg-gray-100 rounded-lg pb-24">
        <Container riwayatPengajuan={convertedData} />
      </div>
    </div>
  );
};

export default PendingPage;
