import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, CheckCircle } from 'lucide-react';
import { statesData, servicesData } from '../data/locationData';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ─── Reusable custom scrollable select ───────────────────────────────────────
const CustomSelect = ({ label, options, selected, onSelect, disabled = false, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-col space-y-2 relative" ref={ref}>
      {label && <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white text-left flex justify-between items-center focus:ring-2 focus:ring-primary/20 shadow-sm transition-all ${
          disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:border-primary/40'
        }`}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDown size={14} className={`text-primary flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-[100] max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200 backdrop-blur-xl">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className={`px-5 py-3 text-sm cursor-pointer flex justify-between items-center hover:bg-primary/10 transition-colors ${
                selected === opt ? 'bg-primary/20 text-primary font-bold' : 'text-gray-300'
              }`}
            >
              <span className="truncate">{opt}</span>
              {selected === opt && <Check size={13} className="flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Page component ───────────────────────────────────────────────────────────
const CCTRegistration = () => {
  const navigate = useNavigate();
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('enterprise_metrics').select('title');
      if (data && !error) {
        // Use ONLY the titles from your inventory cards
        const cardTitles = data.map(m => m.title);
        setServiceTypes(cardTitles);
        
        // Set first title as default if available
        if (cardTitles.length > 0) {
          setForm(prev => ({ ...prev, serviceType: cardTitles[0] }));
        }
      }
    };
    fetchServices();
  }, []);

  const [form, setForm] = useState({
    enterpriseName: '',
    primaryContactName: '',
    designation: '',
    email: '',
    contactNo: '',
    serviceType: ''
  });
  const [selectedState, setSelectedState]     = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [success, setSuccess] = useState(false);

  const districts = selectedState ? statesData[selectedState] || [] : [];

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('eb_contacts').insert([
        {
          circle: selectedState || '—',
          designation: form.designation || '—',
          name: form.primaryContactName || '—',
          enterprise_name: form.enterpriseName || '—',
          mobile: form.contactNo || '—',
          mail_id: form.email || '—',
          ba_name: selectedDistrict || '—',
          service_type: form.serviceType || '—'
        }
      ]);

      if (error) {
        console.error('Error inserting EB Contact to Supabase:', error.message);
        alert('Failed to register contact in database: ' + error.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/contacts/eb-contacts');
      }, 1500);
    } catch (err) {
      console.error('Exception:', err);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto bg-dark-bg min-h-screen">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Employees Registration</h1>
        <p className="text-gray-400 font-medium">Register official Enterprise Business contacts for government and corporate circuits.</p>
      </div>

      {success && (
        <div className="mb-8 p-5 rounded-2xl flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-2xl animate-in zoom-in duration-300">
          <CheckCircle size={24} className="animate-bounce" />
          <span className="font-bold">Registration successful! Updating EB directory…</span>
        </div>
      )}

      <form className="space-y-8 bg-dark-card p-10 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden" onSubmit={handleSubmit}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">

          {/* Column 1 */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Enterprise Name</label>
              <input
                type="text"
                required
                value={form.enterpriseName}
                onChange={handleChange('enterpriseName')}
                placeholder="Ex: Reliance Jio Infocomm"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Primary Contact Name</label>
              <input
                type="text"
                required
                value={form.primaryContactName}
                onChange={handleChange('primaryContactName')}
                placeholder="Enter Primary Contact Name"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Designation</label>
              <input
                type="text"
                value={form.designation}
                onChange={handleChange('designation')}
                placeholder="Enter Designation"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Email ID</label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="contact@enterprise.com"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Contact No</label>
              <input
                type="text"
                value={form.contactNo}
                onChange={handleChange('contactNo')}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <CustomSelect
                label="Service Type"
                options={serviceTypes}
                selected={form.serviceType}
                onSelect={(val) => setForm({...form, serviceType: val})}
                placeholder="Select Service Type"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <CustomSelect
                label="State"
                options={Object.keys(statesData)}
                selected={selectedState}
                onSelect={handleStateChange}
                placeholder="Select State"
              />
              <CustomSelect
                label="District"
                options={districts}
                selected={selectedDistrict}
                onSelect={setSelectedDistrict}
                disabled={!selectedState}
                placeholder="Select District"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-center mt-12 pt-8 border-t border-dark-border/50">
          <button
            type="submit"
            className="w-full md:w-96 py-4 rounded-2xl text-white font-black shadow-[0_0_30px_rgba(0,180,216,0.2)] bg-primary hover:shadow-[0_0_40px_rgba(0,180,216,0.4)] hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-sm"
          >
            Register EB Contact
          </button>
        </div>
      </form>
    </div>
  );
};

export default CCTRegistration;
