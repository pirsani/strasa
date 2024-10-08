"use client";
import { useEffect, useState } from "react";
import BarChart from "./bar-chart";

interface ChartContainerProps {
  title?: string;
  values: number[];
}
export const ChartContainer = ({
  title = "Realisasi",
  values = [0, 0, 0, 0],
}: ChartContainerProps) => {
  const [chartData, setChartData] = useState({
    labels: ["Pagu", "Pembayaran", "Belum dibayar", "Sisa"],
    values,
  });

  useEffect(() => {
    setChartData((prev) => ({
      ...prev,
      values,
    }));
  }, [values]);

  return (
    <div className="rounded-t-sm w-full h-5/6">
      <h1 className="text-lg bg-green-600 p-2 rounded-t-sm text-white">
        {title}
      </h1>
      <div className="h-[300px]">
        <BarChart
          labels={chartData.labels}
          values={chartData.values}
          label="Realisasi"
        />
      </div>
    </div>
  );
};

export default ChartContainer;
