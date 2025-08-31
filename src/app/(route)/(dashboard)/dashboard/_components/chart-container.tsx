"use client";
import { type ResultPaguRealisasi } from "@/actions/dashboard";
import { BarChartRealisasi } from "./bar-chart";
import BarChartPaguRealisasi, {
  PaguRealisasiSisa,
} from "./bar-chart-pagu-realisasi";

interface ChartContainerProps {
  title?: string;
  data: ResultPaguRealisasi[];
}
export const ChartContainer = ({
  title = "Realisasi",
  data = [],
}: ChartContainerProps) => {
  // format into single dimension data

  // Calculate the sums of pagu, realisasi, and sisa
  const totals = data.reduce(
    (acc, curr) => {
      acc.pagu += curr.pagu;
      acc.realisasi += curr.realisasi;
      acc.sisa += curr.sisa;
      return acc;
    },
    { pagu: 0n, realisasi: 0n, sisa: 0n } // Use BigInt constructor
  );

  const formattedData = [
    {
      name: "Pagu",
      total: Number(totals.pagu),
    },
    {
      name: "Realisasi",
      total: Number(totals.realisasi),
    },
    {
      name: "Sisa",
      total: Number(totals.sisa),
    },
  ];

  const paguRealisasiSisa: PaguRealisasiSisa[] = data.map((item) => ({
    name: item.singkatan,
    pagu: Number(item.pagu),
    realisasi: Number(item.realisasi),
    sisa: Number(item.sisa),
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
        <BarChartPaguRealisasi data={paguRealisasiSisa} />
      </div>
    </div>
  );
};

export default ChartContainer;
