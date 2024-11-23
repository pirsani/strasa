import { checkSessionPermission } from "@/actions/pengguna/session";
import { getOptionsUnitKerja, getUnitKerja } from "@/actions/unit-kerja";
import { redirect } from "next/navigation";
import UnitKerjaContainer from "./_components/unit-kerja-container";

const ReferensiUnitKerjaPage = async () => {
  const createAny = await checkSessionPermission({
    actions: ["create:any"],
    resource: "ref-unit-kerja",
    redirectOnUnauthorized: false,
  });

  const createOwn = await checkSessionPermission({
    actions: ["create:own"],
    resource: "ref-unit-kerja",
    redirectOnUnauthorized: false,
  });

  if (!createAny && !createOwn) {
    redirect("/");
  }
  const data = await getUnitKerja();
  const optionsUnitKerja = await getOptionsUnitKerja();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Unit Kerja </h1>
      <UnitKerjaContainer data={data} optionsUnitKerja={optionsUnitKerja} />
    </div>
  );
};

export default ReferensiUnitKerjaPage;
