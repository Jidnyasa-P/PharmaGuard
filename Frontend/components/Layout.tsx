
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icons } from '../constants';
import { User, Notification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  notifications: Notification[];
  onMarkRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, searchTerm, setSearchTerm, notifications, onMarkRead }) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <Icons.Dashboard className="w-5 h-5" /> },
    { label: 'Analyze Patient', path: '/analyze', icon: <Icons.Analyze className="w-5 h-5" /> },
    { label: 'Reports History', path: '/history', icon: <Icons.History className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Icons.Settings className="w-5 h-5" /> },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) onMarkRead();
  };

  const avatarSrc = user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center text-white">
            <Icons.Dna className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">PharmaGuard</h1>
            <p className="text-[10px] uppercase tracking-widest text-sky-400 font-semibold">Precision AI</p>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path 
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="md:hidden flex items-center gap-2">
            <Icons.Dna className="w-8 h-8 text-sky-500" />
            <span className="font-bold text-lg">PharmaGuard</span>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient ID, drugs, or analysis ID..."
                className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-sky-500 transition-shadow outline-none"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleNotificationClick}
                className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-slate-100 text-sky-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                            notif.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                            notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'
                          }`}>
                            {notif.type === 'alert' ? <Icons.Alert className="w-4 h-4" /> : <Icons.Check className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{notif.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-slate-400 italic text-sm">No notifications</div>
                    )}
                  </div>
                  <div className="p-3 text-center border-t border-slate-100">
                    <button className="text-xs font-bold text-sky-600 hover:text-sky-700">View All Activity</button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <Link to="/settings" className="flex items-center gap-3 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-none group-hover:text-sky-600 transition-colors">{user.name}</p>
                <p className="text-xs text-slate-500 leading-none mt-1">{user.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold overflow-hidden ring-0 group-hover:ring-2 ring-sky-500/20 transition-all">
                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </Link>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
