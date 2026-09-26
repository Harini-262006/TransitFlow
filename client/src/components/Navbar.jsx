import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { LogOut, UserCheck, Ticket, Bell, Bus, CheckCircle2, ChevronDown, User, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Live clock effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      notificationAPI.getAll()
        .then((res) => setNotifications(res.data.data || []))
        .catch((err) => console.warn('Notifications fetch warning:', err.message));
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const r = role?.toLowerCase();
    switch (r) {
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6]/30 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
            <UserCheck className="w-3.5 h-3.5 text-[#8B5CF6]" /> Manager
          </span>
        );
      case 'driver':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Driver
          </span>
        );
      case 'conductor':
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#FFF7ED] text-[#C2410C] border border-[#F97316]/30 text-xs px-2.5 py-1 rounded-full font-bold shadow-sm">
            <Ticket className="w-3.5 h-3.5 text-[#F97316]" /> Conductor
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#20242B] text-[#CBD1D7] border border-[#2A2E36] text-xs px-2.5 py-1 rounded-full font-semibold">
            {role || 'Staff'}
          </span>
        );
    }
  };

  return (
    <header className="bg-[#171A1F] text-white shadow-lg border-b border-[#2A2E36] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-2 text-white shadow-lg shadow-[#10B981]/20 flex items-center justify-center">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Transit<span className="text-[#10B981]">Flow</span>
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 bg-[#20242B] text-[#10B981] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[#10B981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                Depot Operations
              </span>
            </div>
            <p className="text-[11px] text-[#667085] font-mono hidden sm:block">
              {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} • {currentTime.toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* User Actions & Dropdowns */}
        {user && (
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-[#CBD1D7] hover:text-white hover:bg-[#20242B] rounded-xl transition-all relative border border-transparent hover:border-[#2A2E36]"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full animate-ping"></span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full"></span>
                  </>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#171A1F] border border-[#2A2E36] rounded-2xl shadow-2xl p-4 z-50 animate-card-entrance">
                  <div className="flex items-center justify-between border-b border-[#2A2E36] pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#10B981]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#CBD1D7]">
                        Live Notifications ({notifications.length})
                      </h4>
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-[#667085] text-xs">
                        <CheckCircle2 className="w-8 h-8 text-[#2A2E36] mx-auto mb-2 opacity-80" />
                        No unread notifications at this time
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n, idx) => (
                        <div key={n._id || idx} className="bg-[#20242B] hover:bg-[#2A2E36] p-3 rounded-xl border border-[#2A2E36] transition-all">
                          <p className="text-xs font-bold text-[#10B981] flex items-center justify-between">
                            {n.title}
                            <span className="text-[10px] text-[#667085] font-normal">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </p>
                          <p className="text-[11px] text-[#CBD1D7] mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Badge */}
            <div>{getRoleBadge(user.role)}</div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 bg-[#20242B] hover:bg-[#2A2E36] border border-[#2A2E36] rounded-xl text-left transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#047857] flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[10px] text-[#667085] font-mono">{user.employeeId}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#667085] hidden sm:block" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-[#171A1F] border border-[#2A2E36] rounded-2xl shadow-2xl p-2 z-50 animate-card-entrance">
                  <div className="px-3 py-2 border-b border-[#2A2E36]">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-[#667085] truncate">{user.email}</p>
                    <p className="text-[10px] text-[#10B981] font-mono mt-0.5">ID: {user.employeeId}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#EF4444] hover:text-white hover:bg-[#EF4444] rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
