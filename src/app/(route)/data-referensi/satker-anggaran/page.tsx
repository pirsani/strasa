import { checkSessionPermission } from "@/actions/pengguna/session";
import {
  getOptionsForEligibleSatkerAnggaran,
  getSatkerAnggaran,
} from "@/actions/satker-anggaran";
import { redirect } from "next/navigation";
import { DialogTambahSatkerAnggaran } from "./_components/dialog-tambah-satker-anggaran";
import TabelSatkerAnggaran from "./_components/tabel-satker-anggaran";

const SatkerAnggaranPage = async () => {
  const createAny = await checkSessionPermission({
    actions: ["create:any"],
    resource: "ref-satker-anggaran",
    redirectOnUnauthorized: false,
  });

  const createOwn = await checkSessionPermission({
    actions: ["create:own"],
    resource: "ref-satker-anggaran",
    redirectOnUnauthorized: false,
  });

  if (!createAny && !createOwn) {
    redirect("/");
  }
  const eligibleSatkerAnggaran = await getOptionsForEligibleSatkerAnggaran();
  const data = await getSatkerAnggaran();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Satker Anggaran </h1>
      <DialogTambahSatkerAnggaran />
      <TabelSatkerAnggaran
        data={data}
        optionsEligibleForSatkerAnggaran={eligibleSatkerAnggaran}
      />
    </div>
  );
};

export default SatkerAnggaranPage;
