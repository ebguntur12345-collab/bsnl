import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomSelect = ({ label, options, selected, onSelect, disabled = false, placeholder = "Select...", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`flex flex-col space-y-1 relative ${className}`} ref={dropdownRef}>
      {label && <label className="text-[#3b3598] text-[10px] font-black uppercase tracking-tight mb-1">{label}</label>}
      <button 
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 bg-white border border-[#b3b2e6] rounded text-xs text-gray-700 text-left flex justify-between items-center focus:ring-2 focus:ring-blue-400 shadow-sm transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-blue-400'}`}
      >
        <span className="truncate">{selected || placeholder}</span>
        <ChevronDown size={14} className={`text-[#3b3598] transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#b3b2e6] rounded shadow-xl z-[100] max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 animate-in fade-in slide-in-from-top-1 duration-200">
          {options.map((option) => (
            <div 
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-xs cursor-pointer flex justify-between items-center hover:bg-blue-50 transition-colors ${selected === option ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700'}`}
            >
              <span className="truncate">{option}</span>
              {selected === option && <Check size={12} className="flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
