import React, { useState, useEffect } from 'react';
import CustomSelect from '../components/CustomSelect';
import { statesData, servicesData } from '../data/locationData';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const CustomerRegistration = () => {
  const navigate = useNavigate();
  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('enterprise_metrics').select('title');
      if (data && !error) {
        const cardTitles = data.map(m => m.title);
        setServiceTypes(cardTitles);
        if (cardTitles.length > 0) {
          setSelectedService(cardTitles[0]);
        }
      }
    };
    fetchServices();
  }, []);

  const [form, setForm] = useState({
    enterpriseName: '',
    designation: '',
    email: '',
    contactNo: '',
    address: '',
    plan: '',
    circuitId: '',
    billingAccountNo: '',
    dateOfCommission: '',
  });

  const [selectedState, setSelectedState]       = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedService, setSelectedService]   = useState('Internet Leased Line (ILL)');
  const [success, setSuccess]                   = useState(false);

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
      // 1. Insert into customers_data
      const { data: custData, error: custError } = await supabase
        .from('customers_data')
        .insert([
          {
            company_name: form.enterpriseName || '—',
            location: selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState || '—',
            contact_name: form.enterpriseName || '—', // Since form doesn't separate contact name
            designation: form.designation || '—',
            contact_no: form.contactNo || '—',
            mail_id: form.email || '—'
          }
        ])
        .select();

      if (custError) {
        console.error('Error saving to customers_data:', custError.message);
        alert('Failed to register customer contact: ' + custError.message);
        return;
      }

      // 2. Identify the service table and insert technical details
      const serviceUpper = (selectedService || '').toUpperCase();
      let serviceError = null;

      if (serviceUpper.includes('ILL') || serviceUpper.includes('LEASED LINE')) {
        const { error } = await supabase.from('ill_data').insert([
          {
            lc_id: form.circuitId || '—',
            billing_account_no: form.billingAccountNo || '—',
            bandwidth: form.plan || '—',
            customer_name: form.enterpriseName || '—',
            address: form.address || '—',
            email_address: form.email || '—',
            phone_no: form.contactNo || '—',
            billing_ssa: selectedDistrict || '—',
            service_start_date: form.dateOfCommission || '—'
          }
        ]);
        serviceError = error;
      } else if (serviceUpper.includes('PRI')) {
        const { error } = await supabase.from('pri_data').insert([
          {
            telephone_no: form.circuitId || '—',
            billing_account_no: form.billingAccountNo || '—',
            customer_name: form.enterpriseName || '—',
            address: form.address || '—',
            pri_plan: form.plan || '—'
          }
        ]);
        serviceError = error;
      } else if (serviceUpper.includes('SIP')) {
        const { error } = await supabase.from('sip_data').insert([
          {
            telephone_no: form.circuitId || '—',
            billing_account_no: form.billingAccountNo || '—',
            customer_name: form.enterpriseName || '—',
            address: form.address || '—',
            sip_plan: form.plan || '—'
          }
        ]);
        serviceError = error;
      } else if (serviceUpper.includes('MMVC')) {
        const { error } = await supabase.from('mmvc_data').insert([
          {
            telephone_no: form.circuitId || '—',
            billing_account_no: form.billingAccountNo || '—',
            customer_name: form.enterpriseName || '—',
            address: form.address || '—',
            mmv_plan: form.plan || '—'
          }
        ]);
        serviceError = error;
      } else if (serviceUpper.includes('MPLS')) {
        const { error } = await supabase.from('mpls_data').insert([
          {
            telephone_no: form.circuitId || '—',
            billing_account_no: form.billingAccountNo || '—',
            bandwidth: form.plan || '—',
            customer_name: form.enterpriseName || '—',
            address: form.address || '—'
          }
        ]);
        serviceError = error;
      }

      if (serviceError) {
        console.error('Error saving technical service details:', serviceError.message);
        alert('Customer registered, but failed to provision technical service: ' + serviceError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/contacts/customer-contacts');
      }, 1500);
    } catch (err) {
      console.error('Exception during customer registration:', err);
      alert('An unexpected error occurred.');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto bg-dark-bg min-h-screen">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Customer Registration</h1>
        <p className="text-gray-400 font-medium">Provision new enterprise services and register customer details.</p>
      </div>

      {success && (
        <div className="mb-8 p-5 rounded-2xl flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-2xl animate-in zoom-in duration-300">
          <CheckCircle size={24} className="animate-bounce" />
          <span className="font-bold">Registration successful! Redirecting to database…</span>
        </div>
      )}

      <form className="space-y-8 bg-dark-card p-10 rounded-3xl border border-dark-border shadow-2xl relative overflow-hidden" onSubmit={handleSubmit}>
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">

          {/* ── Column 1: Basic Info ── */}
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
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Designation</label>
              <select 
                value={form.designation}
                onChange={handleChange('designation')}
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-dark-card">Select Designation</option>
                {['SDE', 'JTO', 'AGM', 'Customer Care', 'IT Manager'].map(opt => (
                  <option key={opt} value={opt} className="bg-dark-card">{opt}</option>
                ))}
              </select>
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

              <div className="flex flex-col space-y-2.5">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Service Category</label>
                <select 
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  {serviceTypes.map(opt => (
                    <option key={opt} value={opt} className="bg-dark-card">{opt}</option>
                  ))}
                </select>
              </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Plan Specification</label>
              <input
                type="text"
                value={form.plan}
                onChange={handleChange('plan')}
                placeholder="Ex: 100Mbps Symmetric ILL"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Date of Commission</label>
              <input
                type="date"
                required
                value={form.dateOfCommission}
                onChange={handleChange('dateOfCommission')}
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ── Column 2: Technical Info ── */}
          <div className="space-y-8">
            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Primary Contact No</label>
              <input
                type="text"
                value={form.contactNo}
                onChange={handleChange('contactNo')}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Installation Address</label>
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Full site address"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2.5">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">State</label>
                <select 
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-dark-card">Select State</option>
                  {Object.keys(statesData).map(opt => (
                    <option key={opt} value={opt} className="bg-dark-card">{opt}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col space-y-2.5">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">BA Name (District)</label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <option value="" className="bg-dark-card">Select BA</option>
                  {(selectedState ? statesData[selectedState] : []).map(opt => (
                    <option key={opt} value={opt} className="bg-dark-card">{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Circuit ID / Phone Number</label>
              <input
                type="text"
                value={form.circuitId}
                onChange={handleChange('circuitId')}
                placeholder="Ex: BSNL-ILL-576-GNT"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="flex flex-col space-y-2.5">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Billing Account No</label>
              <input
                type="text"
                value={form.billingAccountNo}
                onChange={handleChange('billingAccountNo')}
                placeholder="Ex: 8000123456"
                className="w-full px-5 py-3.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-center mt-12 pt-8 border-t border-dark-border/50">
          <button
            type="submit"
            className="w-full md:w-96 py-4 rounded-2xl text-white font-black shadow-[0_0_30px_rgba(0,180,216,0.2)] bg-primary hover:shadow-[0_0_40px_rgba(0,180,216,0.4)] hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-[0.2em] text-sm"
          >
            Confirm Registration
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerRegistration;
