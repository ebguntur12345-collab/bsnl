import React from 'react';
import StatCard from '../components/StatCard';
import { Building2, Landmark, Store, Factory } from 'lucide-react';

const Customers = () => {
  const categories = [
    {
      title: "Government & PSU",
      description: "State and Central Government offices",
      customers: [
        { title: "Collectorate Guntur", count: "12", icon: Landmark, color: "blue-600" },
        { title: "Guntur Municipal Corp", count: "45", icon: Landmark, color: "blue-600" },
      ]
    },
    {
      title: "Corporate Enterprises",
      description: "Large scale private sector enterprises",
      customers: [
        { title: "ITC Limited", count: "8", icon: Building2, color: "indigo-600" },
        { title: "Sangam Dairy", count: "15", icon: Factory, color: "indigo-600" },
      ]
    },
    {
      title: "SME & Retail",
      description: "Small and medium business connections",
      customers: [
        { title: "Retail Outlets", count: "450", icon: Store, color: "cyan-600" },
        { title: "Local Offices", count: "320", icon: Building2, color: "cyan-600" },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Customer Segmentation</h2>
        <p className="text-gray-500">Enterprise customers categorized by business sector</p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-gray-700">{cat.title}</h3>
            <div className="flex-1 h-[1px] bg-gray-200"></div>
            <span className="text-sm text-gray-400">{cat.description}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cat.customers.map((cust, i) => (
              <StatCard key={i} {...cust} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Customers;
