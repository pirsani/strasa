import {
  countStatusPengajuan,
  getPaguRealisasi,
  getRealisasi,
} from "@/actions/dashboard";
import { getTahunAnggaranPilihan } from "@/actions/pengguna/preference";
import { getLoggedInPengguna } from "@/actions/pengguna/session";
import CardsContainer from "./_components/cards-container";
import ChartContainer from "./_components/chart-container";

const DashboardPage = async () => {
  const pengguna = await getLoggedInPengguna();
  if (!pengguna) {
    return <div>Anda tidak memiliki akses ke halaman ini</div>;
  }

  const year = await getTahunAnggaranPilihan();
  const dataRealisasi = await getRealisasi(year);
  const dataPaguRealisasi = await getPaguRealisasi(year);
  console.log("[dashboard] dataRealisasi", dataPaguRealisasi);
  const statusPengajuan = await countStatusPengajuan(year);
  console.log(statusPengajuan);
  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-200 rounded-md ">
      <h1 className="text-slate-700">Dashboard</h1>
      <CardsContainer data={statusPengajuan} />
      <ChartContainer title={`Realisasi ${year}`} data={dataPaguRealisasi} />
    </div>
  );
};

export default DashboardPage;
