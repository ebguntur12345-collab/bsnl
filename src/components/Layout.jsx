import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const [isWorker, setIsWorker] = React.useState(false);

  useEffect(() => {
    // Security Check: Ensure user is logged in
    const adminAuth = localStorage.getItem('adminAuth');
    const workerAuth = localStorage.getItem('workerAuth');

    if (!adminAuth && !workerAuth) {
      navigate('/login');
      return;
    }

    // If worker tries to access main dashboard or other admin routes, redirect to tasks
    const path = window.location.pathname;
    if (workerAuth && !adminAuth && path !== '/tasks') {
      navigate('/tasks');
    }

    if (workerAuth && !adminAuth) {
      setIsWorker(true);
    } else {
      setIsWorker(false);
    }
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="flex min-h-screen bg-dark-bg text-white overflow-hidden">
      {!isWorker && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div
        className="flex-1 flex flex-col h-screen transition-all duration-300"
        style={{ marginLeft: !isWorker && sidebarOpen ? '260px' : '0px' }}
      >
        {!isWorker && <TopNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />}
        <main className={`flex-1 ${!isWorker ? 'mt-[70px]' : 'mt-0'} overflow-y-auto p-8 content-scroll relative`}>
          <Outlet />

          {/* Floating WhatsApp Button */}
          <a
            href="https://wa.me/919492238800"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-green-600 hover:scale-110 transition-all z-50 animate-bounce hover:animate-none"
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
