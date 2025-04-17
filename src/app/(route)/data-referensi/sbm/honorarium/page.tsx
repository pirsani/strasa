import { getTahunAnggaranPilihan } from "@/actions/pengguna/preference";
import { checkSessionPermission } from "@/actions/pengguna/session";
import getReferensiSbmHonorarium from "@/data/sbm-honorarium";
import { convertSpecialTypesToPlain } from "@/utils/convert-obj-to-plain";
import FormUploadExcelSbmHonorarium from "./_components/form-upload-excel-sbm-honorarium";
import { TabelSbmHonorarium } from "./_components/tabel-sbm-honorarium";

const ReferensiSbmHonorariumPage = async () => {
  const createAny = await checkSessionPermission({
    actions: ["create:any"],
    resource: "referensi",
  });

  const tahunAnggaran = await getTahunAnggaranPilihan();
  const data = await getReferensiSbmHonorarium(tahunAnggaran);
  const convertedData = data.map((item) => ({
    ...convertSpecialTypesToPlain(item),
  }));
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; SBM Honorarium </h1>
      <FormUploadExcelSbmHonorarium />
      <TabelSbmHonorarium data={convertedData} />
    </div>
  );
};

export default ReferensiSbmHonorariumPage;
