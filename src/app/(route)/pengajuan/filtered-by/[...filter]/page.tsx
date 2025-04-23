import { ParamsGetKegiatan } from "@/actions/kegiatan";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import { getRiwayatPengajuanInStatus } from "@/data/kegiatan/riwayat-pengajuan";
import { STATUS_PENGAJUAN } from "@/lib/constants";
import TabelRiwayatPengajuan from "./_components/tabel-riwayat-pengajuan";

const PengajuanPageFilteredBy = async ({
  params,
}: {
  params: Promise<{ filter: string[] }>;
}) => {
  const { filter } = await params;
  const filterBy = filter[0];
  const filterByStatus = filter[1];

  const pengguna = await getLoggedInPengguna();

  if (!pengguna) {
    return <div>Anda tidak memiliki akses ke halaman ini</div>;
  }

  const satkerId = pengguna.satkerId;
  const unitKerjaId = pengguna.unitKerjaId;

  const readOwn = await checkSessionPermission({
    actions: ["read:own"],
    resource: "workbench",
    redirectOnUnauthorized: false,
  });

  const readAny = await checkSessionPermission({
    actions: "read:any",
    resource: "workbench",
    redirectOnUnauthorized: false,
  });

  const paramsKegiatan: ParamsGetKegiatan = {};
  if (readAny) {
    console.log("[workbench read:any]", pengguna);
    paramsKegiatan.satkerId = satkerId!;
  } else if (readOwn) {
    console.log("[workbench read:own]", pengguna);
    paramsKegiatan.unitKerjaId = unitKerjaId!;
  }

  const statusPengajuan: STATUS_PENGAJUAN[] = ["SUBMITTED"];

  const data = await getRiwayatPengajuanInStatus(satkerId!, statusPengajuan);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pengajuan</h1>
      <TabelRiwayatPengajuan data={data} />
    </div>
  );
};

export default PengajuanPageFilteredBy;
