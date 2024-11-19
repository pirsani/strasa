"use client";
import { BarChartRealisasi } from "./bar-chart";
import BarChartPaguRealisasi from "./bar-chart-pagu-realisasi";

interface DataChart {
  nama: string;
  pagu: BigInt | number;
  realisasi: BigInt | number;
  sisa: BigInt | number;
}

interface ChartContainerProps {
  title?: string;
  data: DataChart[];
}
export const ChartContainer = ({
  title = "Realisasi",
  data = [],
}: ChartContainerProps) => {
  // format into single dimension data
  const formattedData = data.map((d) => ({
    name: d.nama,
    total: d.pagu,
  }));

  return (
    <div className="rounded-t-sm w-full h-5/6">
      <h1 className="text-lg bg-green-600 p-2 rounded-t-sm text-white">
        {title}
      </h1>
      <div className="h-[350px] py-10">
        <BarChartRealisasi data={formattedData} />
      </div>

      <h1 className="text-lg bg-green-600 p-2 rounded-t-sm text-white">
        Realisasi SP2D
      </h1>
      <div className="h-[350px] py-10">
        <BarChartPaguRealisasi />
      </div>
    </div>
  );
};

export default ChartContainer;
