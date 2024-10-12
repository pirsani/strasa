import { getOptionsKota, getOptionsKotaSekitarJakarta } from "@/actions/kota";
import {
  getSbmTransporDalamKotaPulangPergi,
  getSbmTransporJakartaKeKotaKabSekitar,
} from "@/data/sbm-transpor/dalam-kota";
import { DialogTambahSbmTransporDalamKotaPulangPergi } from "./_components/dialog-tambah-sbm-transpor-dalam-kota";
import { DialogTambahSbmTransporJakartaKeKotaKabSekitar } from "./_components/dialog-tambah-sbm-transpor-jakarta-ke-kota-kab-sekitar";
import TabelSbmTransporDalamKotaPulangPergi from "./_components/tabel-sbm-transpor-dalam-kota";
import TabelSbmTransporJakartaKeKotaSekitar from "./_components/tabel-sbm-transpor-jakarta-ke-kota-kab-sekitar";

const TransporPage = async () => {
  const dataSbmDalamKota = await getSbmTransporDalamKotaPulangPergi();
  const dataSbmJakartaKeKotaKabSekitar =
    await getSbmTransporJakartaKeKotaKabSekitar();
  const optionsKota = await getOptionsKota();
  const optionsKotaSekitarJakarta = await getOptionsKotaSekitarJakarta();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM Transpor </h1>
      <DialogTambahSbmTransporDalamKotaPulangPergi />
      <TabelSbmTransporDalamKotaPulangPergi
        data={dataSbmDalamKota}
        optionsKota={optionsKota}
      />
      <DialogTambahSbmTransporJakartaKeKotaKabSekitar />
      <TabelSbmTransporJakartaKeKotaSekitar
        data={dataSbmJakartaKeKotaKabSekitar}
        optionsKota={optionsKotaSekitarJakarta}
      />
    </div>
  );
};

export default TransporPage;
