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
    <nav className="h-[70px] bg-dark-bg/80 backdrop-blur-xl fixed top-0 left-0 right-0 flex items-center justify-between px-8 z-40 border-b border-dark-border">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="text-gray-400 p-2 rounded-xl hover:bg-white/5 transition-all duration-200 focus:outline-none"
          title={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        
        <img
          src="/bsnl-logo.png"
          alt="BSNL Logo"
          className="h-12 w-auto object-contain drop-shadow-lg brightness-110"
        />
        

      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">

        
        <div className="h-8 w-[1px] bg-dark-border"></div>

        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="flex flex-col text-right">
            <p className="text-sm font-bold text-white leading-tight">BSNL</p>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase">Enterprise Admin</p>
          </div>
          <div className="w-10 h-10 bg-dark-card rounded-xl border border-dark-border flex items-center justify-center text-gray-400 group-hover:border-primary group-hover:text-primary transition-all overflow-hidden">
            <User size={20} />
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="text-gray-500 hover:text-red-400 transition-colors p-2.5 hover:bg-red-500/5 rounded-xl" 
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
