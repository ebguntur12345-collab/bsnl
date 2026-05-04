import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Security Check: Ensure user is logged in
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/login');
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="flex-1 flex flex-col h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '250px' : '0px' }}
      >
        <TopNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 mt-[60px] overflow-y-auto p-8 content-scroll relative">
          <Outlet />

          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/911234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 hover:scale-110 transition-all z-50 animate-bounce hover:animate-none"
            title="Chat with Support"
          >
            <MessageCircle size={28} />
          </a>
        </main>
      </div>
    </div>
  );
};

export default Layout;
