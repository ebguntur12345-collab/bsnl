/** UPDATED LEASED LINES GRID - VERSION 2 **/
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
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
  PhoneForwarded,
  Zap,
  ShoppingCart,
  CheckCircle,
  CreditCard
} from 'lucide-react';

import { Link } from 'react-router-dom';

const LeasedLineCard = ({ title, value, icon: Icon, colorClass, footerText = "Explore", to }) => (
  <div className="bg-dark-card rounded-2xl border border-dark-border overflow-hidden card-hover group relative">
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
  const [metrics, setMetrics] = useState([]);
  const iconMap = { 
    Laptop, Server, Phone, PhoneCall, Keyboard, Monitor, 
    Building2, Users, Vote, Leaf, RefreshCw, Stethoscope, 
    PhoneForwarded, Zap, ShoppingCart, CheckCircle, CreditCard 
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      const { data } = await supabase.from('enterprise_metrics').select('*').order('created_at', { ascending: true });
      
      const regs = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
      
      const processMetricValue = (m) => {
        if (!m.service_type || m.service_type === 'None') return m.value || '0';
        const count = regs.filter(r => {
          const rService = (r.serviceType || r.service || '').toLowerCase();
          const mService = (m.service_type || '').toLowerCase();
          const mTitle = (m.title || '').toLowerCase();
          if (!mService || mService === 'none') {
            return rService === mTitle;
          }
          
          return rService === mService || 
                 rService === mTitle ||
                 (rService.includes('ill') && mService.includes('ill')) ||
                 (rService.includes('mpls') && mService.includes('mpls')) ||
                 (rService.includes('sip') && mService.includes('sip')) ||
                 (rService.includes('pri') && mService.includes('pri')) ||
                 (rService.includes('ftth') && mService.includes('ftth')) ||
                 (rService.includes('mmvc') && mService.includes('mmvc'));
        }).length;
        const prefix = m.title.split(' ')[0] || '';
        return `${prefix} ${count}`;
      };

      if (data && data.length > 0) {
        setMetrics(data.map(m => ({
          ...m,
          value: processMetricValue(m),
          icon: iconMap[m.icon_name] || Building2
        })));
      } else {
        // Fallback
        const defaults = [
          { title: "ILL CCTs", service_type: "Internet Leased Line (ILL)", icon: Laptop },
          { title: "MPLS CCTs", service_type: "MPLS", icon: Server },
          { title: "ISDN PRI", service_type: "ISDN PRI", icon: Phone },
          { title: "SIP Trunks", service_type: "SIP Trunk", icon: PhoneCall },
          { title: "MMVC", service_type: "MMVC", icon: Keyboard },
          { title: "NMECT CCTs", service_type: "None", value: "NMECT 33", icon: Monitor },
          { title: "DOJ", service_type: "Internet Leased Line (ILL)", icon: Building2, footerText: "Details" },
          { title: "CGGB", service_type: "MPLS", icon: Users, footerText: "Explore" },
          { title: "Election Comission", service_type: "Toll Free", icon: Vote },
          { title: "Tobacco Board", service_type: "Internet Leased Line (ILL)", icon: Leaf },
          { title: "NREGS", service_type: "FTTH", icon: RefreshCw },
          { title: "Collectorates", service_type: "Internet Leased Line (ILL)", icon: Building2, footerText: "Details" },
          { title: "NHM", service_type: "FTTH", icon: Stethoscope, footerText: "Details" },
          { title: "Toll FREE", service_type: "Toll Free", icon: PhoneForwarded },
        ];
        setMetrics(defaults.map(m => ({
          ...m,
          value: m.value || processMetricValue(m)
        })));
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tight">Leased Line Inventory</h1>
        <p className="text-gray-400 font-medium">Real-time status and documentation for all active leased line connections.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {metrics.map((item, index) => (
          <LeasedLineCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default LeasedLines;
