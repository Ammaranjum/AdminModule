import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Card from '../common/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const SalesChart: React.FC = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const labels = ['January', 'February', 'March', 'April', 'May', 'June'];
  
  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Sales ($)',
        data: [12500, 14300, 15800, 18700, 21500, 24200],
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.3,
      },
    ],
  };

  return (
    <Card title="Sales Trend">
      <div className="h-80">
        <Line options={options} data={data} />
      </div>
    </Card>
  );
};

export default SalesChart;