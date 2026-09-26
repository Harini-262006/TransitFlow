import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Bus,
  MapPin,
  CalendarCheck,
  CheckSquare,
  Wrench,
  AlertTriangle,
  Repeat,
  FileText,
  Clock,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Bell,
  Settings,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, role = 'manager', mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const managerNavItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'duties', label: 'Shifts & Rosters', icon: Calendar, badge: 'Live' },
    { id: 'crew', label: 'Employees & Crew', icon: Users },
    { id: 'leaves', label: 'Leave Requests & Vacancies', icon: CalendarCheck },
    { id: 'attendance', label: 'Attendance Monitoring', icon: CheckSquare },
    { id: 'routes', label: 'Schedules & Routes', icon: MapPin },
    { id: 'swaps', label: 'Shift Swap Approvals', icon: Repeat },
    { id: 'fleet', label: 'Bus Fleet & Status', icon: Bus },
    { id: 'maintenance', label: 'Fleet Maintenance', icon: Wrench },
    { id: 'issues', label: 'Duty Issues Log', icon: AlertTriangle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Analytics & Reports', icon: FileText },
    { id: 'settings', label: 'Portal Settings', icon: Settings }
  ];

  const driverNavItems = [
    { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance & Check-in', icon: CheckSquare },
    { id: 'leaves', label: 'Leave Management', icon: CalendarCheck },
    { id: 'swaps', label: 'Shift Swap Requests', icon: Repeat },
    { id: 'issues', label: 'Report Duty Issue', icon: AlertTriangle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Preferences & Settings', icon: Settings }
  ];

  const conductorNavItems = [
    { id: 'overview', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Daily Attendance', icon: CheckSquare },
    { id: 'leaves', label: 'Leave Management', icon: CalendarCheck },
    { id: 'swaps', label: 'Shift Swap Requests', icon: Repeat },
    { id: 'issues', label: 'Report Duty Issue', icon: AlertTriangle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Preferences & Settings', icon: Settings }
  ];

  let navItems = managerNavItems;
  if (role === 'driver') navItems = driverNavItems;
  if (role === 'conductor') navItems = conductorNavItems;

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`bg-[#171A1F] text-[#CBD1D7] border-r border-[#2A2E36] flex flex-col justify-between transition-all duration-300 ease-in-out z-30 shrink-0 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header & Branding */}
      <div>
        <div className="p-4 border-b border-[#2A2E36] flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-md shadow-[#10B981]/20 shrink-0">
                <Bus className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-sm font-black text-white tracking-wide">
                  Transit<span className="text-[#10B981]">Flow</span>
                </p>
                <p className="text-[10px] text-[#10B981] font-bold uppercase tracking-wider">
                  {role.toUpperCase()} CONSOLE
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-md shadow-[#10B981]/20">
              <Bus className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 text-[#667085] hover:text-white hover:bg-[#20242B] rounded-lg transition-colors ml-auto cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/25 font-bold'
                    : 'text-[#CBD1D7] hover:text-white hover:bg-[#20242B]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Glowing Left Indicator when active */}
                {isActive && (
                  <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#10B981] shadow-md shadow-[#10B981]" />
                )}
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[#667085] group-hover:text-[#10B981]'
                  }`}
                />
                {!collapsed && <span className="truncate text-left flex-1">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="bg-[#047857] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-[#2A2E36] bg-[#0E1013]/60">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-2.5 truncate cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSelectTab('profile')}
            >
              <div className="w-8 h-8 rounded-lg bg-[#20242B] border border-[#2A2E36] flex items-center justify-center text-xs font-bold text-white shrink-0">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-[#667085] font-mono truncate">{user?.employeeId}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-[#667085] hover:text-[#EF4444] hover:bg-[#20242B] rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            className="w-full flex justify-center p-2 text-[#667085] hover:text-[#EF4444] hover:bg-[#20242B] rounded-lg transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
