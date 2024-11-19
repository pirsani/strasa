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

export interface PaguRealisasiSisa {
  name: string;
  pagu: number;
  realisasi: number;
  sisa: number;
}

const formatTooltip = (value: string | number, name: string) => {
  return formatCurrency(Number(value));
};

interface BarChartPaguRealisasiProps {
  data: PaguRealisasiSisa[];
}
const BarChartPaguRealisasi = ({ data = [] }: BarChartPaguRealisasiProps) => {
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
          fill="#ffc658"
          activeBar={<Rectangle fill="red" stroke="purple" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartPaguRealisasi;
