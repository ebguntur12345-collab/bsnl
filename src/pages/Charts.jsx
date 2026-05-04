import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Charts = () => {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New ILL Connections',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(0, 91, 170, 0.7)',
        borderRadius: 8,
      },
      {
        label: 'New SIP Trunks',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(0, 180, 216, 0.7)',
        borderRadius: 8,
      },
    ],
  };

  const lineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Network Availability (%)',
        data: [99.2, 99.8, 98.5, 99.9],
        borderColor: '#005BAA',
        backgroundColor: 'rgba(0, 91, 170, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ['ILL', 'MPLS', 'PRI', 'SIP', 'Other'],
    datasets: [
      {
        data: [300, 150, 100, 200, 50],
        backgroundColor: [
          '#005BAA',
          '#00B4D8',
          '#48CAE4',
          '#90E0EF',
          '#ADE8F4',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Analytics & Insights</h2>
        <p className="text-gray-500">Service growth and performance metrics for Guntur SSA</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Monthly Service Growth</h3>
          <Bar data={barData} options={options} />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Service Distribution</h3>
          <div className="max-w-[300px] mx-auto">
            <Pie data={pieData} options={options} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-6">Network Reliability Trend</h3>
          <Line data={lineData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default Charts;
