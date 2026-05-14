/** UPDATED LEASED LINES GRID - VERSION 2 **/
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

import { Link } from 'react-router-dom';

const LeasedLineCard = ({ title, value, icon: Icon, colorClass, footerText = "Explore", to }) => (
  <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden card-hover group relative">
    <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
    <div className="p-6 flex items-center justify-between">
      <div className="w-12 h-12 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:border-primary/30 transition-all">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <div className="text-right">
        <p className="text-gray-500 font-black text-[10px] uppercase tracking-widest mb-1.5">{title}</p>
        <p className="text-xl font-black text-white tracking-tight">{value}</p>
      </div>
    </div>
    <div className="bg-dark-bg/30 px-6 py-3 border-t border-dark-border/50 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <RefreshCw size={12} className="text-gray-600 animate-spin-slow" />
        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Live</span>
      </div>
      <Link 
        to={to || `/documents/${title.replace(/\s+/g, '-')}`}
        className="text-[11px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest"
      >
        {footerText}
      </Link>
    </div>
    
    {/* Subtle Glow */}
    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
  </div>
);

const LeasedLines = () => {
  const leasedLineData = [
    { title: "ILL CCTs", value: "ILL 576", icon: Laptop, colorClass: "from-blue-500 to-cyan-400", to: "/leased-lines/ill-576" },
    { title: "MPLS CCTs", value: "MPLS 250", icon: Server, colorClass: "from-red-500 to-orange-400" },
    { title: "ISDN PRI", value: "PRI 97", icon: Phone, colorClass: "from-rose-500 to-red-400" },
    { title: "SIP Trunks", value: "SIP 33", icon: PhoneCall, colorClass: "from-lime-500 to-green-400" },
    { title: "MMVC", value: "MMVC 33", icon: Keyboard, colorClass: "from-purple-500 to-blue-500" },
    { title: "NMECT CCTs", value: "NMECT 33", icon: Monitor, colorClass: "from-cyan-400 to-blue-500" },
    { title: "DOJ", value: "ILL 576", icon: Building2, colorClass: "from-indigo-500 to-blue-600", footerText: "Details" },
    { title: "CGGB", value: "MPLS 279", icon: Users, colorClass: "from-blue-600 to-indigo-700", footerText: "Explore" },
    { title: "Election Comission", value: "Toll Free 1950", icon: Vote, colorClass: "from-emerald-500 to-green-500" },
    { title: "Tobacco Board", value: "ILL 33", icon: Leaf, colorClass: "from-teal-500 to-emerald-400" },
    { title: "NREGS", value: "FTTH 558", icon: RefreshCw, colorClass: "from-orange-500 to-amber-500" },
    { title: "Collectorates", value: "ILL 13", icon: Building2, colorClass: "from-pink-500 to-rose-500", footerText: "Details" },
    { title: "NHM", value: "FTTH ILL", icon: Stethoscope, colorClass: "from-red-500 to-rose-400", footerText: "Details" },
    { title: "Toll FREE", value: "Tolle Free", icon: PhoneForwarded, colorClass: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Leased Line Inventory</h1>
        <p className="text-gray-400 font-medium">Real-time status and documentation for all active leased line connections.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {leasedLineData.map((item, index) => (
          <LeasedLineCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default LeasedLines;
