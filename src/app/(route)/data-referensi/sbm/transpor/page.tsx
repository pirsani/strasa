import { getOptionsKota, getOptionsKotaSekitarJakarta } from "@/actions/kota";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import {
  getSbmTransporDalamKotaPulangPergi,
  getSbmTransporJakartaKeKotaKabSekitar,
  SbmTransporDalamKotaPulangPergiPlainObject,
  SbmTransporJakartaKeKotaKabSekitarPlainObject,
} from "@/data/sbm-transpor/dalam-kota";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import { DialogTambahSbmTransporDalamKotaPulangPergi } from "./_components/dialog-tambah-sbm-transpor-dalam-kota";
import { DialogTambahSbmTransporJakartaKeKotaKabSekitar } from "./_components/dialog-tambah-sbm-transpor-jakarta-ke-kota-kab-sekitar";
import TabelSbmTransporDalamKotaPulangPergi from "./_components/tabel-sbm-transpor-dalam-kota";
import TabelSbmTransporJakartaKeKotaSekitar from "./_components/tabel-sbm-transpor-jakarta-ke-kota-kab-sekitar";

const TransporPage = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const dataSbmDalamKota = await getSbmTransporDalamKotaPulangPergi(
    tahunAnggaran
  );
  const dataSbmJakartaKeKotaKabSekitar =
    await getSbmTransporJakartaKeKotaKabSekitar(tahunAnggaran);

  // suppress Warning: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
  const convertedDataSbmDalkot = dataSbmDalamKota.map((item) => ({
    ...convertSpecialTypesToPlain<SbmTransporDalamKotaPulangPergiPlainObject>(
      item
    ),
  }));

  const convertedDataSbmJakarta = dataSbmJakartaKeKotaKabSekitar.map(
    (item) => ({
      ...convertSpecialTypesToPlain<SbmTransporJakartaKeKotaKabSekitarPlainObject>(
        item
      ),
    })
  );

  const optionsKota = await getOptionsKota();
  const optionsKotaSekitarJakarta = await getOptionsKotaSekitarJakarta();
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM Transpor </h1>
      <DialogTambahSbmTransporDalamKotaPulangPergi />
      <TabelSbmTransporDalamKotaPulangPergi
        data={convertedDataSbmDalkot}
        optionsKota={optionsKota}
      />
      <DialogTambahSbmTransporJakartaKeKotaKabSekitar />
      <TabelSbmTransporJakartaKeKotaSekitar
        data={convertedDataSbmJakarta}
        optionsKota={optionsKotaSekitarJakarta}
      />
    </div>
  );
};

export default TransporPage;
