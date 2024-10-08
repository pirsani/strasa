// BarChart.tsx
import {
  BarElement,
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

// Register required components in ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to generate soft color
const getSoftColor = (): string => {
  const r = Math.floor(Math.random() * 127 + 127); // 127 to 255 for softer red
  const g = Math.floor(Math.random() * 127 + 127); // 127 to 255 for softer green
  const b = Math.floor(Math.random() * 127 + 127); // 127 to 255 for softer blue
  return `rgba(${r}, ${g}, ${b}, 0.6)`; // 0.6 opacity for softness
};

// Heler function to generate hard color
const getHardColor = (): string => {
  const r = Math.floor(Math.random() * 255); // 0 to 255 for harder red
  const g = Math.floor(Math.random() * 255); // 0 to 255 for harder green
  const b = Math.floor(Math.random() * 255); // 0 to 255 for harder blue
  return `rgba(${r}, ${g}, ${b}, 1)`; // 1 opacity for hardness
};

interface BarChartProps {
  labels: string[];
  values: number[];
  label: string; // Dataset label
}

const BarChart: React.FC<BarChartProps> = ({ labels, values, label }) => {
  // Generate soft colors for each bar
  const backgroundColors = values.map(() => getHardColor());
  const borderColors = backgroundColors.map((color) =>
    color.replace("0.6", "1")
  ); // Make border fully opaque

  // Define the chart data structure
  const data: ChartData<"bar", number[], string> = {
    labels: labels,
    datasets: [
      {
        label: label,
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  // Define chart options
  const options: ChartOptions<"bar"> = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default BarChart;
