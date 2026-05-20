import React, { useState, useEffect } from 'react';
import { Search, Laptop, ChevronRight, ChevronDown, Info, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ILL576Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchILLData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('ill_data')
          .select('*')
          .order('id', { ascending: true });

        if (error) {
          console.error('Error loading ILL data:', error.message);
        } else if (data) {
          const mapped = data.map(r => ({
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
            service: 'Internet Leased Line (ILL)'
          }));
          setUsers(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchILLData();
  }, []);

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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Laptop size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">ILL CCTs — {loading ? '…' : users.length} Users</h1>
            <p className="text-gray-400 text-sm font-medium">
              {loading ? 'Searching live database…' : `${filtered.length} registered ILL circuit customer${filtered.length !== 1 ? 's' : ''} found`}
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
            placeholder="Search by name, circuit ID, location…"
            className="pl-9 pr-4 py-2.5 w-80 bg-dark-card border border-dark-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm text-gray-300 placeholder:text-gray-600 transition-all"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total ILL Users', value: users.length, color: 'text-cyan-400' },
          { label: 'Active Circuits', value: users.filter(u => u.circuitId && u.circuitId !== '—').length, color: 'text-emerald-400' },
          { label: 'Standard Plans', value: users.filter(u => u.plan && u.plan !== '—').length, color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{loading ? '…' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-dark-border shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
              {['#', 'Company / Customer', 'Location', 'Circuit ID', 'Plan', 'Contact No', 'Details'].map(h => (
                <th key={h} className="px-5 py-3.5 font-black text-[11px] uppercase tracking-widest border-r border-white/10 last:border-r-0 last:text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-dark-card divide-y divide-dark-border">
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
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-500 font-bold">{index + 1}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-white">{user.companyName || '—'}</p>
                        <p className="text-xs text-gray-500">{user.mailId || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{user.location || '—'}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-[11px] font-black tracking-wider">
                          {user.circuitId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-400">{user.plan || '—'}</td>
                      <td className="px-5 py-4 text-sm text-gray-400">{user.contactNo || '—'}</td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => toggleRow(rowId)}
                          className="p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors mx-auto flex items-center justify-center"
                        >
                          {expandedRows[rowId] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {expandedRows[rowId] && (
                      <tr className="bg-dark-bg/50">
                        <td colSpan="7" className="px-8 py-6 border-b border-dark-border">
                          <div className="flex items-center gap-2 mb-4">
                            <Info size={15} className="text-cyan-400" />
                            <h4 className="font-black text-cyan-400 text-xs uppercase tracking-widest">Full Circuit Details</h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 bg-dark-card p-5 rounded-xl border border-dark-border">
                            {[
                              { label: 'Service Type', value: user.service },
                              { label: 'Billing Acc No', value: user.billingAccountNo },
                              { label: 'Date of Commission', value: user.dateOfCommission },
                              { label: 'Location (SSA)', value: user.location },
                              { label: 'Installation Address', value: user.address },
                            ].map((f, i) => (
                              <div key={i}>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{f.label}</p>
                                <p className="text-sm font-semibold text-white">{f.value || 'N/A'}</p>
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
                <td colSpan="7" className="px-5 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-dark-bg border border-dark-border flex items-center justify-center">
                      <Laptop size={32} className="text-gray-700" />
                    </div>
                    <p className="text-gray-500 font-semibold">
                      {searchTerm ? `No users found for "${searchTerm}"` : 'No ILL CCT users registered yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ILL576Users;
