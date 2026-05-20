import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, Hash, Phone, MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ShortCode = () => {
  const [isOpen, setIsOpen]                   = useState(false);
  const [selected, setSelected]               = useState({ name: 'City Name', field: 'city' });
  const [query, setQuery]                     = useState('');
  const [results, setResults]                 = useState([]);
  const [hasSearched, setHasSearched]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [expandedResults, setExpandedResults] = useState({});

  const options = [
    { name: 'City Name',        field: 'city'        },
    { name: 'Toll Free Number', field: 'toll_free'   },
    { name: 'Destination Name', field: 'destination' },
  ];

  const toggleResult = (idx) =>
    setExpandedResults(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    setHasSearched(true);
    setExpandedResults({});
    if (!q) { setResults([]); return; }

    setLoading(true);
    try {
      let dbQuery = supabase.from('short_code').select('*').limit(100);

      if (selected.field === 'city') {
        dbQuery = dbQuery.ilike('city_name', `%${q}%`);
      } else if (selected.field === 'toll_free') {
        dbQuery = dbQuery.ilike('toll_free_no', `%${q}%`);
      } else if (selected.field === 'destination') {
        dbQuery = dbQuery.ilike('destination_name', `%${q}%`);
      }

      const { data, error } = await dbQuery;
      if (error) {
        console.error('Supabase error:', error.message);
        setResults([]);
      } else {
        setResults(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [query, selected]);

  return (
    <div className="h-full flex items-center justify-center p-8 animate-in fade-in zoom-in duration-500 bg-dark-bg min-h-screen">
      <div className="w-full max-w-4xl bg-dark-card rounded-3xl shadow-2xl border border-dark-border p-16 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
              <Hash size={32} />
            </div>
            <h2 className="text-4xl font-black text-white text-center tracking-tight">
              BSNL Short Code Search
            </h2>
            <p className="text-gray-500 font-medium mt-2 text-center">
              Quick access to toll-free numbers and city service identifiers.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Search bar */}
            <div className="flex flex-col md:flex-row items-stretch gap-0 border border-dark-border rounded-2xl overflow-visible shadow-2xl bg-dark-bg focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1">
              {/* Dropdown */}
              <div className="relative min-w-[220px]">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-full h-full flex items-center gap-3 px-6 py-4 bg-dark-card border-r border-dark-border hover:bg-white/5 transition-all cursor-pointer rounded-l-xl"
                >
                  <div className="p-1.5 bg-dark-bg rounded-lg border border-dark-border text-gray-500">
                    <Hash size={18} />
                  </div>
                  <span className="text-sm text-gray-300 font-bold">{selected.name}</span>
                  <ChevronDown size={14} className={`text-gray-500 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-dark-border shadow-2xl rounded-2xl z-50 py-2 animate-in slide-in-from-top-2 duration-300">
                    {options.map(option => (
                      <button
                        key={option.field}
                        onClick={() => { setSelected(option); setIsOpen(false); }}
                        className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm transition-all ${
                          selected.field === option.field
                            ? 'bg-primary/10 text-primary font-black'
                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Hash size={18} />
                        {option.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={`Enter ${selected.name.toLowerCase()}…`}
                className="flex-1 px-8 py-4 text-base text-white bg-transparent outline-none placeholder:text-gray-700 font-medium"
              />

              {/* Button */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary hover:shadow-[0_0_30px_rgba(0,180,216,0.4)] disabled:opacity-60 text-white px-10 py-4 flex items-center gap-3 font-black transition-all active:scale-95 rounded-xl"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <SearchIcon size={20} strokeWidth={3} />}
                <span>{loading ? 'Searching…' : 'Search'}</span>
              </button>
            </div>

            {/* Results */}
            {hasSearched && !loading && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                {results.length > 0 ? (
                  <>
                    <p className="text-sm font-bold text-gray-400 px-1">
                      Found <span className="text-primary font-black">{results.length}</span> result{results.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {results.map((res, i) => (
                        <div
                          key={i}
                          className="flex flex-col bg-dark-bg/50 border border-dark-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all"
                        >
                          <div className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 flex-shrink-0">
                                <MapPin size={22} />
                              </div>
                              <div>
                                <h3 className="text-white font-black text-lg tracking-tight">{res.city_name || '—'}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                                    {res.toll_free_no || '—'}
                                  </span>
                                </div>
                              </div>
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

                          {expandedResults[i] && (
                            <div className="px-6 pb-6 pt-2 border-t border-dark-border/50 bg-dark-bg/20 animate-in slide-in-from-top-2 duration-300">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">City Name</p>
                                  <p className="text-sm font-bold text-gray-300">{res.city_name || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Toll Free Number</p>
                                  <p className="text-sm font-bold text-primary">{res.toll_free_no || '—'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Destination Name</p>
                                  <p className="text-sm font-bold text-gray-300">{res.destination_name || '—'}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-dark-border">
                    <Hash size={36} className="mx-auto text-gray-700 mb-3" />
                    <p className="text-gray-500 font-bold">No short codes found for "{query}"</p>
                    <p className="text-xs text-gray-600 mt-1">Try searching by City Name, Toll Free No, or Destination.</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer stats */}
            <div className="flex items-center justify-center gap-10 mt-2">
              {[
                { label: 'Cities',       value: '26' },
                { label: 'Toll Free Nos', value: '26' },
                { label: 'Source',        value: 'Supabase DB' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                  <span className="text-sm font-black text-gray-300 tracking-tight mt-0.5">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCode;
