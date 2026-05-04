import React, { useState } from 'react';
import { Search as SearchIcon, User, CreditCard, Phone, ChevronDown, Hash } from 'lucide-react';

const ShortCode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({ name: 'Short Code Search', icon: Hash });

  const options = [
    { name: 'Short Code Search', icon: Hash },
    { name: 'Name Search', icon: User },
    { name: 'Billing Account', icon: CreditCard },
    { name: 'Phone Number', icon: Phone },
  ];

  return (
    <div className="h-full flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-gray-100 p-12">
        <h2 className="text-2xl font-bold text-[#1e40af] text-center mb-10 tracking-tight">
          BSNL Short Code Search
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
          <label className="text-gray-500 font-medium whitespace-nowrap">
            Select Customer Information:
          </label>
          
          <div className="flex-1 flex flex-col md:flex-row items-stretch gap-4 md:gap-0 border border-gray-200 rounded-lg overflow-visible shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition-all bg-white">
            {/* Dropdown part */}
            <div className="relative min-w-[220px]">
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-full flex items-center gap-2 px-4 py-3 bg-gray-50 border-r border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <selected.icon size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600 font-medium">{selected.name}</span>
                <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-xl rounded-b-lg z-50 py-1 animate-in slide-in-from-top-2 duration-200">
                  {options.map((option) => (
                    <button
                      key={option.name}
                      onClick={() => {
                        setSelected(option);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        selected.name === option.name 
                          ? 'bg-gray-500 text-white font-bold' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <option.icon size={16} />
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Input part */}
            <input 
              type="text" 
              placeholder="Enter your query..." 
              className="flex-1 px-6 py-3 text-sm text-gray-700 outline-none min-h-[48px]"
            />
            
            {/* Button part */}
            <button className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-3 flex items-center gap-2 font-bold transition-all active:scale-95 shadow-md min-h-[48px]">
              <div className="w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center">
                <SearchIcon size={14} strokeWidth={3} />
              </div>
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortCode;
