import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  MessageCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const location = useLocation();

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
        { name: 'Bulk CCTs', route: '/leased-lines/bulk-ccts' },
        { name: 'CCT Registration', route: '/leased-lines/registration' }
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
      ]
    },
    { name: 'Charts', icon: BarChart3, route: '/charts' },
    { name: 'Search', icon: Search, route: '/search' },
    { name: 'Short Code', icon: Hash, route: '/short-code' },
    { name: 'Complaints', icon: AlertCircle, route: '/complaints' },
    { name: 'Inbox', icon: Inbox, route: '/inbox' },
  ];

  const isSubItemActive = (subItems) => {
    return subItems.some(sub => location.pathname === sub.route);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`w-[250px] h-screen fixed left-0 top-0 bg-[#005BAA] text-white flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-white/5 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-[60px] flex items-center px-6 border-b border-white/10 gap-3 bg-[#002D62]">
          <span className="font-black text-lg tracking-tight">EB GUNTUR</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 content-scroll">
          {menuItems.map((item) => (
            <div key={item.name} className="space-y-1">
              {item.hasDropdown ? (
                <div className="space-y-1">
                  <div 
                    className={`flex items-center gap-1 rounded-lg transition-all duration-300 ${
                      isSubItemActive(item.subItems) || (item.route && location.pathname === item.route)
                        ? 'bg-[#002D62] shadow-lg border-l-4 border-cyan-300' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    {item.route ? (
                      <NavLink
                        to={item.route}
                        onClick={onClose}
                        className={({ isActive }) => 
                          `flex-1 flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'font-black' : 'font-medium opacity-80'}`
                        }
                      >
                        <item.icon size={18} />
                        <span className="text-sm">{item.name}</span>
                      </NavLink>
                    ) : (
                      <button 
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                          isSubItemActive(item.subItems) ? 'font-black' : 'font-medium opacity-80'
                        }`}
                      >
                        <item.icon size={18} />
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
                    <div className="pl-6 space-y-1 border-l border-white/10 ml-6 my-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.name}
                          to={sub.route}
                          onClick={onClose}
                          className={({ isActive }) => 
                            `flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] transition-all duration-200 ${
                              isActive 
                                ? "bg-[#1b1464] text-white font-black shadow-md border-l-2 border-cyan-300" 
                                : "text-white/70 hover:text-white hover:bg-white/10 font-medium"
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
                    `sidebar-link ${isActive ? "sidebar-link-active" : "font-medium opacity-80"}`
                  }
                >
                  <item.icon size={18} />
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <a 
            href="https://wa.me/911234567890" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 transition-colors text-white font-medium"
          >
            <MessageCircle size={18} />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
