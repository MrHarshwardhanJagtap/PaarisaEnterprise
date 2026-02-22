import React, { useState, useEffect } from 'react';
import { User, UserRole, LoginHistory } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import Clients from './components/Clients'; // Import the new page
import Reports from './components/Reports';
import Settings from './components/Settings';

import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  // UPDATED: Added 'clients' to the allowed view types
  const [view, setView] = useState<'dashboard' | 'inventory' | 'orders' | 'clients' | 'reports' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('pos_user', JSON.stringify(loggedInUser));
    
    // Log history
    const history: LoginHistory[] = JSON.parse(localStorage.getItem('pos_login_history') || '[]');
    const newEntry: LoginHistory = {
      id: Math.random().toString(36).substr(2, 9),
      userId: loggedInUser.id,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    };
    localStorage.setItem('pos_login_history', JSON.stringify([newEntry, ...history]));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
    setView('dashboard');
    setIsSidebarOpen(false);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        role={user.role} 
        activeView={view} 
        onViewChange={handleViewChange} 
        onLogout={handleLogout} 
        username={user.username}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
             <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain" 
          />
            <span className="font-bold text-gray-900 tracking-tight">Paaris Enterprises</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar">
          {view === 'dashboard' && <Dashboard user={user} />}
          {view === 'inventory' && <Inventory user={user} />}
          {view === 'orders' && <Orders user={user} />}
          {/* UPDATED: Added Clients Component */}
          {view === 'clients' && <Clients user={user} />}
          {view === 'reports' && <Reports user={user} />}
          {view === 'settings' && <Settings user={user} />}
        </main>
      </div>
    </div>
  );
};

export default App;