import formatCurrency, {
  formatNumberWithSuffix,
} from "@/utils/format-currency";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  {
    name: "Page A",
    pagu: 4000,
    realisasi: 2400,
    sisa: 2400,
  },
  {
    name: "Page B",
    pagu: 3000,
    realisasi: 1398,
    sisa: 2210,
  },
  {
    name: "Page C",
    pagu: 2000,
    realisasi: 9800,
    sisa: 2290,
  },
  {
    name: "Page D",
    pagu: 2780,
    realisasi: 3908,
    sisa: 2000,
  },
  {
    name: "Page E",
    pagu: 1890,
    realisasi: 4800,
    sisa: 2181,
  },
  {
    name: "Page F",
    pagu: 2390,
    realisasi: 3800,
    sisa: 2500,
  },
  {
    name: "Page G",
    pagu: 3490,
    realisasi: 4300,
    sisa: 2100,
  },
];
const formatTooltip = (value: string | number, name: string) => {
  return formatCurrency(Number(value));
};
const BarChartPaguRealisasi = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatNumberWithSuffix} />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        <Bar
          dataKey="pagu"
          fill="#8884d8"
          activeBar={<Rectangle fill="pink" stroke="blue" />}
        />
        <Bar
          dataKey="realisasi"
          fill="#82ca9d"
          activeBar={<Rectangle fill="gold" stroke="purple" />}
        />
        <Bar
          dataKey="sisa"
          fill="#8dd1e1"
          activeBar={<Rectangle fill="red" stroke="purple" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartPaguRealisasi;
