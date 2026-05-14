import React from 'react';
import { 
  PhoneCall, 
  Zap, 
  Smartphone, 
  SmartphoneNfc,
  Keyboard,
  Wifi,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ name, description, icon: Icon, route, colorClass }) => (
  <div 
    onClick={() => window.location.href = route}
    className="bg-dark-card rounded-3xl border border-dark-border p-8 card-hover group cursor-pointer relative overflow-hidden"
  >
    {/* Background Glow */}
    <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${colorClass} opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity`}></div>
    
    <div className="relative z-10 flex flex-col h-full">
      <div className={`w-14 h-14 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 group-hover:text-primary group-hover:border-primary/30 transition-all mb-6 shadow-xl`}>
        <Icon size={28} strokeWidth={1.5} />
      </div>
      
      <div className="flex-1">
        <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed">
          {description}
        </p>
      </div>
      
      <div className="mt-8 pt-6 border-t border-dark-border/50 flex items-center justify-between">
        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Select Category</span>
        <div className="w-8 h-8 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </div>
);

const Tariffs = () => {
  const subcategories = [
    { 
      name: "SIP Trunk", 
      description: "Scalable voice solutions for enterprises with digital connectivity and unlimited concurrent calls.", 
      icon: PhoneCall, 
      route: "/tariffs/sip-trunk",
      colorClass: "from-blue-500 to-cyan-400"
    },
    { 
      name: "Internet Leased Line", 
      description: "Dedicated high-speed symmetric bandwidth with 99% uptime for business critical applications.", 
      icon: Zap, 
      route: "/tariffs/internet-leased-line",
      colorClass: "from-orange-500 to-amber-400"
    },
    { 
      name: "Mobile Prepaid", 
      description: "Flexible prepaid plans with high speed data and unlimited calling options for enterprise users.", 
      icon: Smartphone, 
      route: "/tariffs/mobile-prepaid",
      colorClass: "from-emerald-500 to-green-400"
    },
    { 
      name: "Mobile Postpaid", 
      description: "Premium postpaid connections with personalized billing and bulk data sharing for organizations.", 
      icon: SmartphoneNfc, 
      route: "/tariffs/mobile-postpaid",
      colorClass: "from-purple-500 to-indigo-400"
    },
    { 
      name: "MMVC OBD", 
      description: "Mass Voice Call solutions with Outbound Dialing for alerts, surveys and promotional campaigns.", 
      icon: Keyboard, 
      route: "/tariffs/mmvc-obd",
      colorClass: "from-pink-500 to-rose-400"
    },
    { 
      name: "FTTH", 
      description: "Fiber To The Home high-speed broadband plans for small offices and individual professional use.", 
      icon: Wifi, 
      route: "/tariffs/ftth",
      colorClass: "from-cyan-500 to-blue-400"
    }
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col gap-2 items-center text-center max-w-2xl mx-auto mb-4">
        <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
          Enterprise Services
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Tariff Categories</h1>
        <p className="text-gray-500 font-medium text-lg">
          Select a service category below to view detailed tariff plans, documentation and registration procedures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {subcategories.map((sub, index) => (
          <CategoryCard key={index} {...sub} />
        ))}
      </div>
    </div>
  );
};

export default Tariffs;
