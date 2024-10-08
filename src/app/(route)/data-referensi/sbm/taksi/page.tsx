import { getOptionsProvinsi } from "@/actions/sbm";
import getReferensiSbmTaksi, { SbmTaksiPlainObject } from "@/data/sbm-taksi";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import FormUploadExcelSbmTaksi from "./_components/form-upload-excel-sbm-taksi";
import { TabelSbmTaksi } from "./_components/tabel-sbm-taksi";

const ReferensiSbmTaksiPage = async () => {
  const data = await getReferensiSbmTaksi();
  const convertedData = data.map((item) => ({
    ...convertSpecialTypesToPlain<SbmTaksiPlainObject>(item),
  }));

  const optionsProvinsi = await getOptionsProvinsi();
  // const optionsProvinsi = [
  //   { value: "Aceh", label: "Aceh" },
  //   { value: "Sumatera Utara", label: "Sumatera Utara" },
  // ];

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col p-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM Taksi</h1>
      <FormUploadExcelSbmTaksi />
      <TabelSbmTaksi data={convertedData} optionsProvinsi={optionsProvinsi} />
    </div>
  );
};

export default ReferensiSbmTaksiPage;
