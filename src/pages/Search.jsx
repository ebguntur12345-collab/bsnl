import React, { useState } from 'react';
import { Search as SearchIcon, User, CreditCard, Phone, ChevronDown, Building2 } from 'lucide-react';

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({ name: 'Name Search', icon: User, field: 'enterpriseName' });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [expandedResults, setExpandedResults] = useState({});

  const toggleResult = (idx) => {
    setExpandedResults(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const options = [
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

    // Get registrations from localStorage
    const regs = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    
    // Add some mock billing account data for demo
    const mockData = regs.map((r, i) => ({
      ...r,
      billingAccount: r.billingAccount || `BA100${450 + i}`,
      status: i % 3 === 0 ? 'Active' : 'Pending',
      plan: '100 Mbps ILL'
    }));

    const searchType = selected.name;
    const filtered = mockData.filter(item => {
      const q = query.toLowerCase().trim();
      if (!q) return false;

      if (searchType === 'Name Search') {
        const companyName = String(item.companyName || '').toLowerCase();
        const contactName = String(item.contactName || '').toLowerCase();
        const enterpriseName = String(item.enterpriseName || '').toLowerCase();
        const name = String(item.name || '').toLowerCase();
        return companyName.includes(q) || contactName.includes(q) || enterpriseName.includes(q) || name.includes(q);
      }
      
      if (searchType === 'Phone Number') {
        const mobile = String(item.mobile || '');
        const contactNo = String(item.contactNo || '');
        const phone = String(item.phone || '');
        return mobile.includes(q) || contactNo.includes(q) || phone.includes(q);
      }
      
      if (searchType === 'Billing Account') {
        const billingAccount = String(item.billingAccount || '').toLowerCase();
        const billingAccountNo = String(item.billingAccountNo || '').toLowerCase();
        return billingAccount.includes(q) || billingAccountNo.includes(q);
      }
      return false;
    });

    setResults(filtered);
  };

  return (
    <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500 bg-dark-bg min-h-screen">
      <div className="w-full max-w-4xl bg-dark-card rounded-3xl shadow-2xl border border-dark-border p-16 relative">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
              <SearchIcon size={32} />
            </div>
            <h2 className="text-4xl font-black text-white text-center tracking-tight">
              BSNL Smart Search
            </h2>
            <p className="text-gray-500 font-medium mt-2">Find customer data, billing history, and network status instantly.</p>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-stretch gap-0 border border-dark-border rounded-2xl overflow-visible shadow-2xl bg-dark-bg focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1">
              {/* Dropdown part */}
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
                        onClick={() => {
                          setSelected(option);
                          setIsOpen(false);
                        }}
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
              
              {/* Input part */}
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Search by ${selected.name.toLowerCase()}...`} 
                className="flex-1 px-8 py-4 text-base text-white bg-transparent outline-none placeholder:text-gray-700 font-medium"
              />
              
              {/* Button part */}
              <button 
                onClick={handleSearch}
                className="bg-primary hover:shadow-[0_0_30px_rgba(0,180,216,0.4)] text-white px-10 py-4 flex items-center gap-3 font-black transition-all active:scale-95 rounded-xl"
              >
                <SearchIcon size={20} strokeWidth={3} />
                <span>Search</span>
              </button>
            </div>

            {/* Search Results */}
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
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{res.billingAccount}</span>
                                <span className="text-xs font-bold text-gray-500 px-2 py-0.5 rounded bg-white/5">{res.mobile || res.contactNo}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="hidden md:block">
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-1">Status</span>
                              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                                res.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                              }`}>{res.status}</span>
                            </div>
                            <div className="hidden md:block">
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-1">Active Plan</span>
                              <span className="text-xs font-black text-gray-300">{res.plan}</span>
                            </div>
                            <button 
                              onClick={() => toggleResult(i)}
                              className={`p-3 rounded-xl transition-all ${
                                expandedResults[i] ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-primary'
                              }`}
                            >
                               <ChevronDown size={20} className={`transition-transform duration-300 ${expandedResults[i] ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {expandedResults[i] && (
                          <div className="px-6 pb-6 pt-2 border-t border-dark-border/50 bg-dark-bg/20 animate-in slide-in-from-top-4 duration-300">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Circle / State</p>
                                  <p className="text-sm font-bold text-gray-300">{res.circle || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">BA Name / District</p>
                                  <p className="text-sm font-bold text-gray-300">{res.baName || res.location || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Primary Contact</p>
                                  <p className="text-sm font-bold text-gray-300">{res.primaryContactName || res.contactName || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Designation</p>
                                  <p className="text-sm font-bold text-gray-300">{res.designation || '—'}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Email ID</p>
                                  <p className="text-sm font-bold text-gray-300">{res.email || res.mailId || '—'}</p>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Registered At</p>
                                  <p className="text-sm font-bold text-gray-300">{res.registeredAt || '—'}</p>
                                </div>
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-dark-border">
                    <p className="text-gray-500 font-bold">No records found matching "{query}"</p>
                    <p className="text-xs text-gray-600 mt-1">Try searching with a different keyword or category.</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-center gap-8 mt-2">
               {[
                 { label: 'Total Records', value: '142K+' },
                 { label: 'Active Lines', value: '12.4K' },
                 { label: 'Sync Status', value: '99.9%' }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-sm font-black text-gray-300 tracking-tight">{stat.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
