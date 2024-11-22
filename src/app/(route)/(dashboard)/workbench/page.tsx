import { getKegiatan, ParamsGetKegiatan } from "@/actions/kegiatan";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import {
  getCountStatusPengajuan,
  getDistinctStatusPengajuan,
} from "@/data/kegiatan/riwayat-pengajuan";
import ContainerTabelWithFilterStatus from "./_components/container-tabel-with-filter-status";

const WorkbenchPage = async () => {
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

  if (!readOwn && !readAny) {
    return <div>Anda tidak memiliki akses ke halaman ini</div>;
  }

  const pengguna = await getLoggedInPengguna();

  if (!pengguna) {
    return <div>Anda tidak memiliki akses ke halaman ini</div>;
  }

  const satkerId = pengguna.satkerId;
  const unitKerjaId = pengguna.unitKerjaId;

  let params: ParamsGetKegiatan = {};
  if (readAny) {
    params.satkerId = satkerId;
  } else if (readOwn) {
    params.unitKerjaId = unitKerjaId;
  }

  const kegiatan = await getKegiatan(params);
  const tahunAnggaran = await getTahunAnggranPilihan();
  const distinctStatus = await getDistinctStatusPengajuan(tahunAnggaran);
  const countStatus = await getCountStatusPengajuan(
    tahunAnggaran,
    params.satkerId,
    params.unitKerjaId
  );

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-200/90">
      <h1 className="mb-2">Workbench </h1>
      <div className="flex-grow w-full border p-2 bg-gray-100 rounded-lg pb-24">
        <ContainerTabelWithFilterStatus
          status={countStatus || []}
          kegiatan={kegiatan}
        />
      </div>
    </div>
  );
};

export default WorkbenchPage;
