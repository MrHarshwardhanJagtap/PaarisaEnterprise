import React from 'react';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  Users, // Import Users Icon
  X
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
  username: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, activeView, onViewChange, onLogout, username, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: role === UserRole.MANUFACTURER ? 'Bottle Management' : 'Stock & Price', icon: Package },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart },
    { id: 'clients', label: 'Clients & Retailers', icon: Users }, // NEW ITEM ADDED HERE
    { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col h-full transition-transform duration-300 transform
    md:relative md:translate-x-0 md:flex
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-10 h-10 object-contain" 
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Paaris Enterprises</span>
        </div>
        <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-6 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
              activeView === item.id 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-semibold' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} className={activeView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Connected As</p>
          <p className="text-sm font-bold text-gray-900 truncate">{username}</p>
          <div className="mt-2">
            <span className="text-[10px] text-indigo-700 font-extrabold bg-indigo-100/50 uppercase px-2 py-0.5 rounded-full border border-indigo-200/50">
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group"
        >
          <LogOut size={20} className="text-red-400 group-hover:text-red-500" />
          <span className="font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;