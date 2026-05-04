import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Menu, X } from 'lucide-react';

const TopNavbar = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/login');
  };

  return (
    <nav className="h-[60px] header-gradient fixed top-0 left-0 right-0 flex items-center justify-between px-6 z-40 shadow-lg">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200 focus:outline-none"
          title={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img
          src="/bsnl-logo.png"
          alt="BSNL Logo"
          className="h-14 w-auto object-contain drop-shadow-md"
        />
        <h1 className="text-xl font-bold text-white tracking-tight">Enterprise Business Guntur</h1>
      </div>

      {/* Centre: Search */}
      <div className="flex-1 max-w-xl px-12">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white border-transparent focus:ring-2 focus:ring-white/20 rounded-lg transition-all outline-none text-sm text-gray-800 shadow-inner"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#005BAA] rounded-full"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-white/20"></div>

        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-1 pr-3 rounded-full transition-all group">
          <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-primary transition-all">
            <User size={18} />
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-sm font-semibold text-white leading-tight">Admin User</p>
            <p className="text-xs text-white/70 leading-tight">Guntur Office</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full" 
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
