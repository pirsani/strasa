"use client";
import formatCurrency, {
  formatNumberWithSuffix,
} from "@/utils/format-currency";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  LegendType,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const data = [
  { name: "Pagu", total: 4000, pv: 2400, amt: 2400 },
  { name: "Sudah dibayar", total: 3000, pv: 1398, amt: 2210 },
  { name: "Belum dibayar", total: 2000, pv: 9800, amt: 2290 },
  { name: "Sisa", total: 2780, pv: 3908, amt: 2000 },
];
const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

export interface SingleDimensionDataChart {
  name: string;
  total: number;
}
interface BarChartProps {
  data: SingleDimensionDataChart[];
}
export const BarChartRealisasi = ({ data = [] }: BarChartProps) => {
  const legendPayload = data.map((entry, index) => ({
    value: entry.name,
    type: "square" as LegendType,
    id: entry.name,
    color: colors[index % colors.length],
  }));

  // Calculate the maximum value in the data
  const maxValue = Math.max(...data.map((entry) => entry.total));
  const yAxisMax = maxValue * 1.2; // 20% higher than the max value

  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text x={x + width / 2} y={y} fill="#404040" textAnchor="middle" dy={-6}>
        {formatCurrency(Number(value))}
      </text>
    );
  };

  const formatTooltip = (value: string | number) => {
    return formatCurrency(Number(value));
  };
  return (
    <ResponsiveContainer className={"w-full h-full"}>
      <BarChart
        width={500}
        height={500}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 50,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatNumberWithSuffix} domain={[0, yAxisMax]} />
        <Tooltip formatter={formatTooltip} />
        <Legend payload={legendPayload} />
        <Bar dataKey="total" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
          <LabelList dataKey="total" content={renderCustomLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
