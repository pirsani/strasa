import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { getPaguUnitKerjaBySatker } from "@/data/pagu";
import PaguContainer from "./_components/pagu-container";
const ReferensiPaguPage = async () => {
  const tahun = await getTahunAnggranPilihan();

  const pengguna = await getSessionPenggunaForAction();
  if (!pengguna.success) {
    // redirect to login page
    return null;
  }

  const satkerId = pengguna.data.satkerId;
  const unitKerjaId = pengguna.data.unitKerjaId;
  const penggunaId = pengguna.data.penggunaId;

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
