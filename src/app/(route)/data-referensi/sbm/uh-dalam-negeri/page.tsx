import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import { getOptionsProvinsi } from "@/actions/sbm";
import getReferensiSbmUhDalamNegeri, {
  SbmUhDalamNegeriPlainObject,
} from "@/data/sbm-uh-dalam-negeri";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import FormUploadExcelSbmUhDalamNegeri from "./_components/form-upload-excel-sbm-uh-dalam-negeri";
import { TabelSbmUhDalamNegeri } from "./_components/tabel-sbm-uh-dalam-negeri";

const ReferensiSbmUhDalamNegeriPage = async () => {
  const tahunAnggaran = await getTahunAnggranPilihan();
  const data = await getReferensiSbmUhDalamNegeri(tahunAnggaran);
  const convertedData = data.map((item) => ({
    ...convertSpecialTypesToPlain<SbmUhDalamNegeriPlainObject>(item),
  }));

  const optionsProvinsi = await getOptionsProvinsi();
  // const optionsProvinsi = [
  //   { value: "Aceh", label: "Aceh" },
  //   { value: "Sumatera Utara", label: "Sumatera Utara" },
  // ];

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM UH Dalam Negeri </h1>
      <FormUploadExcelSbmUhDalamNegeri />
      <TabelSbmUhDalamNegeri
        data={convertedData}
        optionsProvinsi={optionsProvinsi}
      />
    </div>
  );
};

export default ReferensiSbmUhDalamNegeriPage;
