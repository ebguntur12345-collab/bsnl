import React from 'react';
import { ArrowRight } from 'lucide-react';

const StatCard = ({ icon: Icon, title, count, color = "primary" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-100 card-hover flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}/10 text-${color}`}>
          <Icon size={24} />
        </div>
        <span className="text-3xl font-bold text-gray-800 tracking-tight">{count}</span>
      </div>
      
      <div>
        <h3 className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">{title}</h3>
        <p className="text-gray-400 text-xs mb-4">Total Active Connections</p>
      </div>

      <div className="mt-auto">
        <button className="flex items-center justify-between w-full px-4 py-2 bg-gray-50 hover:bg-primary hover:text-white text-primary text-sm font-semibold rounded-lg transition-all group">
          <span>Explore Details</span>
          <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default StatCard;
