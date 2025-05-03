import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Card from '../common/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrdersChart: React.FC = () => {
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
        label: 'Approved Orders',
        data: [65, 78, 86, 92, 105, 118],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Failed Orders',
        data: [12, 15, 8, 9, 7, 10],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Pending Orders',
        data: [5, 7, 4, 6, 8, 11],
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
      },
    ],
  };

  return (
    <Card title="Orders Overview">
      <div className="h-80">
        <Bar options={options} data={data} />
      </div>
    </Card>
  );
};

export default OrdersChart;