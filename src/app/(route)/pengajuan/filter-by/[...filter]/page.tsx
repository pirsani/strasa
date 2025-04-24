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
  const filterValue = filter[1];

  // check if filterBy is valid
  const validFilterBy = ["status", "satkerId", "unitKerjaId"];
  if (!validFilterBy.includes(filterBy)) {
    return <div>Filter tidak valid</div>;
  }
  // check if filterValue is valid
  switch (filterBy) {
    case "status":
      const validFilterValue = [
        "SUBMITTED",
        "REVISE",
        "REQUEST_TO_PAY",
        "PAID",
      ];
      if (filterBy === "status" && !validFilterValue.includes(filterValue)) {
        return <div>Filter value tidak valid</div>;
      }
      break;
    default:
      return <div>INVALID FILTER</div>;
  }

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

  const statusPengajuan: STATUS_PENGAJUAN[] = [filterValue as STATUS_PENGAJUAN];

  const data = await getRiwayatPengajuanInStatus(satkerId!, statusPengajuan);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col bg-gray-200/90">
      <h1 className="mb-2">Detil Dashboard Riwayat Pengajuan</h1>
      <div className="flex-grow w-full border p-2 bg-gray-100 rounded-lg pb-24">
        <TabelRiwayatPengajuan data={data} />
      </div>
    </div>
  );
};

export default PengajuanPageFilteredBy;
