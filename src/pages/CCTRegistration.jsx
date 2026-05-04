import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, CheckCircle } from 'lucide-react';
import { statesData, servicesData } from '../data/locationData';
import { useNavigate } from 'react-router-dom';

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
      {label && <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">{label}</label>}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 text-left flex justify-between items-center focus:ring-2 focus:ring-blue-400 shadow-sm transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-blue-400'
        }`}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDown size={14} className={`text-[#3b3598] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#b3b2e6] rounded-md shadow-xl z-[100] max-h-56 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onSelect(opt); setIsOpen(false); }}
              className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center hover:bg-blue-50 transition-colors ${
                selected === opt ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'
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

  const [form, setForm] = useState({
    enterpriseName: '',
    designation: '',
    email: '',
    contactNo: '',
    address: '',
    plan: '',
    circuitId: '',
    billingAccountNo: '',
  });
  const [selectedService, setSelectedService] = useState('ILL CCTs');
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEntry = {
      id: Date.now(),
      // EB Contacts fields
      circle: selectedState || '—',
      baName: selectedDistrict || '—',
      name: form.enterpriseName,
      mobile: form.contactNo,
      email: form.email,
      designation: form.designation || '—',
      // Extra fields
      companyName: form.enterpriseName,
      location: selectedDistrict ? `${selectedDistrict}, ${selectedState}` : selectedState || '—',
      contactName: form.enterpriseName,
      contactNo: form.contactNo,
      mailId: form.email,
      address: form.address,
      service: selectedService,
      plan: form.plan,
      circuitId: form.circuitId,
      billingAccountNo: form.billingAccountNo,
      registeredAt: new Date().toLocaleString(),
      isNew: true,
    };

    // Save to localStorage so CustomerContacts can read it
    const existing = JSON.parse(localStorage.getItem('cctRegistrations') || '[]');
    localStorage.setItem('cctRegistrations', JSON.stringify([newEntry, ...existing]));

    setSuccess(true);
    setTimeout(() => {
      navigate('/contacts/eb-contacts');
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto mt-4">
        <h2 className="text-xl font-black text-[#3b3598] mb-8 border-b-2 border-purple-100 pb-2 inline-block uppercase tracking-tight">
          CCT Registration
        </h2>

        {success && (
          <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 shadow-sm animate-in fade-in duration-300">
            <CheckCircle size={20} />
            <span className="font-semibold">Registration successful! Redirecting to Customer Contacts…</span>
          </div>
        )}

        <form className="space-y-6 pb-24" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6">

            {/* Column 1 */}
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Enterprise Name</label>
                <input
                  type="text"
                  required
                  value={form.enterpriseName}
                  onChange={handleChange('enterpriseName')}
                  placeholder="Enter Customer name"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>

              <CustomSelect
                label="Designation"
                options={['SDE', 'JTO', 'AGM']}
                selected={form.designation}
                onSelect={(val) => setForm(prev => ({ ...prev, designation: val }))}
                placeholder="Select Designation"
              />

              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="Enter email"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>

              <CustomSelect
                label="Service"
                options={servicesData}
                selected={selectedService}
                onSelect={setSelectedService}
              />

              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Plan</label>
                <input
                  type="text"
                  value={form.plan}
                  onChange={handleChange('plan')}
                  placeholder="Enter plan Details"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Contact No</label>
                <input
                  type="text"
                  value={form.contactNo}
                  onChange={handleChange('contactNo')}
                  placeholder="Contact No"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Customer Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Enter Address"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>

              {/* State & District row */}
              <div className="grid grid-cols-2 gap-4">
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

              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Circuit Id / Phone Number</label>
                <input
                  type="text"
                  value={form.circuitId}
                  onChange={handleChange('circuitId')}
                  placeholder="Enter Circuit Id / Phone Number"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="text-[#3b3598] text-sm font-black uppercase tracking-tight">Billing Account No</label>
                <input
                  type="text"
                  value={form.billingAccountNo}
                  onChange={handleChange('billingAccountNo')}
                  placeholder="Enter Billing Account No"
                  className="w-full px-4 py-2.5 bg-white border border-[#b3b2e6] rounded-md text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>
            </div>

          </div>

          <div className="flex justify-center mt-12 pt-4">
            <button
              type="submit"
              className="w-[500px] py-3 rounded text-white font-black shadow-xl bg-gradient-to-r from-[#1b1464] to-[#00d2ff] hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CCTRegistration;
