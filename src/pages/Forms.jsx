import React from 'react';
import { 
  Monitor, 
  Server, 
  Phone, 
  PhoneCall, 
  Keyboard, 
  Laptop, 
  RefreshCw,
  Building2,
  Users,
  Vote,
  Leaf,
  Stethoscope,
  PhoneForwarded
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormCard = ({ title, value, icon: Icon, colorClass, footerText = "Explore", onClick }) => (
  <div className="bg-white rounded shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
    <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass}`}></div>
    <div className="p-4 flex items-center justify-between">
      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
        <Icon size={24} className="opacity-80" />
      </div>
      <div className="text-right">
        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg font-black text-gray-600 tracking-tight">{value}</p>
      </div>
    </div>
    <div 
      onClick={() => onClick(title)}
      className="bg-white px-4 py-2 border-t border-gray-50 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors group"
    >
      <RefreshCw size={12} className="text-gray-400 group-hover:text-blue-500" />
      <span className="text-[10px] font-bold text-blue-400 group-hover:text-blue-600 transition-colors">
        {footerText.replace('<', '')}
      </span>
    </div>
  </div>
);

const Forms = () => {
  const navigate = useNavigate();
  const formData = [
    { title: "ILL CCTs", value: "ILL 576", icon: Laptop, colorClass: "from-blue-400 to-cyan-400" },
    { title: "MPLS CCTs", value: "MPLS 250", icon: Server, colorClass: "from-red-500 to-orange-400" },
    { title: "ISDN PRI", value: "PRI 97", icon: Phone, colorClass: "from-rose-600 to-red-400" },
    { title: "SIP Trunks", value: "SIP 33", icon: PhoneCall, colorClass: "from-lime-400 to-green-400" },
    { title: "MMVC", value: "MMVC 33", icon: Keyboard, colorClass: "from-purple-500 to-blue-500" },
    { title: "NMECT CCTs", value: "NMECT 33", icon: Monitor, colorClass: "from-cyan-400 to-blue-500" },
    { title: "DOJ", value: "ILL 576", icon: Building2, colorClass: "from-fuchsia-600 to-pink-500", footerText: "Details" },
    { title: "CGGB", value: "MPLS 279", icon: Users, colorClass: "from-blue-600 to-indigo-800", footerText: "<Explore" },
    { title: "Election Comission", value: "Toll Free 1950", icon: Vote, colorClass: "from-lime-400 to-green-500" },
    { title: "Tobacco Board", value: "ILL 33", icon: Leaf, colorClass: "from-teal-400 to-blue-500" },
    { title: "NREGS", value: "FTTH 558", icon: RefreshCw, colorClass: "from-orange-500 to-red-500" },
    { title: "Collectorates", value: "ILL 13", icon: Building2, colorClass: "from-pink-400 to-rose-500", footerText: "Details" },
    { title: "NHM", value: "FTTH ILL", icon: Stethoscope, colorClass: "from-red-600 to-orange-400", footerText: "Details" },
    { title: "Toll FREE", value: "Tolle Free", icon: PhoneForwarded, colorClass: "from-lime-400 to-green-500" },
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {formData.map((item, index) => (
          <FormCard 
            key={index} 
            {...item} 
            onClick={(categoryTitle) => navigate(`/module-documents/Forms/${encodeURIComponent(categoryTitle)}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Forms;
