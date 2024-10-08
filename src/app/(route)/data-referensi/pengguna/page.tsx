import { getPengguna } from "@/actions/pengguna";
import { getOptionsRole } from "@/actions/role";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import PenggunaContainer from "./_components/pengguna-container";

const ReferensiPenggunaPage = async () => {
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
