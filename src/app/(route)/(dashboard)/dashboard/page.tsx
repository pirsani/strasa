import { getDataRealisasi } from "@/actions/dashboard";
import { getTahunAnggranPilihan } from "@/actions/pengguna/preference";
import Card from "./_components/card";
import ChartContainer from "./_components/chart-container";

const DashboardPage = async () => {
  const year = await getTahunAnggranPilihan();
  const dataRealisasi = await getDataRealisasi(year);
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-200 rounded-md ">
      <h1 className="text-slate-700">Dashboard</h1>
      <div className="flex flex-col sm:flex-row gap-2">
        <Card title="Pengajuan" jumlah={150} bgColor="bg-blue-500" />
        <Card title="Revisi" jumlah={44} bgColor="bg-red-400" />
        <Card title="Tahap Pembayaran" jumlah={44} bgColor="bg-green-500" />
        <Card
          title="Butuh Finishing Dokumen"
          jumlah={65}
          bgColor="bg-gray-400"
        />
      </div>
      <ChartContainer title={`Realisasi ${year}`} values={dataRealisasi} />
    </div>
  );
};

export default DashboardPage;
