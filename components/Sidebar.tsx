
import React from 'react';
import { View } from '../types';
import { DashboardIcon, UsersIcon, ReportsIcon, SettingsIcon, LogoIcon } from './Icons';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'expats', label: 'Expats', icon: UsersIcon },
    { id: 'reports', label: 'Reports', icon: ReportsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-white text-text-primary flex flex-col border-r border-gray-200">
      <div className="flex items-center justify-center p-6 border-b border-gray-200">
        <LogoIcon />
        <h1 className="text-xl font-bold ml-2">Permit Tracker</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setView(item.id as View);
                }}
                className={`flex items-center px-4 py-3 my-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-50 text-brand-primary'
                    : 'text-text-secondary hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
            <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=hr_manager" alt="HR Manager" />
            <div className="ml-3">
                <p className="text-sm font-semibold text-text-primary">A useless HR</p>
                <p className="text-xs text-text-secondary">HR Manager</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;