import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getSessionPenggunaForAction } from "@/actions/pengguna/session";
import { getOptionsUnitKerja } from "@/actions/unit-kerja";
import { getSp2dUnitKerjaBySatker } from "@/data/sp2d";
import Sp2dContainer from "./_components/sp2d-container";
const ReferensiSp2dPage = async () => {
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
