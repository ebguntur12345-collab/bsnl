import React, { useState, useCallback } from 'react';
import { Search as SearchIcon, User, CreditCard, Phone, ChevronDown, Building2, Database, MapPin, Loader2, Hash, Wifi } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ── Constants ────────────────────────────────────────────────────────────────

const SEARCH_OPTIONS = [
  { name: 'Name / Company',  icon: User,     field: 'name'    },
  { name: 'Billing Account', icon: CreditCard, field: 'billing' },
  { name: 'Phone Number',    icon: Phone,    field: 'phone'   },
  { name: 'Short Code',      icon: Hash,     field: 'short'   },
  { name: 'Circuit ID',      icon: Wifi,     field: 'circuit' },
];

// The tables to search and how to map them
const TABLE_CONFIGS = [
  {
    table: 'ill_data',
    label: 'ILL',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'phone_no',
    circuitField: 'lc_id',
    extra: r => ({ bandwidth: r.bandwidth, address: r.address, email: r.email_address, ssa: r.billing_ssa }),
  },
  {
    table: 'pri_data',
    label: 'PRI',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ plan: r.pri_plan, address: r.address }),
  },
  {
    table: 'sip_data',
    label: 'SIP',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ plan: r.sip_plan, address: r.address }),
  },
  {
    table: 'mmvc_data',
    label: 'MMVC',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ plan: r.mmv_plan, address: r.address }),
  },
  {
    table: 'mpls_data',
    label: 'MPLS',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ bandwidth: r.bandwidth, address: r.address }),
  },
  {
    table: 'nmect_data',
    label: 'NMECT',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ plan: r.nmect_plan, address: r.address }),
  },
  {
    table: 'cggb',
    label: 'CGGB',
    nameField:    'name',
    billingField: 'billing_account',
    circuitField: 'circuit_id',
    extra: r => ({ bandwidth: r.bandwidth, oa: r.oa, field_incharge: r.field_incharge_name, contact: r.field_incharge_number }),
  },
  {
    table: 'customers_data',
    label: 'Customer',
    nameField:    'company_name',
    phoneField:   'contact_no',
    extra: r => ({ designation: r.designation, contact_name: r.contact_name, email: r.mail_id, location: r.location }),
  },
  {
    table: 'tobacco_board',
    label: 'Tobacco Board',
    nameField:    'location',
    billingField: 'billing_account',
    circuitField: 'lc_id',
    phoneField:   'contact_no',
    extra: r => ({ bandwidth: r.bandwidth, circle: r.circle, ba_name: r.ba_name, eb_incharge: r.eb_incharge }),
  },
  {
    table: 'toll_free',
    label: 'Toll Free',
    nameField:    'customer_name',
    billingField: 'billing_account_no',
    phoneField:   'telephone_no',
    extra: r => ({ address: r.address }),
  },
  {
    table: 'eb_contacts',
    label: 'EB Contact',
    nameField: 'name',
    phoneField: 'mobile',
    extra: r => ({ designation: r.designation, circle: r.circle, ba_name: r.ba_name, email: r.mail_id }),
  },
  {
    table: 'nregs',
    label: 'NREGS',
    nameField: 'computer_operator_name',
    phoneField: 'telephone_no',
    extra: r => ({ district: r.district, mandal: r.mandal, contact_no: r.contact_no, drp_contact: r.drp_contact_no }),
  },
  {
    table: 'short_code',
    label: 'Short Code',
    nameField:  'destination_name',
    phoneField: 'toll_free_no',
    extra: r => ({ city: r.city_name }),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const ilike = (q) => `%${q}%`;

async function searchTable(config, field, query) {
  let q;
  try {
    const { table, nameField, billingField, phoneField, circuitField } = config;
    const base = supabase.from(table).select('*').limit(50);

    if (field === 'name' && nameField) {
      q = base.ilike(nameField, ilike(query));
    } else if (field === 'billing' && billingField) {
      q = base.ilike(billingField, ilike(query));
    } else if (field === 'phone' && phoneField) {
      q = base.ilike(phoneField, ilike(query));
    } else if (field === 'circuit' && circuitField) {
      q = base.ilike(circuitField, ilike(query));
    } else if (field === 'short' && table === 'short_code') {
      q = base.or(`toll_free_no.ilike.${ilike(query)},destination_name.ilike.${ilike(query)},city_name.ilike.${ilike(query)}`);
    } else {
      return [];
    }

    const { data, error } = await q;
    if (error || !data) return [];

    return data.map(row => ({
      _source: config.label,
      _table:  config.table,
      name:    row[nameField] || '—',
      billing: billingField ? row[billingField] : null,
      phone:   phoneField   ? row[phoneField]   : null,
      circuit: circuitField ? row[circuitField] : null,
      ...config.extra(row),
    }));
  } catch {
    return [];
  }
}

// ── Component ────────────────────────────────────────────────────────────────

const Search = () => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [selected, setSelected]             = useState(SEARCH_OPTIONS[0]);
  const [query, setQuery]                   = useState('');
  const [results, setResults]               = useState([]);
  const [hasSearched, setHasSearched]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [expandedResults, setExpandedResults] = useState({});

  const toggleResult = (idx) =>
    setExpandedResults(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    setHasSearched(true);
    setExpandedResults({});
    if (!q) { setResults([]); return; }

    setLoading(true);
    try {
      const promises = TABLE_CONFIGS.map(cfg => searchTable(cfg, selected.field, q));
      const allResults = await Promise.all(promises);
      const flat = allResults.flat();
      setResults(flat);
    } finally {
      setLoading(false);
    }
  }, [query, selected]);

  // ── Tag colour per source ─────────────────────────────────────────────────
  const tagColor = (source) => {
    const m = {
      'ILL':          'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      'PRI':          'bg-violet-500/10 text-violet-400 border-violet-500/20',
      'SIP':          'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'MMVC':         'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'MPLS':         'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'NMECT':        'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'CGGB':         'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Customer':     'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'Tobacco Board':'bg-lime-500/10 text-lime-400 border-lime-500/20',
      'Toll Free':    'bg-sky-500/10 text-sky-400 border-sky-500/20',
      'EB Contact':   'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'NREGS':        'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Short Code':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    return m[source] || 'bg-primary/10 text-primary border-primary/20';
  };

  // Build detail grid for expanded view
  const getDetailFields = (res) => {
    const fields = [];
    if (res.bandwidth)     fields.push({ label: 'Bandwidth',      value: res.bandwidth });
    if (res.address)       fields.push({ label: 'Address',        value: res.address });
    if (res.plan)          fields.push({ label: 'Plan',           value: res.plan });
    if (res.email)         fields.push({ label: 'Email',          value: res.email });
    if (res.email_address) fields.push({ label: 'Email',          value: res.email_address });
    if (res.ssa)           fields.push({ label: 'Billing SSA',    value: res.ssa });
    if (res.circuit)       fields.push({ label: 'Circuit / LC ID', value: res.circuit });
    if (res.billing)       fields.push({ label: 'Billing Account', value: res.billing });
    if (res.phone)         fields.push({ label: 'Phone',          value: res.phone });
    if (res.designation)   fields.push({ label: 'Designation',    value: res.designation });
    if (res.contact_name)  fields.push({ label: 'Contact Name',   value: res.contact_name });
    if (res.location)      fields.push({ label: 'Location',       value: res.location });
    if (res.circle)        fields.push({ label: 'Circle',         value: res.circle });
    if (res.ba_name)       fields.push({ label: 'BA Name',        value: res.ba_name });
    if (res.eb_incharge)   fields.push({ label: 'EB Incharge',    value: res.eb_incharge });
    if (res.field_incharge) fields.push({ label: 'Field Incharge', value: res.field_incharge });
    if (res.contact)       fields.push({ label: 'Contact',        value: res.contact });
    if (res.oa)            fields.push({ label: 'OA',             value: res.oa });
    if (res.district)      fields.push({ label: 'District',       value: res.district });
    if (res.mandal)        fields.push({ label: 'Mandal',         value: res.mandal });
    if (res.contact_no)    fields.push({ label: 'Contact No',     value: res.contact_no });
    if (res.drp_contact)   fields.push({ label: 'DRP Contact',    value: res.drp_contact });
    if (res.city)          fields.push({ label: 'City',           value: res.city });
    return fields;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex items-start justify-center p-8 animate-in fade-in zoom-in duration-500 bg-dark-bg min-h-screen">
      <div className="w-full max-w-5xl bg-dark-card rounded-3xl shadow-2xl border border-dark-border p-12 relative mt-8">
        {/* Decorative blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-[0_0_20px_rgba(0,180,216,0.2)]">
              <Database size={32} />
            </div>
            <h2 className="text-4xl font-black text-white text-center tracking-tight">
              BSNL Smart Search
            </h2>
            <p className="text-gray-500 font-medium mt-2 text-center">
              Search across ILL, PRI, SIP, MMVC, MPLS, CGGB, NREGS, Tobacco Board, Toll Free &amp; more.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex flex-col md:flex-row items-stretch gap-0 border border-dark-border rounded-2xl overflow-visible shadow-2xl bg-dark-bg focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1 mb-8">
            {/* Dropdown */}
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
                  {SEARCH_OPTIONS.map(option => (
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

            {/* Input */}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder={`Search by ${selected.name.toLowerCase()}…`}
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
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* Count */}
              {results.length > 0 && (
                <div className="flex items-center justify-between px-1 mb-2">
                  <p className="text-sm font-bold text-gray-400">
                    Found <span className="text-primary font-black">{results.length}</span> record{results.length !== 1 ? 's' : ''} across all services
                  </p>
                </div>
              )}

              {results.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {results.map((res, i) => (
                    <div
                      key={i}
                      className="flex flex-col bg-dark-bg/50 border border-dark-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group"
                    >
                      {/* Card header */}
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 flex-shrink-0">
                            <Building2 size={22} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-white font-black text-base tracking-tight truncate max-w-sm">{res.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {/* Source badge */}
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${tagColor(res._source)}`}>
                                {res._source}
                              </span>
                              {res.billing && (
                                <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded bg-white/5">
                                  Billing: {res.billing}
                                </span>
                              )}
                              {res.phone && (
                                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                  <Phone size={10} /> {res.phone}
                                </span>
                              )}
                              {res.circuit && (
                                <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                                  <Wifi size={10} /> {res.circuit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleResult(i)}
                          className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                            expandedResults[i] ? 'bg-primary text-white' : 'bg-white/5 text-gray-500 hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <ChevronDown size={18} className={`transition-transform duration-300 ${expandedResults[i] ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Expanded details */}
                      {expandedResults[i] && (
                        <div className="px-5 pb-5 pt-2 border-t border-dark-border/50 bg-dark-bg/20 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                            {getDetailFields(res).map((f, j) => (
                              <div key={j} className="min-w-0">
                                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{f.label}</p>
                                <p className="text-xs font-bold text-gray-300 break-words leading-relaxed">{f.value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-dark-border">
                  <SearchIcon size={40} className="mx-auto text-gray-700 mb-4" />
                  <p className="text-gray-500 font-bold">No records found for "{query}"</p>
                  <p className="text-xs text-gray-600 mt-1">Try a different keyword or search type.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
