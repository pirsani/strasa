"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

export interface DataChart {
  name: string;
  total: number;
}
interface BarChartProps {
  data: DataChart[];
}
export const BarChartRealisasi = ({ data = [] }: BarChartProps) => {
  const legendPayload = data.map((entry, index) => ({
    value: entry.name,
    type: "square" as LegendType,
    id: entry.name,
    color: colors[index % colors.length],
  }));
  const formatYAxis = (tickItem: number) => {
    return tickItem.toLocaleString();
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
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip />
        <Legend payload={legendPayload} />
        <Bar dataKey="total" fill="#8884d8">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
