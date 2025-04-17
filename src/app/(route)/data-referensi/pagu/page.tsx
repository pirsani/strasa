import { getTahunAnggaranPilihan } from "@/actions/pengguna/preference";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { getPaguUnitKerjaBySatker } from "@/data/pagu";
import { redirect } from "next/navigation";
import PaguContainer from "./_components/pagu-container";
const ReferensiPaguPage = async () => {
  const createAny = await checkSessionPermission({
    actions: ["create:any"],
    resource: "ref-pagu",
    redirectOnUnauthorized: false,
  });

  const createOwn = await checkSessionPermission({
    actions: ["create:own"],
    resource: "ref-pagu",
    redirectOnUnauthorized: false,
  });

  const pengguna = await getLoggedInPengguna();

  if (!pengguna || (!createAny && !createOwn)) {
    redirect("/");
  }

  const satkerId = pengguna.satkerId ?? pengguna.unitKerjaId!; // fallback to unit kerja id, jika sampe sini pasti punya unit kerja id
  const unitKerjaId = pengguna.unitKerjaId;
  const penggunaId = pengguna.id;
  const tahun = await getTahunAnggaranPilihan();

  const optionsUnitKerja = await getOptionsUnitKerja(satkerId);
  const pagu = await getPaguUnitKerjaBySatker(satkerId, tahun);
  console.log(satkerId, tahun);
  console.log("pagu", pagu);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Pagu </h1>
      <PaguContainer
        data={pagu}
        optionsUnitKerja={optionsUnitKerja}
        satkerId={satkerId}
      />
    </div>
  );
};

export default ReferensiPaguPage;
