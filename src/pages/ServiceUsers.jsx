import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Laptop, ChevronRight, ChevronDown, Info, ArrowLeft, Users, Zap, Phone, Globe, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ServiceUsers = () => {
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);

  // Human-readable title mapping
  const decodedService = decodeURIComponent(serviceType);
  
  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true);
      try {
        const target = decodedService.toLowerCase();
        let table = 'customers_data';
        
        if (target.includes('ill') || target.includes('leased line')) table = 'ill_data';
        else if (target.includes('pri')) table = 'pri_data';
        else if (target.includes('sip')) table = 'sip_data';
        else if (target.includes('mmvc')) table = 'mmvc_data';
        else if (target.includes('mpls')) table = 'mpls_data';

        const { data, error } = await supabase
          .from(table)
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error(error);
          setUsers([]);
        } else if (data) {
          // Map to uniform UI format
          const mapped = data.map(r => {
            if (table === 'ill_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: r.email_address || '—',
                location: r.billing_ssa || '—',
                circuitId: r.lc_id || '—',
                plan: r.bandwidth || '—',
                contactNo: r.phone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: r.service_start_date || '—',
                address: r.address || '—',
                serviceType: 'Internet Leased Line (ILL)'
              };
            } else if (table === 'pri_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.pri_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'ISDN PRI'
              };
            } else if (table === 'sip_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.sip_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'SIP Trunk'
              };
            } else if (table === 'mmvc_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.mmv_plan || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'MMVC'
              };
            } else if (table === 'mpls_data') {
              return {
                id: r.id,
                companyName: r.customer_name || '—',
                mailId: '—',
                location: '—',
                circuitId: r.telephone_no || '—',
                plan: r.bandwidth || '—',
                contactNo: r.telephone_no || '—',
                billingAccountNo: r.billing_account_no || '—',
                dateOfCommission: '—',
                address: r.address || '—',
                serviceType: 'MPLS VPN'
              };
            } else {
              return {
                id: r.id,
                companyName: r.company_name || '—',
                mailId: r.mail_id || '—',
                location: r.location || '—',
                circuitId: '—',
                plan: '—',
                contactNo: r.contact_no || '—',
                billingAccountNo: '—',
                dateOfCommission: '—',
                address: '—',
                serviceType: 'General'
              };
            }
          });
          setUsers(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServiceData();
  }, [decodedService]);

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = searchTerm.trim()
    ? users.filter(u =>
        (u.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.contactName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.contactNo || '').includes(searchTerm) ||
        (u.circuitId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const getIcon = () => {
    const t = decodedService.toLowerCase();
    if (t.includes('ill')) return <Zap size={24} className="text-white" />;
    if (t.includes('mpls')) return <Globe size={24} className="text-white" />;
    if (t.includes('sip') || t.includes('pri')) return <Phone size={24} className="text-white" />;
    return <Laptop size={24} className="text-white" />;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/leased-lines')}
            className="p-2 rounded-xl bg-dark-card border border-dark-border text-gray-400 hover:text-white hover:border-primary/40 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
            {getIcon()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">{decodedService} Customers</h1>
            <p className="text-gray-400 text-sm font-medium">
              {loading ? 'Loading live circuits…' : `${filtered.length} active circuit${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by company, ID, location…"
            className="pl-9 pr-4 py-2.5 w-80 bg-dark-card border border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-300 placeholder:text-gray-600 transition-all"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: `Total ${decodedService} Users`, value: users.length, color: 'text-primary' },
          { label: 'Active Circuits', value: users.filter(u => u.circuitId && u.circuitId !== '—').length, color: 'text-emerald-400' },
          { label: 'Standard Plans', value: users.filter(u => u.plan && u.plan !== '—').length, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5 border-l-4 border-l-primary/30">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{loading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-dark-border shadow-2xl bg-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-bg/50 text-gray-500 border-b border-dark-border">
                {['#', 'Company / Customer', 'Location', 'Circuit ID / Phone', 'Plan / Bandwidth', 'Contact No', 'Details'].map(h => (
                  <th key={h} className="px-5 py-4 font-black text-[10px] uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-20 text-center">
                    <Loader2 size={32} className="animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((user, index) => {
                  const rowId = user.id || index;
                  return (
                    <React.Fragment key={rowId}>
                      <tr className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-5 py-4 text-sm text-gray-500 font-bold">{index + 1}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-white">{user.companyName || '—'}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{user.mailId || '—'}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.location || '—'}</td>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black tracking-wider uppercase">
                            {user.circuitId || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.plan || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-medium">{user.contactNo || '—'}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => toggleRow(rowId)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"
                          >
                            {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRows[rowId] && (
                        <tr className="bg-dark-bg/30">
                          <td colSpan="7" className="px-10 py-8 border-b border-dark-border/50">
                            <div className="flex items-center gap-2 mb-6">
                              <Info size={14} className="text-primary" />
                              <h4 className="font-black text-primary text-[10px] uppercase tracking-[0.2em]">Full Circuit Specifications</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 bg-dark-card/50 p-6 rounded-2xl border border-dark-border">
                              {[
                                { label: 'Service Category', value: user.serviceType },
                                { label: 'Billing Account', value: user.billingAccountNo },
                                { label: 'Commission Date', value: user.dateOfCommission },
                                { label: 'Installation SSA', value: user.location },
                                { label: 'Full Site Address', value: user.address },
                              ].map((f, i) => (
                                <div key={i}>
                                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">{f.label}</p>
                                  <p className="text-xs font-bold text-white leading-relaxed">{f.value || 'N/A'}</p>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-3xl bg-dark-bg border border-dark-border flex items-center justify-center">
                        <Users size={32} className="text-gray-700" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 font-black text-sm uppercase tracking-widest">
                          {searchTerm ? `No results for "${searchTerm}"` : `No ${decodedService} Customers`}
                        </p>
                        <p className="text-gray-600 text-xs font-bold">No circuits currently provisioned in database.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ServiceUsers;
