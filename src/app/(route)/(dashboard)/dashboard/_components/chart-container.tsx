"use client";
import { BarChartRealisasi, DataChart } from "./bar-chart";

interface ChartContainerProps {
  title?: string;
  data: DataChart[];
}
export const ChartContainer = ({
  title = "Realisasi",
  data = [],
}: ChartContainerProps) => {
  return (
    <div className="rounded-t-sm w-full h-5/6">
      <h1 className="text-lg bg-green-600 p-2 rounded-t-sm text-white">
        {title}
      </h1>
      <div className="h-[350px] py-10">
        <BarChartRealisasi data={data} />
      </div>
    </div>
  );
};

export default ChartContainer;
