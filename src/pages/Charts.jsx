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
        backgroundColor: '#005BAA',
        borderRadius: 8,
      },
      {
        label: 'New SIP Trunks',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: '#00B4D8',
        borderRadius: 8,
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
          color: '#94a3b8',
          font: {
            family: 'Outfit, sans-serif',
            weight: '600',
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#fff',
        bodyColor: '#94a3b8',
        borderColor: '#1e293b',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#1e293b',
          drawBorder: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 10,
            weight: '600'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#64748b',
          font: {
            size: 10,
            weight: '600'
          }
        }
      }
    }
  };

  const pieOptions = {
    ...options,
    scales: {
      y: { display: false },
      x: { display: false }
    }
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Analytics & Insights</h1>
        <p className="text-gray-400 font-medium text-lg">Service growth and performance metrics for Guntur SSA enterprise wing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-dark-card p-10 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Monthly Service Growth
            </h3>
            <div className="h-[350px] flex items-center justify-center">
              <Bar data={barData} options={options} />
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-dark-card p-10 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Service Distribution
            </h3>
            <div className="h-[350px] flex items-center justify-center">
              <div className="w-[300px]">
                <Pie data={pieData} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
