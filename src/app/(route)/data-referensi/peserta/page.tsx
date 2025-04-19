import { getPeserta } from "@/data/peserta";
import FormPesertaContainer from "./_components/form-peserta-container";

const ReferensiPesertaPage = async () => {
  const peserta = await getPeserta(); // this will include Date Object so we need to convert it to string first before sending it to the client component

  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">Tabel Referensi &gt; Peserta </h1>
      <FormPesertaContainer data={peserta} />
      {/* <FormUploadExcelPeserta /> */}
    </div>
  );
};

export default ReferensiPesertaPage;
