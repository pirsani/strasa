import {
  convertPejabatPerbendaharaanToStringDate,
  getPejabatPerbenaharaanBySatkerId,
} from "@/data/pejabat-perbendaharaan";
import PejabatPerbendaharaanContainer from "./_components/pejabat-perbendaharaan-container";

const ReferensiPejabataPerbendaharaanPage = async () => {
  const data = await getPejabatPerbenaharaanBySatkerId({});
  const convertedData = convertPejabatPerbendaharaanToStringDate(data);
  return (
    <div className="p-4 pb-24 h-auto min-h-full flex flex-col gap-2">
      <h1 className="m-2">
        Tabel Referensi &gt; Pejabat Penanggung Jawab Pengelola Keuangan
      </h1>
      <PejabatPerbendaharaanContainer data={convertedData} />
    </div>
  );
};

export default ReferensiPejabataPerbendaharaanPage;
