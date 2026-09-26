import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  busAPI,
  driverAPI,
  conductorAPI,
  routeAPI,
  shiftAPI,
  leaveAPI,
  attendanceAPI,
  swapAPI,
  maintenanceAPI,
  issueAPI,
  reportAPI
} from '../services/api';
import AddBusModal from '../components/AddBusModal';
import AddShiftModal from '../components/AddShiftModal';
import AddRouteModal from '../components/AddRouteModal';
import AddCrewModal from '../components/AddCrewModal';
import ReassignShiftModal from '../components/ReassignShiftModal';
import CalendarScheduleView from '../components/CalendarScheduleView';
import ActivityTimeline from '../components/ActivityTimeline';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import NotificationCenterView from '../components/NotificationCenterView';
import SmartAutoAssignCard from '../components/SmartAutoAssignCard';
import { notificationAPI } from '../services/api';
import {
  Bus as BusIcon,
  Users,
  MapPin,
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Check,
  X,
  FileText,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  ArrowUpDown,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Repeat,
  Wrench,
  Sparkles,
  Download,
  Ticket,
  TrendingUp,
  Award,
  ListFilter,
  Grid
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

const ManagerDashboard = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [shiftViewMode, setShiftViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Data states
  const [shifts, setShifts] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [conductors, setConductors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [summaryReport, setSummaryReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals visibility state
  const [isBusModalOpen, setIsBusModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);

  // Leave Management Modals & State
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState(null);
  const [selectedLeaveForDetails, setSelectedLeaveForDetails] = useState(null);
  const [rejectionModalLeave, setRejectionModalLeave] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter States
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all');
  const [leaveRoleFilter, setLeaveRoleFilter] = useState('all');
  const [leaveSearchTerm, setLeaveSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [crewFilter, setCrewFilter] = useState('all');

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAllManagerData = async () => {
    setLoading(true);
    try {
      const [
        shiftsRes,
        busesRes,
        driversRes,
        conductorsRes,
        routesRes,
        leavesRes,
        attRes,
        swapsRes,
        maintRes,
        issueRes,
        reportRes
      ] = await Promise.all([
        shiftAPI.getAll().catch(() => ({ data: { data: [] } })),
        busAPI.getAll().catch(() => ({ data: { data: [] } })),
        driverAPI.getAll().catch(() => ({ data: { data: [] } })),
        conductorAPI.getAll().catch(() => ({ data: { data: [] } })),
        routeAPI.getAll().catch(() => ({ data: { data: [] } })),
        leaveAPI.getAllManager().catch(() => ({ data: { data: [] } })),
        attendanceAPI.getAll().catch(() => ({ data: { data: [] } })),
        swapAPI.getAll().catch(() => ({ data: { data: [] } })),
        maintenanceAPI.getAll().catch(() => ({ data: { data: [] } })),
        issueAPI.getAll().catch(() => ({ data: { data: [] } })),
        reportAPI.getSummary().catch(() => ({ data: { data: null } }))
      ]);

      setShifts(shiftsRes.data.data || []);
      setBuses(busesRes.data.data || []);
      setDrivers(driversRes.data.data || []);
      setConductors(conductorsRes.data.data || []);
      setRoutes(routesRes.data.data || []);
      setLeaves(leavesRes.data.data || []);
      setAttendance(attRes.data.data || []);
      setSwaps(swapsRes.data.data || []);
      setMaintenance(maintRes.data.data || []);
      setIssues(issueRes.data.data || []);
      setSummaryReport(reportRes.data.data || null);
    } catch (err) {
      console.error('Failed to load manager dashboard data:', err);
      showToast('Error syncing dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllManagerData();
  }, []);

  // Action Handlers
  const handleRejectLeaveSubmit = async () => {
    if (!rejectionModalLeave) return;
    setRejecting(true);
    try {
      await leaveAPI.reject(rejectionModalLeave._id, {
        rejectionReason: rejectionReason.trim() || 'Schedule operational requirements'
      });
      showToast('Leave request rejected', 'warning');
      setRejectionModalLeave(null);
      setRejectionReason('');
      await fetchAllManagerData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error rejecting leave', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const handleSwapDecision = async (swapId, status) => {
    try {
      await swapAPI.managerReview(swapId, { status, rejectionReason: 'Manager review decision' });
      showToast(`Shift swap request ${status} successfully!`);
      await fetchAllManagerData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating swap request', 'error');
    }
  };

  const handleMarkAttendance = async (userId, shiftId, status = 'present') => {
    try {
      await attendanceAPI.mark({ user: userId, shift: shiftId, status, notes: 'Manager override check-in' });
      showToast(`Attendance marked as ${status.toUpperCase()}!`);
      await fetchAllManagerData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error logging attendance', 'error');
    }
  };

  const handleIssueStatus = async (issueId, status) => {
    try {
      await issueAPI.updateStatus(issueId, status);
      showToast(`Issue status updated to ${status}`);
      await fetchAllManagerData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating issue status', 'error');
    }
  };

  const handleMaintenanceStatus = async (maintId, status) => {
    try {
      await maintenanceAPI.updateStatus(maintId, status);
      showToast(`Maintenance status updated to ${status}`);
      await fetchAllManagerData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating maintenance', 'error');
    }
  };

  const exportCrewRoster = async () => {
    try {
      const res = await reportAPI.getCrewRoster();
      const csvData = (res.data.data || []).map(c => `${c.name},${c.employeeId},${c.role},${c.phone || 'N/A'},${c.status}`).join('\n');
      const blob = new Blob([`Name,Employee ID,Role,Phone,Status\n${csvData}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crew_roster_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      showToast('Crew roster exported successfully!');
    } catch (err) {
      showToast('Failed to export roster', 'error');
    }
  };

  // Filtered Leaves List
  const filteredLeaves = leaves.filter((l) => {
    const applicantRole = (l.applicant?.role || l.employeeRole || '').toLowerCase();
    const leaveStatus = (l.status || '').toLowerCase();

    if (leaveStatusFilter !== 'all' && leaveStatus !== leaveStatusFilter) return false;
    if (leaveRoleFilter !== 'all' && applicantRole !== leaveRoleFilter) return false;

    if (leaveSearchTerm.trim()) {
      const search = leaveSearchTerm.toLowerCase();
      const name = (l.employeeName || l.applicant?.name || '').toLowerCase();
      const empId = (l.employeeId || l.applicant?.employeeId || '').toLowerCase();
      const reason = (l.reason || '').toLowerCase();
      const type = (l.leaveType || '').toLowerCase();
      return name.includes(search) || empId.includes(search) || reason.includes(search) || type.includes(search);
    }
    return true;
  });

  // Chart data formatting (Emerald, Coral, Amber, Purple, Charcoal)
  const shiftDistributionData = [
    { name: 'Morning', count: shifts.filter(s => s.startTime?.includes('06') || s.startTime?.includes('08')).length, color: '#10B981' },
    { name: 'Afternoon', count: shifts.filter(s => s.startTime?.includes('10') || s.startTime?.includes('02')).length, color: '#F59E0B' },
    { name: 'Evening', count: shifts.filter(s => s.startTime?.includes('04')).length, color: '#8B5CF6' },
    { name: 'Night', count: shifts.filter(s => s.startTime?.includes('08') || s.startTime?.includes('10')).length, color: '#171A1F' }
  ];

  const leaveBreakdownData = [
    { name: 'Casual', value: leaves.filter(l => l.leaveType?.includes('Casual')).length || 2, color: '#10B981' },
    { name: 'Sick / Med', value: leaves.filter(l => l.leaveType?.includes('Sick') || l.leaveType?.includes('Medical')).length || 1, color: '#F97316' },
    { name: 'Emergency', value: leaves.filter(l => l.leaveType?.includes('Emergency')).length || 1, color: '#F59E0B' },
    { name: 'Other', value: leaves.filter(l => l.leaveType?.includes('Other')).length || 1, color: '#8B5CF6' }
  ];

  const getShiftBadge = (timeStr) => {
    if (timeStr?.includes('06') || timeStr?.includes('08')) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">Morning Shift</span>;
    }
    if (timeStr?.includes('10') || timeStr?.includes('02')) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">Afternoon Shift</span>;
    }
    if (timeStr?.includes('04')) {
      return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6]/30">Evening Shift</span>;
    }
    return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#20242B] text-white border border-[#2A2E36]">Night Shift</span>;
  };

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex flex-col font-sans text-[#171A1F]">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-toast">
          <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold text-white ${
            toastMessage.type === 'error' ? 'bg-[#EF4444] border-[#EF4444]' :
            toastMessage.type === 'warning' ? 'bg-[#F59E0B] border-[#F59E0B]' :
            'bg-[#171A1F] border-[#10B981]'
          }`}>
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          role="manager"
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] shadow-sm border border-[#E4E7EC] card-base">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#171A1F] tracking-tight">
                  Manager Operations Control Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6]/30">
                  Depot Supervised
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-1 font-medium">
                Real-time crew scheduling, leave vacancy management, transit roster, and bus fleet analytics.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={fetchAllManagerData}
                disabled={loading}
                className="btn-icon p-2 border border-[#E4E7EC] rounded-xl hover:border-[#CBD1D7] cursor-pointer"
                title="Refresh Live Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#10B981]' : 'text-[#667085]'}`} />
              </button>

              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Create Shift</span>
              </button>

              <button
                onClick={() => setIsBusModalOpen(true)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <BusIcon className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Add Bus</span>
              </button>

              <button
                onClick={() => setIsCrewModalOpen(true)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-[#8B5CF6]" />
                <span>Enroll Crew</span>
              </button>
            </div>
          </div>

          {/* KPI Statistics Deck (.card-stat with staggered animation) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            {/* Total Buses (Charcoal + Emerald) */}
            <div className="card-stat animate-card-entrance stagger-1">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Fleet Buses</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                  <BusIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">{buses.length}</div>
              <div className="text-[11px] text-[#047857] font-semibold mt-0.5">
                {buses.filter(b => b.status === 'active' || b.status === 'in_service').length} In Service
              </div>
            </div>

            {/* Drivers (Purple) */}
            <div className="card-stat animate-card-entrance stagger-2">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Drivers</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">{drivers.length}</div>
              <div className="text-[11px] text-[#8B5CF6] font-semibold mt-0.5">
                {drivers.filter(d => d.status !== 'on_leave').length} Available
              </div>
            </div>

            {/* Conductors (Coral) */}
            <div className="card-stat animate-card-entrance stagger-3">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Conductors</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">{conductors.length}</div>
              <div className="text-[11px] text-[#C2410C] font-semibold mt-0.5">
                {conductors.filter(c => c.status !== 'on_leave').length} Available
              </div>
            </div>

            {/* Active Duties (Emerald) */}
            <div className="card-stat animate-card-entrance stagger-4">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled Shifts</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">{shifts.length}</div>
              <div className="text-[11px] text-[#10B981] font-semibold mt-0.5">
                100% Covered
              </div>
            </div>

            {/* Pending Leaves (Amber) */}
            <div className="card-stat animate-card-entrance stagger-5">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pending Leaves</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#F59E0B] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">
                {leaves.filter(l => l.status?.toLowerCase() === 'pending').length}
              </div>
              <div className="text-[11px] text-[#B45309] font-semibold mt-0.5">
                Action Required
              </div>
            </div>

            {/* Maintenance & Issues (Coral / Red) */}
            <div className="card-stat animate-card-entrance stagger-6">
              <div className="flex items-center justify-between text-[#667085] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Work Orders</span>
                <div className="card-icon w-7 h-7 rounded-lg bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#171A1F]">{maintenance.length + issues.length}</div>
              <div className="text-[11px] text-[#C2410C] font-semibold mt-0.5">
                {issues.filter(i => i.status === 'reported').length} Open Issues
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-card-entrance">
              {/* Reference 2: Smart AI Shift & Duty Allocation Card */}
              <SmartAutoAssignCard
                buses={buses}
                drivers={drivers}
                conductors={conductors}
                routes={routes}
                onConfirmShift={async (shiftData) => {
                  try {
                    await shiftAPI.create(shiftData);
                    showToast('Smart Shift assigned and saved to roster!');
                    await fetchAllManagerData();
                  } catch (e) {
                    showToast(e.response?.data?.message || 'Error scheduling shift', 'error');
                  }
                }}
              />

              {/* Analytics Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Shift Distribution Bar Chart */}
                <div className="lg:col-span-2 bg-white p-5 rounded-[20px] shadow-sm border border-[#E4E7EC] card-base">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#171A1F] uppercase tracking-wider">
                        Shift Allocation Distribution
                      </h3>
                      <p className="text-xs text-[#667085]">Daily active duty slots by departure window</p>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shiftDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
                        <XAxis dataKey="name" stroke="#667085" fontSize={11} tickLine={false} />
                        <YAxis stroke="#667085" fontSize={11} tickLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#171A1F',
                            borderColor: '#2A2E36',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {shiftDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Leave Types Donut Chart */}
                <div className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E4E7EC] card-base">
                  <h3 className="text-sm font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                    Leave Request Categories
                  </h3>
                  <p className="text-xs text-[#667085] mb-4">Personnel absence distribution</p>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leaveBreakdownData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {leaveBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#171A1F',
                            borderColor: '#2A2E36',
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            fontSize: '12px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {leaveBreakdownData.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#667085]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.name} ({item.value})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Approvals Quick Table */}
              <div className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E4E7EC] card-base space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-[#171A1F] tracking-tight">
                      Pending Leave Applications Awaiting Review
                    </h3>
                    <p className="text-xs text-[#667085]">Automated shift conflict detection active</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('leaves')}
                    className="text-xs font-bold text-[#10B981] hover:text-[#047857] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Leaves</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Applicant</th>
                        <th className="py-3 px-3">Role</th>
                        <th className="py-3 px-3">Leave Type</th>
                        <th className="py-3 px-3">Duration</th>
                        <th className="py-3 px-3">Reason</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC]">
                      {leaves.filter(l => l.status?.toLowerCase() === 'pending').slice(0, 5).map((leave) => {
                        const isDriver = (leave.applicant?.role || leave.employeeRole) === 'driver';
                        return (
                          <tr key={leave._id} className="hover:bg-[#F6F7F4] transition-colors">
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#171A1F]">{leave.employeeName || leave.applicant?.name}</div>
                              <div className="text-[10px] text-[#667085] font-mono">{leave.employeeId || leave.applicant?.employeeId}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isDriver ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF7ED] text-[#C2410C]'
                              }`}>
                                {isDriver ? 'Driver' : 'Conductor'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-[#171A1F]">{leave.leaveType}</td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-[#171A1F]">
                                {new Date(leave.fromDate || leave.startDate).toLocaleDateString()} ➔ {new Date(leave.toDate || leave.endDate).toLocaleDateString()}
                              </span>
                              <span className="text-[#667085] block text-[10px]">
                                ({leave.numberOfDays || 1} day{(leave.numberOfDays || 1) > 1 ? 's' : ''})
                              </span>
                            </td>
                            <td className="py-3 px-3 text-[#667085] max-w-xs truncate">{leave.reason}</td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setSelectedLeaveForApproval(leave._id)}
                                  className="btn-success px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Review & Approve</span>
                                </button>
                                <button
                                  onClick={() => setRejectionModalLeave(leave)}
                                  className="btn-danger px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                  title="Reject Leave"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {leaves.filter(l => l.status?.toLowerCase() === 'pending').length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-[#667085]">
                            <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto mb-2 opacity-80" />
                            Zero pending leaves. All rosters active and clear!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Real-time Activity Timeline */}
              <ActivityTimeline
                leaves={leaves}
                shifts={shifts}
                attendance={attendance}
                swaps={swaps}
                issues={issues}
              />
            </div>
          )}

          {/* TAB 2: DUTIES / SHIFT SCHEDULING */}
          {activeTab === 'duties' && (
            <div className="space-y-6 animate-card-entrance">
              {/* Controls bar */}
              <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Transit Duty Rosters & Timetable
                  </h2>
                  <p className="text-xs text-[#667085]">Daily route assignments, driver/conductor pairs, and conflict tracking</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-[#F6F7F4] p-1 rounded-xl border border-[#E4E7EC]">
                    <button
                      onClick={() => setShiftViewMode('calendar')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        shiftViewMode === 'calendar'
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'text-[#667085] hover:text-[#171A1F]'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Calendar Timetable</span>
                    </button>
                    <button
                      onClick={() => setShiftViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        shiftViewMode === 'list'
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'text-[#667085] hover:text-[#171A1F]'
                      }`}
                    >
                      <ListFilter className="w-3.5 h-3.5" />
                      <span>List View</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsShiftModalOpen(true)}
                    className="btn-primary-transit px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#10B981]" />
                    <span>Create Shift Duty</span>
                  </button>
                </div>
              </div>

              {/* View Rendering */}
              {shiftViewMode === 'calendar' ? (
                <CalendarScheduleView
                  shifts={shifts}
                  onResolveConflict={(shift) => {
                    const matchedLeave = leaves.find(l => l.status === 'pending');
                    if (matchedLeave) setSelectedLeaveForApproval(matchedLeave._id);
                    else showToast('No pending conflict leave found for this duty', 'warning');
                  }}
                />
              ) : (
                <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#E4E7EC] overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                        <th className="py-3 px-3">Date & Time</th>
                        <th className="py-3 px-3">Window</th>
                        <th className="py-3 px-3">Bus Vehicle</th>
                        <th className="py-3 px-3">Route Corridor</th>
                        <th className="py-3 px-3">Assigned Driver</th>
                        <th className="py-3 px-3">Assigned Conductor</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E7EC]">
                      {shifts.map((shift) => (
                        <tr key={shift._id} className="hover:bg-[#F6F7F4] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#171A1F]">
                              {new Date(shift.shiftDate).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-[#667085] font-mono">
                              {shift.startTime} - {shift.endTime}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            {getShiftBadge(shift.startTime)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#171A1F] flex items-center gap-1">
                              <BusIcon className="w-3.5 h-3.5 text-[#10B981]" />
                              {shift.bus?.busNumber || 'Bus N/A'}
                            </div>
                            <div className="text-[10px] text-[#667085] font-mono">{shift.bus?.registrationNumber}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-[#171A1F]">
                              Route {shift.route?.routeNumber}: {shift.route?.source} ➔ {shift.route?.destination}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#047857]">
                              {shift.driver?.name || 'Driver Assigned'}
                            </div>
                            <div className="text-[10px] text-[#667085] font-mono">{shift.driver?.employeeId}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#C2410C]">
                              {shift.conductor?.name || 'Conductor Assigned'}
                            </div>
                            <div className="text-[10px] text-[#667085] font-mono">{shift.conductor?.employeeId}</div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                              Active Roster
                            </span>
                          </td>
                        </tr>
                      ))}
                      {shifts.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-10 text-[#667085]">
                            No shifts scheduled. Click "Create Shift Duty" above to assign routes.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEAVES & VACANCY RESOLUTION */}
          {activeTab === 'leaves' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Leave Approvals & Automated Vacancy Reassignment
                  </h2>
                  <p className="text-xs text-[#667085]">
                    Evaluate driver & conductor leave applications with conflict detection
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="search-box-animated w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#667085]" />
                    <input
                      type="text"
                      value={leaveSearchTerm}
                      onChange={(e) => setLeaveSearchTerm(e.target.value)}
                      placeholder="Search employee, ID, reason..."
                    />
                  </div>

                  <select
                    value={leaveStatusFilter}
                    onChange={(e) => setLeaveStatusFilter(e.target.value)}
                    className="input-transit px-3 py-1.5 text-xs rounded-xl font-medium cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    value={leaveRoleFilter}
                    onChange={(e) => setLeaveRoleFilter(e.target.value)}
                    className="input-transit px-3 py-1.5 text-xs rounded-xl font-medium cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="driver">Drivers</option>
                    <option value="conductor">Conductors</option>
                  </select>
                </div>
              </div>

              {/* Leaves Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Applicant</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Dates</th>
                      <th className="py-3 px-3">Reason</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {filteredLeaves.map((leave) => {
                      const isDriver = (leave.applicant?.role || leave.employeeRole) === 'driver';
                      const status = (leave.status || 'pending').toLowerCase();

                      return (
                        <tr key={leave._id} className="hover:bg-[#F6F7F4] transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#171A1F]">{leave.employeeName || leave.applicant?.name}</div>
                            <div className="text-[10px] text-[#667085] font-mono">{leave.employeeId || leave.applicant?.employeeId}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isDriver ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FFF7ED] text-[#C2410C]'
                            }`}>
                              {isDriver ? 'Driver' : 'Conductor'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-[#171A1F]">{leave.leaveType}</td>
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#171A1F]">
                              {new Date(leave.fromDate || leave.startDate).toLocaleDateString()} ➔ {new Date(leave.toDate || leave.endDate).toLocaleDateString()}
                            </span>
                            <span className="text-[#667085] block text-[10px]">
                              ({leave.numberOfDays || 1} day{(leave.numberOfDays || 1) > 1 ? 's' : ''})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[#667085] max-w-xs truncate">{leave.reason}</td>
                          <td className="py-3 px-3">
                            {status === 'approved' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                                ✓ Approved
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FFF7ED] text-[#EF4444] border border-[#EF4444]/30">
                                ✕ Rejected
                              </span>
                            )}
                            {status === 'pending' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">
                                Pending Review
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {status === 'pending' ? (
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setSelectedLeaveForApproval(leave._id)}
                                  className="btn-success px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Review & Approve</span>
                                </button>
                                <button
                                  onClick={() => setRejectionModalLeave(leave)}
                                  className="btn-danger px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                  title="Reject Leave"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#667085] font-medium italic">
                                Reviewed {leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleDateString() : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLeaves.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-[#667085]">
                          No leave applications found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ATTENDANCE MONITORING */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Daily Attendance Terminal Logs
                  </h2>
                  <p className="text-xs text-[#667085]">Live attendance records with timestamps</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Personnel</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Check-in Timestamp</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Terminal Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {attendance.map((att) => (
                      <tr key={att._id} className="hover:bg-[#F6F7F4] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#171A1F]">{att.user?.name || 'Staff Member'}</div>
                          <div className="text-[10px] text-[#667085] font-mono">{att.user?.employeeId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="capitalize font-semibold text-[#171A1F]">{att.user?.role}</span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-[#171A1F]">
                          {new Date(att.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#10B981]">
                          {att.checkInTime || new Date(att.createdAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                            ✓ {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#667085] italic">{att.notes || 'Terminal Check-in'}</td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-[#667085]">
                          No attendance records logged for today yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SHIFT SWAP APPROVALS */}
          {activeTab === 'swaps' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Shift Swap Peer Exchange Approvals
                  </h2>
                  <p className="text-xs text-[#667085]">Peer-accepted requests awaiting manager authorization</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Requester</th>
                      <th className="py-3 px-3">Target Peer</th>
                      <th className="py-3 px-3">Reason</th>
                      <th className="py-3 px-3">Peer Status</th>
                      <th className="py-3 px-3">Manager Status</th>
                      <th className="py-3 px-3 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {swaps.map((sw) => (
                      <tr key={sw._id} className="hover:bg-[#F6F7F4] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#171A1F]">{sw.requester?.name}</div>
                          <div className="text-[10px] text-[#667085] font-mono">{sw.requester?.employeeId}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#171A1F]">{sw.targetEmployee?.name}</div>
                          <div className="text-[10px] text-[#667085] font-mono">{sw.targetEmployee?.employeeId}</div>
                        </td>
                        <td className="py-3 px-3 text-[#667085] max-w-xs truncate">{sw.reason}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            sw.peerStatus === 'accepted' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}>
                            {sw.peerStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="capitalize font-bold text-[#171A1F]">{sw.adminStatus}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {sw.adminStatus === 'pending' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleSwapDecision(sw._id, 'approved')}
                                className="btn-success px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer"
                              >
                                Approve Swap
                              </button>
                              <button
                                onClick={() => handleSwapDecision(sw._id, 'rejected')}
                                className="btn-danger px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#667085] font-semibold">Resolved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {swaps.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-[#667085]">
                          No shift swap requests recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: CREW DIRECTORY */}
          {activeTab === 'crew' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Transit Crew Directory
                  </h2>
                  <p className="text-xs text-[#667085]">Certified drivers and conductors active in the depot</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={exportCrewRoster}
                    className="btn-secondary px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setIsCrewModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#10B981]" />
                    <span>Enroll Personnel</span>
                  </button>
                </div>
              </div>

              {/* Crew Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...drivers.map(d => ({ ...d, roleType: 'Driver' })), ...conductors.map(c => ({ ...c, roleType: 'Conductor' }))].map((crew, idx) => {
                  const isDriver = crew.roleType === 'Driver';
                  return (
                    <div key={crew._id || idx} className="card-employee card-interactive space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white ${
                            isDriver ? 'bg-gradient-to-br from-[#10B981] to-[#047857]' : 'bg-gradient-to-br from-[#F97316] to-[#C2410C]'
                          }`}>
                            {crew.name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#171A1F]">{crew.name}</h4>
                            <span className="text-[10px] text-[#667085] font-mono">ID: {crew.employeeId}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isDriver ? 'bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30' : 'bg-[#FFF7ED] text-[#C2410C] border border-[#F97316]/30'
                        }`}>
                          {crew.roleType}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-[#667085] bg-[#F6F7F4] p-2.5 rounded-xl border border-[#E4E7EC]">
                        <p>Phone: <strong className="text-[#171A1F]">{crew.phone || '+91 98765 00000'}</strong></p>
                        {crew.licenseNumber && (
                          <p className="text-[10px] font-mono">License: <span className="text-[#171A1F] font-semibold">{crew.licenseNumber}</span></p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#E4E7EC] flex items-center justify-between text-xs">
                        <span className="text-[#667085]">Roster Status</span>
                        <span className="font-bold text-[#10B981] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                          Available
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: BUS FLEET */}
          {activeTab === 'fleet' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Transit Bus Fleet Inventory
                  </h2>
                  <p className="text-xs text-[#667085]">Real-time operational status, registration and capacity</p>
                </div>

                <button
                  onClick={() => setIsBusModalOpen(true)}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Add Bus Vehicle</span>
                </button>
              </div>

              {/* Bus Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {buses.map((bus) => {
                  const isActive = bus.status === 'active' || bus.status === 'in_service';
                  const isMaint = bus.status === 'maintenance';

                  return (
                    <div key={bus._id} className="card-interactive p-4 rounded-2xl border border-[#E4E7EC] bg-[#FFFFFF] shadow-sm space-y-3 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#20242B] text-white flex items-center justify-center transition-transform group-hover:scale-105">
                            <BusIcon className="w-4 h-4 text-[#10B981]" />
                          </div>
                          <div>
                            <span className="text-sm font-black text-[#171A1F] block leading-none">{bus.busNumber}</span>
                            <span className="text-[10px] text-[#667085] font-mono">{bus.registrationNumber}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive ? 'bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30' :
                          isMaint ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30' :
                          'bg-[#F6F7F4] text-[#667085]'
                        }`}>
                          {bus.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[#667085]">
                        <div className="bg-[#F6F7F4] p-2 rounded-xl">
                          <span className="text-[10px] font-bold block text-[#667085]">CAPACITY</span>
                          <span className="font-semibold text-[#171A1F]">{bus.capacity || 45} Seats</span>
                        </div>
                        <div className="bg-[#F6F7F4] p-2 rounded-xl">
                          <span className="text-[10px] font-bold block text-[#667085]">MODEL</span>
                          <span className="font-semibold text-[#171A1F] truncate">{bus.modelName || 'City Express'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 8: ROUTES */}
          {activeTab === 'routes' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Transit Route Corridors & Waypoints
                  </h2>
                  <p className="text-xs text-[#667085]">Source, destination and intermediate stops</p>
                </div>

                <button
                  onClick={() => setIsRouteModalOpen(true)}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Create Transit Route</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((route) => (
                  <div key={route._id} className="card-interactive p-4 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
                      <span className="text-xs font-black text-[#171A1F] flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#F97316]" />
                        Route {route.routeNumber}
                      </span>
                      <span className="text-xs font-bold text-[#10B981]">
                        {route.distanceKm || 15} km • {route.estimatedDurationMins || 30} mins
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#171A1F]">
                      {route.source} ➔ {route.destination}
                    </div>

                    {route.stops && route.stops.length > 0 && (
                      <div className="text-[11px] text-[#667085] bg-[#F6F7F4] p-2.5 rounded-xl border border-[#E4E7EC]">
                        <span className="font-bold text-[#171A1F] block text-[10px] uppercase mb-1">Stops:</span>
                        {route.stops.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Bus Fleet Maintenance Log
                  </h2>
                  <p className="text-xs text-[#667085]">Scheduled inspections and repairs</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Bus Vehicle</th>
                      <th className="py-3 px-3">Service Type</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Service Provider</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {maintenance.map((m) => (
                      <tr key={m._id} className="hover:bg-[#F6F7F4] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#171A1F]">
                          {m.bus?.busNumber || 'Bus Vehicle'}
                        </td>
                        <td className="py-3 px-3 uppercase font-semibold text-[#171A1F]">{m.maintenanceType}</td>
                        <td className="py-3 px-3 text-[#667085] max-w-xs truncate">{m.description}</td>
                        <td className="py-3 px-3 text-[#667085]">{m.serviceProvider || 'Depot Central'}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'completed' ? 'bg-[#ECFDF5] text-[#047857]' : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {m.status !== 'completed' && (
                            <button
                              onClick={() => handleMaintenanceStatus(m._id, 'completed')}
                              className="btn-success px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Mark Done
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {maintenance.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-10 text-[#667085]">
                          Zero active maintenance records. All fleet operational!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: ISSUES */}
          {activeTab === 'issues' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Reported Crew & Vehicle Issues Log
                  </h2>
                  <p className="text-xs text-[#667085]">Tickets reported by drivers and conductors</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Reporter</th>
                      <th className="py-3 px-3">Bus Vehicle</th>
                      <th className="py-3 px-3">Issue Category</th>
                      <th className="py-3 px-3">Description</th>
                      <th className="py-3 px-3">Priority</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {issues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-[#F6F7F4] transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#171A1F]">{issue.reporter?.name || 'Crew Member'}</div>
                          <div className="text-[10px] text-[#667085] font-mono">{issue.reporter?.employeeId}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#171A1F]">{issue.bus?.busNumber || 'N/A'}</td>
                        <td className="py-3 px-3 uppercase font-semibold text-[#171A1F]">{issue.issueType}</td>
                        <td className="py-3 px-3 text-[#667085] max-w-xs truncate">{issue.description}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            issue.priority === 'high' ? 'bg-[#FFF7ED] text-[#EF4444]' : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}>
                            {issue.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="capitalize font-bold text-[#171A1F]">{issue.status}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {issue.status === 'reported' ? (
                            <button
                              onClick={() => handleIssueStatus(issue._id, 'assigned_maintenance')}
                              className="btn-warning px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                            >
                              Dispatch Repair
                            </button>
                          ) : (
                            <span className="text-[#10B981] font-bold text-xs">✓ In Repair</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-10 text-[#667085]">
                          Zero issue tickets logged. Operations nominal!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: REPORTS */}
          {activeTab === 'reports' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-6 animate-card-entrance">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
                <div>
                  <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                    Analytics & Export Reports
                  </h2>
                  <p className="text-xs text-[#667085]">Automated summaries and operational logs</p>
                </div>

                <button
                  onClick={exportCrewRoster}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#10B981]" />
                  <span>Download Crew Roster CSV</span>
                </button>
              </div>

              {summaryReport && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F6F7F4] border border-[#E4E7EC]">
                    <span className="text-[10px] font-bold uppercase text-[#667085] block">Total Drivers</span>
                    <span className="text-xl font-black text-[#171A1F] mt-1 block">{summaryReport.totalDrivers}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F6F7F4] border border-[#E4E7EC]">
                    <span className="text-[10px] font-bold uppercase text-[#667085] block">Total Conductors</span>
                    <span className="text-xl font-black text-[#171A1F] mt-1 block">{summaryReport.totalConductors}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F6F7F4] border border-[#E4E7EC]">
                    <span className="text-[10px] font-bold uppercase text-[#667085] block">Buses In Service</span>
                    <span className="text-xl font-black text-[#10B981] mt-1 block">{summaryReport.busesInService}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F6F7F4] border border-[#E4E7EC]">
                    <span className="text-[10px] font-bold uppercase text-[#667085] block">Work Orders</span>
                    <span className="text-xl font-black text-[#F97316] mt-1 block">{summaryReport.activeMaintenance}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 12: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <NotificationCenterView
              notifications={notifications}
              onToast={(msg) => showToast(msg)}
            />
          )}

          {/* TAB 13: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileView
              attendanceCount={attendance.length}
              leaveCount={leaves.length}
              shiftCount={shifts.length}
            />
          )}

          {/* TAB 14: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView onToast={(msg) => showToast(msg)} />
          )}
        </main>
      </div>

      {/* MODALS */}
      <AddBusModal isOpen={isBusModalOpen} onClose={() => setIsBusModalOpen(false)} onBusAdded={fetchAllManagerData} />
      <AddShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} onShiftCreated={fetchAllManagerData} buses={buses} drivers={drivers} conductors={conductors} routes={routes} />
      <AddRouteModal isOpen={isRouteModalOpen} onClose={() => setIsRouteModalOpen(false)} onRouteAdded={fetchAllManagerData} />
      <AddCrewModal isOpen={isCrewModalOpen} onClose={() => setIsCrewModalOpen(false)} onCrewAdded={fetchAllManagerData} />

      {/* Leave Approval & Vacancy Resolution Modal */}
      {selectedLeaveForApproval && (
        <ReassignShiftModal
          isOpen={!!selectedLeaveForApproval}
          onClose={() => setSelectedLeaveForApproval(null)}
          leaveId={selectedLeaveForApproval}
          onApproved={() => {
            showToast('Leave approved with vacancy reassignments updated!');
            fetchAllManagerData();
          }}
        />
      )}

      {/* Rejection Prompt Modal */}
      {rejectionModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-md overflow-hidden animate-card-entrance">
            <div className="bg-[#171A1F] text-white p-5 flex items-center justify-between border-b border-[#2A2E36]">
              <h3 className="text-base font-black text-white">Reject Leave Application</h3>
              <button onClick={() => setRejectionModalLeave(null)} className="btn-icon text-[#667085] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#667085]">
                Please specify the reason for rejecting leave request for <span className="font-bold text-[#171A1F]">{rejectionModalLeave.employeeName}</span>:
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Insufficient replacement crew available on selected dates"
                className="input-transit w-full p-3 rounded-xl text-xs h-24"
              />
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectionModalLeave(null)}
                  className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectLeaveSubmit}
                  disabled={rejecting}
                  className="btn-danger px-5 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
