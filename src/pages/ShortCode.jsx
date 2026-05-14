import React, { useState } from 'react';
import { Search as SearchIcon, User, CreditCard, Phone, ChevronDown, Hash, Building2 } from 'lucide-react';

const ShortCode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({ name: 'Short Code', icon: Hash, field: 'shortCode' });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedResults, setExpandedResults] = useState({});

  const toggleResult = (idx) => {
    setExpandedResults(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const options = [
    { name: 'Short Code', icon: Hash, field: 'shortCode' },
    { name: 'Name Search', icon: User, field: 'enterpriseName' },
    { name: 'Billing Account', icon: CreditCard, field: 'billingAccount' },
    { name: 'Phone Number', icon: Phone, field: 'phone' },
  ];

  const handleSearch = () => {
    setHasSearched(true);
    setExpandedResults({});
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const regs = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    const mockData = regs.map((r, i) => ({
      ...r,
      billingAccount: r.billingAccount || `BA100${450 + i}`,
      shortCode: r.shortCode || `SC${800 + i}`,
      status: i % 3 === 0 ? 'Active' : 'Pending',
      plan: 'MPLS VPN'
    }));

    const searchType = selected.name;
    const filtered = mockData.filter(item => {
      const q = query.toLowerCase().trim();
      if (!q) return false;

      if (searchType === 'Short Code') return String(item.shortCode || '').toLowerCase().includes(q);
      if (searchType === 'Name Search') return String(item.companyName || '').toLowerCase().includes(q) || String(item.enterpriseName || '').toLowerCase().includes(q);
      if (searchType === 'Phone Number') return String(item.mobile || '').includes(q) || String(item.contactNo || '').includes(q);
      if (searchType === 'Billing Account') return String(item.billingAccount || '').toLowerCase().includes(q);
      return false;
    });

    setResults(filtered);
  };

  return (
    <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500 bg-dark-bg min-h-screen">
      <div className="w-full max-w-4xl bg-dark-card rounded-3xl shadow-2xl border border-dark-border p-16 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
              <Hash size={32} />
            </div>
            <h2 className="text-4xl font-black text-white text-center tracking-tight">
              BSNL Short Code Search
            </h2>
            <p className="text-gray-500 font-medium mt-2 text-center">Quick access to short codes and customer service identifiers.</p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-stretch gap-0 border border-dark-border rounded-2xl overflow-visible shadow-2xl bg-dark-bg focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1">
              <div className="relative min-w-[220px]">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full h-full flex items-center gap-3 px-6 py-4 bg-dark-card border-r border-dark-border hover:bg-white/5 transition-all cursor-pointer rounded-l-xl"
                >
                  <div className="p-1.5 bg-dark-bg rounded-lg border border-dark-border text-gray-500">
                    <selected.icon size={18} />
                  </div>
                  <span className="text-sm text-gray-300 font-bold">{selected.name}</span>
                  <ChevronDown size={14} className={`text-gray-500 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-dark-border shadow-2xl rounded-2xl z-50 py-2 animate-in slide-in-from-top-2 duration-300">
                    {options.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => { setSelected(option); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm transition-all ${
                          selected.name === option.name 
                            ? 'bg-primary/10 text-primary font-black' 
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <option.icon size={18} />
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Enter ${selected.name.toLowerCase()}...`} 
                className="flex-1 px-8 py-4 text-base text-white bg-transparent outline-none placeholder:text-gray-700 font-medium"
              />
              
              <button onClick={handleSearch} className="bg-primary hover:shadow-[0_0_30px_rgba(0,180,216,0.4)] text-white px-10 py-4 flex items-center gap-3 font-black transition-all active:scale-95 rounded-xl">
                <SearchIcon size={20} strokeWidth={3} />
                <span>Search</span>
              </button>
            </div>

            {hasSearched && (
              <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {results.map((res, i) => (
                      <div key={i} className="flex flex-col bg-dark-bg/50 border border-dark-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group">
                        <div className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                              <Building2 size={24} />
                            </div>
                            <div>
                              <h3 className="text-white font-black text-lg tracking-tight">{res.enterpriseName || res.companyName}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-xs font-black text-primary uppercase tracking-widest">{res.shortCode}</span>
                                <span className="text-xs font-bold text-gray-500 px-2 py-0.5 rounded bg-white/5">{res.mobile || res.contactNo}</span>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => toggleResult(i)} className={`p-3 rounded-xl transition-all ${expandedResults[i] ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-primary'}`}>
                             <ChevronDown size={20} className={`transition-transform duration-300 ${expandedResults[i] ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        {expandedResults[i] && (
                          <div className="px-6 pb-6 pt-2 border-t border-dark-border/50 bg-dark-bg/20">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Circle</p><p className="text-sm font-bold text-gray-300">{res.circle || '—'}</p></div>
                                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Billing Account</p><p className="text-sm font-bold text-gray-300">{res.billingAccount || '—'}</p></div>
                                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Plan</p><p className="text-sm font-bold text-gray-300">{res.plan || '—'}</p></div>
                                <div><p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</p><p className="text-sm font-bold text-emerald-500">{res.status || '—'}</p></div>
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-dark-border">
                    <p className="text-gray-500 font-bold">No short codes found for "{query}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCode;
