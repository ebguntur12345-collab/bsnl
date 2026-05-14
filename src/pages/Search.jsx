import React, { useState } from 'react';
import { Search as SearchIcon, User, CreditCard, Phone, ChevronDown } from 'lucide-react';

const Search = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({ name: 'Name Search', icon: User });

  const options = [
    { name: 'Name Search', icon: User },
    { name: 'Billing Account', icon: CreditCard },
    { name: 'Phone Number', icon: Phone },
  ];

  return (
    <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500 bg-dark-bg min-h-screen">
      <div className="w-full max-w-4xl bg-dark-card rounded-3xl shadow-2xl border border-dark-border p-16 relative overflow-hidden">
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
                placeholder={`Search by ${selected.name.toLowerCase()}...`} 
                className="flex-1 px-8 py-4 text-base text-white bg-transparent outline-none placeholder:text-gray-700 font-medium"
              />
              
              {/* Button part */}
              <button className="bg-primary hover:shadow-[0_0_30px_rgba(0,180,216,0.4)] text-white px-10 py-4 flex items-center gap-3 font-black transition-all active:scale-95 rounded-xl">
                <SearchIcon size={20} strokeWidth={3} />
                <span>Search</span>
              </button>
            </div>
            
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
