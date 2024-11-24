import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import {
  checkSessionPermission,
  getLoggedInPengguna,
} from "@/actions/pengguna/session";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { getSp2dUnitKerjaBySatker } from "@/data/sp2d";
import { redirect } from "next/navigation";
import Sp2dContainer from "./_components/sp2d-container";
const ReferensiSp2dPage = async () => {
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
  const tahun = await getTahunAnggranPilihan();

  const optionsUnitKerja = await getOptionsUnitKerja(satkerId);
  const sp2d = await getSp2dUnitKerjaBySatker(satkerId, tahun);
  console.log(satkerId, tahun);
  console.log("sp2d", sp2d);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Sp2d </h1>
      <Sp2dContainer
        data={sp2d}
        optionsUnitKerja={optionsUnitKerja}
        satkerId={satkerId}
      />
    </div>
  );
};

export default ReferensiSp2dPage;
