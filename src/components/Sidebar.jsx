import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Contact, 
  Zap, 
  FileText, 
  BarChart3, 
  Search, 
  Hash, 
  AlertCircle, 
  Inbox, 
  ChevronDown,
  ChevronRight,
  MessageCircle,
  ClipboardList
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [dynamicCats, setDynamicCats] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (data) setDynamicCats(data);
    };
    fetchCats();
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
    { 
      name: 'Contacts', 
      icon: Contact, 
      route: '',
      hasDropdown: true,
      subItems: [
        { name: 'EB Contacts', route: '/contacts/eb-contacts' },
        { name: 'Customer Contacts', route: '/contacts/customer-contacts' }
      ]
    },
    { 
      name: 'Customers', 
      icon: Users, 
      route: '',
      hasDropdown: true,
      subItems: [
        { name: 'Registration', route: '/custRegistration' }
      ]
    },
    { 
      name: 'Leased Lines', 
      icon: Zap, 
      route: '/leased-lines',
      hasDropdown: true,
      subItems: [
        { name: 'Employees Registration', route: '/leased-lines/registration' }
      ]
    },
    { 
      name: 'Tariffs', 
      icon: FileText, 
      route: '/tariffs',
      hasDropdown: true,
      subItems: [
        { name: 'SIP Trunk', route: '/tariffs/sip-trunk' },
        { name: 'Internet leased line', route: '/tariffs/internet-leased-line' },
        { name: 'Mobile Prepaid', route: '/tariffs/mobile-prepaid' },
        { name: 'Mobile Postpaid', route: '/tariffs/mobile-postpaid' },
        { name: 'MMVC OBD', route: '/tariffs/mmvc-obd' },
        { name: 'FTTH', route: '/tariffs/ftth' },
        ...dynamicCats.filter(c => c.module === 'Tariffs').map(c => ({
          name: c.name,
          route: `/module-documents/Tariffs/${c.name}`
        }))
      ]
    },
    { 
      name: 'Forms', 
      icon: FileText, 
      route: '/forms',
      hasDropdown: true,
      subItems: [
        { name: 'ILL CAF', route: '/forms/ill-caf' },
        { name: 'SIP Trunk', route: '/forms/sip-trunk' },
        { name: 'FTTH CAF', route: '/forms/ftth-caf' },
        { name: 'Mobile', route: '/forms/mobile' },
        ...dynamicCats.filter(c => c.module === 'Forms').map(c => ({
          name: c.name,
          route: `/module-documents/Forms/${c.name}`
        }))
      ]
    },
    { name: 'Charts', icon: BarChart3, route: '/charts' },
    { name: 'Search', icon: Search, route: '/search' },
    { name: 'Short Code', icon: Hash, route: '/short-code' },
    { name: 'Tasks', icon: ClipboardList, route: '/tasks' },
    { name: 'Complaints', icon: AlertCircle, route: '/complaints' },
    { name: 'Inbox', icon: Inbox, route: '/inbox' },
  ];

  const isSubItemActive = (subItems) => {
    return subItems.some(sub => location.pathname === sub.route);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`w-[260px] h-screen fixed left-0 top-0 bg-dark-sidebar text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-dark-border ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-[80px] flex items-center px-6 gap-4 mb-4">
          <img
            src="/bsnl-logo.png"
            alt="BSNL Logo"
            className="h-14 w-auto object-contain brightness-110"
          />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight leading-none text-white">EB GUNTUR</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.1em] uppercase mt-1">Smart Portal</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1.5 content-scroll">
          {menuItems.map((item) => (
            <div key={item.name} className="space-y-1">
              {item.hasDropdown ? (
                <div className="space-y-1">
                  <div 
                    className={`flex items-center gap-1 rounded-xl transition-all duration-300 ${
                      isSubItemActive(item.subItems) || (item.route && location.pathname === item.route)
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {item.route ? (
                      <NavLink
                        to={item.route}
                        onClick={onClose}
                        className={({ isActive }) => 
                          `flex-1 flex items-center gap-3 px-4 py-3 rounded-xl ${isActive ? 'font-bold' : 'font-medium text-gray-400'}`
                        }
                      >
                        <item.icon size={20} className={location.pathname === item.route ? 'text-primary' : 'text-gray-400'} />
                        <span className="text-sm">{item.name}</span>
                      </NavLink>
                    ) : (
                      <button 
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left ${
                          isSubItemActive(item.subItems) ? 'font-bold' : 'font-medium text-gray-400'
                        }`}
                      >
                        <item.icon size={20} className={isSubItemActive(item.subItems) ? 'text-primary' : 'text-gray-400'} />
                        <span className="text-sm">{item.name}</span>
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown(item.name);
                      }}
                      className="p-2 mr-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                      {openDropdowns[item.name] || isSubItemActive(item.subItems) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  </div>
                  
                  {(openDropdowns[item.name] || isSubItemActive(item.subItems)) && (
                    <div className="pl-6 space-y-1 border-l-2 border-dark-border ml-6 my-1 animate-in fade-in slide-in-from-left-1 duration-200">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.name}
                          to={sub.route}
                          onClick={onClose}
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                              isActive 
                                ? "text-primary font-bold" 
                                : "text-gray-500 hover:text-white hover:bg-white/5"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.route}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? "sidebar-link-active" : "font-medium"}`
                  }
                >
                  <item.icon size={20} className={location.pathname === item.route ? 'text-primary' : 'text-gray-400'} />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto border-t border-dark-border">
          <button 
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-dark-card border border-dark-border flex items-center justify-center font-bold text-xs text-white">N</div>
              <span className="text-sm font-medium">Collapse Menu</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
