import React from 'react';
import { 
  FileText, 
  PhoneCall, 
  Wifi, 
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FormCategoryCard = ({ name, description, icon: Icon, route, colorClass }) => (
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
        <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">View Forms</span>
        <div className="w-8 h-8 rounded-full bg-dark-bg border border-dark-border flex items-center justify-center text-gray-500 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  </div>
);

const Forms = () => {
  const categories = [
    { 
      name: "ILL CAF", 
      description: "Application forms and Customer Acquisition Forms for Internet Leased Line connections.", 
      icon: FileText, 
      route: "/forms/ill-caf",
      colorClass: "from-blue-500 to-cyan-400"
    },
    { 
      name: "SIP Trunk", 
      description: "Service registration and technical requirement forms for enterprise SIP Trunking solutions.", 
      icon: PhoneCall, 
      route: "/forms/sip-trunk",
      colorClass: "from-orange-500 to-amber-400"
    },
    { 
      name: "FTTH CAF", 
      description: "High-speed Fiber broadband application forms and installation request documents.", 
      icon: Wifi, 
      route: "/forms/ftth-caf",
      colorClass: "from-emerald-500 to-green-400"
    },
    { 
      name: "Mobile", 
      description: "Enterprise mobile connection forms, bulk SIM requests, and portability documents.", 
      icon: Smartphone, 
      route: "/forms/mobile",
      colorClass: "from-purple-500 to-indigo-400"
    }
  ];

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 max-w-[1400px] mx-auto min-h-screen">
      <div className="flex flex-col gap-2 items-center text-center max-w-2xl mx-auto mb-4">
        <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
          Document Hub
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Resource Forms</h1>
        <p className="text-gray-500 font-medium text-lg">
          Download and access all necessary enterprise business application forms and technical documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
        {categories.map((cat, index) => (
          <FormCategoryCard key={index} {...cat} />
        ))}
      </div>
    </div>
  );
};

export default Forms;
