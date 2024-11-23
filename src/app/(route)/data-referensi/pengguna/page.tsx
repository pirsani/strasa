import { getPengguna } from "@/actions/pengguna";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import { getOptionsRole } from "@/actions/role";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { redirect } from "next/navigation";
import PenggunaContainer from "./_components/pengguna-container";

const ReferensiPenggunaPage = async () => {
  // berlaku di semua satker
  const createAny = await checkSessionPermission({
    actions: ["create:any"],
    resource: "ref-pengguna",
    redirectOnUnauthorized: false,
  });

  //hanya berlaku di satker yang sama
  const createOwn = await checkSessionPermission({
    actions: ["create:own"],
    resource: "ref-pengguna",
    redirectOnUnauthorized: false,
  });

  if (!createAny && !createOwn) {
    redirect("/");
  }

  const pengguna = await getLoggedInPengguna();
  console.log("[Pengguna]", pengguna);

  const satkerId = createAny ? undefined : "1";

  const data = await getPengguna();
  const optionsRole = await getOptionsRole();
  const optionsUnitKerja = await getOptionsUnitKerja();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Pengguna </h1>
      <PenggunaContainer
        data={data}
        optionsRole={optionsRole}
        optionsUnitKerja={optionsUnitKerja}
      />
    </div>
  );
};

export default ReferensiPenggunaPage;
