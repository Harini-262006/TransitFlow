import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { shiftAPI, attendanceAPI, leaveAPI, swapAPI, issueAPI, busAPI, driverAPI, notificationAPI } from '../services/api';
import NotificationCenterView from '../components/NotificationCenterView';
import ProfileView from '../components/ProfileView';
import SettingsView from '../components/SettingsView';
import CalendarScheduleView from '../components/CalendarScheduleView';
import {
  Bus as BusIcon,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Send,
  RefreshCw,
  Navigation,
  User,
  Check,
  Play,
  FileText,
  Plus,
  ArrowRight,
  ShieldCheck,
  X,
  Loader2,
  CalendarDays,
  AlertCircle,
  Sparkles,
  Repeat,
  CheckSquare,
  MapPin
} from 'lucide-react';

const DriverDashboard = () => {
  const { user } = useAuth();

  const [shifts, setShifts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [issues, setIssues] = useState([]);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Forms state
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: '',
    remarks: ''
  });

  const [issueForm, setIssueForm] = useState({
    bus: '',
    issueType: 'engine',
    description: '',
    priority: 'medium'
  });

  const [swapForm, setSwapForm] = useState({
    targetEmployee: '',
    requesterShift: '',
    reason: ''
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchDriverData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, attRes, leaveRes, swapRes, issueRes, busRes, drvRes, notifRes] = await Promise.all([
        shiftAPI.getAll().catch(() => ({ data: { data: [] } })),
        attendanceAPI.getAll().catch(() => ({ data: { data: [] } })),
        leaveAPI.getMy().catch(() => ({ data: { data: [] } })),
        swapAPI.getAll().catch(() => ({ data: { data: [] } })),
        issueAPI.getAll().catch(() => ({ data: { data: [] } })),
        busAPI.getAll().catch(() => ({ data: { data: [] } })),
        driverAPI.getAll().catch(() => ({ data: { data: [] } })),
        notificationAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      setShifts(shiftsRes.data.data || []);
      setAttendance(attRes.data.data || []);
      setLeaves(leaveRes.data.data || []);
      setSwaps(swapRes.data.data || []);
      setIssues(issueRes.data.data || []);
      setBuses(busRes.data.data || []);
      setDrivers(drvRes.data.data || []);
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error('Failed to load driver data:', err);
      showToast('Error syncing driver portal', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const handleMarkAttendance = async (shiftId) => {
    setActionLoading(true);
    try {
      await attendanceAPI.mark({ shift: shiftId, status: 'present', notes: 'Driver terminal check-in' });
      showToast('Attendance logged as Present for today!', 'success');
      await fetchDriverData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Attendance error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason.trim()) {
      setFormError('Please select From Date, To Date, and provide a valid reason.');
      return;
    }

    if (new Date(leaveForm.fromDate) > new Date(leaveForm.toDate)) {
      setFormError('From date cannot be after To date.');
      return;
    }

    setActionLoading(true);
    try {
      await leaveAPI.submit(leaveForm);
      showToast('Leave request submitted for Manager approval!');
      setShowLeaveModal(false);
      setLeaveForm({ leaveType: 'Casual Leave', fromDate: '', toDate: '', reason: '', remarks: '' });
      await fetchDriverData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error submitting leave request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!issueForm.bus || !issueForm.description.trim()) {
      setFormError('Please select Bus vehicle and describe the issue.');
      return;
    }

    setActionLoading(true);
    try {
      await issueAPI.report(issueForm);
      showToast('Issue ticket submitted to Manager!');
      setShowIssueModal(false);
      setIssueForm({ bus: '', issueType: 'engine', description: '', priority: 'medium' });
      await fetchDriverData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error reporting issue.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSwapSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!swapForm.targetEmployee || !swapForm.requesterShift || !swapForm.reason.trim()) {
      setFormError('Please select target driver, shift to trade, and specify reason.');
      return;
    }

    setActionLoading(true);
    try {
      await swapAPI.request(swapForm);
      showToast('Shift swap request sent to peer driver!');
      setShowSwapModal(false);
      setSwapForm({ targetEmployee: '', requesterShift: '', reason: '' });
      await fetchDriverData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error sending swap request.');
    } finally {
      setActionLoading(false);
    }
  };

  // Find Driver's Assigned Shifts
  const myShifts = shifts.filter(s => {
    const drvName = s.driver?.name?.toLowerCase();
    const userName = user?.name?.toLowerCase();
    const drvEmpId = s.driver?.employeeId?.toUpperCase();
    const userEmpId = user?.employeeId?.toUpperCase();
    const drvUserId = (s.driver?.user?._id || s.driver?.user || '').toString();
    const currentUserId = (user?._id || '').toString();

    return Boolean(
      (drvName && userName && drvName === userName) ||
      (drvEmpId && userEmpId && drvEmpId === userEmpId) ||
      (drvUserId && currentUserId && drvUserId === currentUserId)
    );
  });

  const nextShift = myShifts[0] || (shifts.length > 0 ? shifts[0] : null);

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
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          role="driver"
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Top Banner */}
          <div className="bg-white p-5 rounded-[20px] shadow-sm border border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#171A1F] tracking-tight">
                  Welcome back, Captain {user?.name}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                  Driver Portal
                </span>
              </div>
              <p className="text-xs text-[#667085] mt-1 font-medium">
                Review your assigned bus corridor, log one-touch attendance, and submit leave applications.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Apply for Leave</span>
              </button>

              <button
                onClick={() => setShowSwapModal(true)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Repeat className="w-3.5 h-3.5 text-[#F97316]" />
                <span>Request Swap</span>
              </button>

              <button
                onClick={() => setShowIssueModal(true)}
                className="btn-secondary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Report Issue</span>
              </button>
            </div>
          </div>

          {/* Today's Active Assignment Showcase Card */}
          <div className="card-feature p-6 sm:p-7 rounded-[24px] relative overflow-hidden animate-card-entrance">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20242B] border border-[#2A2E36] text-[#10B981] text-xs font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Next Scheduled Shift Duty</span>
                </div>

                {nextShift ? (
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Route {nextShift.route?.routeNumber}: {nextShift.route?.source} ➔ {nextShift.route?.destination}
                    </h2>
                    <p className="text-xs text-[#CBD1D7] mt-1 font-medium">
                      Date: {new Date(nextShift.shiftDate).toLocaleDateString()} • Departure Window: <span className="text-[#10B981] font-bold">{nextShift.startTime} - {nextShift.endTime}</span>
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#CBD1D7]">
                      <span className="flex items-center gap-1.5 font-bold text-white">
                        <BusIcon className="w-4 h-4 text-[#10B981]" />
                        Bus {nextShift.bus?.busNumber} ({nextShift.bus?.registrationNumber || 'KA-01-F-7890'})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#F97316]" />
                        Co-Conductor: <strong className="text-white">{nextShift.conductor?.name || 'Suresh Raina'}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-white">No active shifts scheduled for today</h2>
                    <p className="text-xs text-[#667085] mt-1">Enjoy your rest cycle or contact your depot manager.</p>
                  </div>
                )}
              </div>

              {/* Attendance Button */}
              {nextShift && (
                <div className="bg-[#20242B] p-5 rounded-2xl border border-[#2A2E36] flex flex-col items-center justify-center space-y-3 shrink-0 shadow-lg">
                  <span className="text-xs font-bold uppercase text-[#CBD1D7] tracking-wider">Trip Duty Verification</span>
                  <button
                    onClick={() => handleMarkAttendance(nextShift._id)}
                    disabled={actionLoading}
                    className="btn-success px-6 py-3 rounded-xl text-xs font-black tracking-wide shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Check className="w-4 h-4 text-white" />
                    )}
                    <span>MARK ATTENDANCE (PRESENT)</span>
                  </button>
                  <span className="text-[10px] text-[#667085] font-mono">Timestamp synced to depot server</span>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: OVERVIEW & ROSTER */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-card-entrance">
              
              {/* Upcoming Shift Duties */}
              <div className="card-base p-5 sm:p-6 rounded-[24px] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                  <h3 className="text-sm font-black text-[#171A1F] uppercase tracking-wider">
                    My Upcoming Shift Rota
                  </h3>
                  <span className="text-xs text-[#10B981] font-bold">Active Roster</span>
                </div>

                <div className="space-y-3">
                  {myShifts.length > 0 ? (
                    myShifts.map((shift, idx) => (
                      <div key={shift._id || idx} className="card-shift card-interactive flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-black text-[#171A1F] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                            Route {shift.route?.routeNumber}: {shift.route?.source} ➔ {shift.route?.destination}
                          </div>
                          <div className="text-[11px] text-[#667085] font-mono">
                            {new Date(shift.shiftDate).toLocaleDateString()} • {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                          Assigned
                        </span>
                      </div>
                    ))
                  ) : (
                    shifts.slice(0, 3).map((shift, idx) => (
                      <div key={shift._id || idx} className="card-shift card-interactive flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-xs font-black text-[#171A1F] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                            Route {shift.route?.routeNumber}: {shift.route?.source} ➔ {shift.route?.destination}
                          </div>
                          <div className="text-[11px] text-[#667085] font-mono">
                            {new Date(shift.shiftDate).toLocaleDateString()} • {shift.startTime} - {shift.endTime}
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                          Depot Roster
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* My Leave Applications & Status */}
              <div className="card-base p-5 sm:p-6 rounded-[24px] space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-3">
                  <h3 className="text-sm font-black text-[#171A1F] uppercase tracking-wider">
                    My Leave Requests ({leaves.length})
                  </h3>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="text-xs font-bold text-[#10B981] hover:text-[#047857] cursor-pointer"
                  >
                    + Apply Leave
                  </button>
                </div>

                <div className="space-y-3">
                  {leaves.map((l) => {
                    const status = (l.status || 'pending').toLowerCase();
                    return (
                      <div key={l._id} className={`card-leave card-interactive space-y-2 ${status === 'pending' ? 'pending-accent' : ''}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#171A1F]">{l.leaveType}</span>
                          {status === 'approved' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30">
                              ✓ Approved
                            </span>
                          )}
                          {status === 'rejected' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FFF7ED] text-[#EF4444] border border-[#EF4444]/30">
                              ✕ Rejected
                            </span>
                          )}
                          {status === 'pending' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30">
                              Pending Manager Review
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-[#667085]">
                          Dates: <strong className="text-[#171A1F]">{new Date(l.fromDate || l.startDate).toLocaleDateString()}</strong> to <strong className="text-[#171A1F]">{new Date(l.toDate || l.endDate).toLocaleDateString()}</strong> ({l.numberOfDays || 1} day{(l.numberOfDays || 1) > 1 ? 's' : ''})
                        </div>

                        <p className="text-xs text-[#667085] italic">"{l.reason}"</p>
                        {l.managerRemarks && (
                          <p className="text-[11px] text-[#10B981] font-semibold">Manager: {l.managerRemarks}</p>
                        )}
                      </div>
                    );
                  })}
                  {leaves.length === 0 && (
                    <p className="text-center py-8 text-xs text-[#667085]">
                      No leave requests submitted. Click "Apply for Leave" above when needed.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE HISTORY */}
          {activeTab === 'attendance' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                My Attendance History & Verified Logs
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E7EC] text-[#667085] uppercase tracking-wider font-bold">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Terminal Timestamp</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E7EC]">
                    {attendance.map((att) => (
                      <tr key={att._id} className="hover:bg-[#F6F7F4]">
                        <td className="py-3 px-3 font-bold text-[#171A1F]">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="py-3 px-3 font-mono text-[#10B981]">{att.checkInTime || new Date(att.createdAt).toLocaleTimeString()}</td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857]">
                            ✓ {att.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#667085]">{att.notes || 'Terminal Check-in'}</td>
                      </tr>
                    ))}
                    {attendance.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-[#667085]">
                          No attendance records found. Use the verification button on your active shift.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LEAVES APPLICATION */}
          {activeTab === 'leaves' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                  Leave Applications & Entitlement
                </h2>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  + Apply for Leave
                </button>
              </div>

              <div className="space-y-3">
                {leaves.map((l) => (
                  <div key={l._id} className="p-4 rounded-2xl border border-[#E4E7EC] bg-[#F6F7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#171A1F] text-sm">{l.leaveType}</span>
                        <span className="text-xs text-[#667085]">
                          ({new Date(l.fromDate || l.startDate).toLocaleDateString()} ➔ {new Date(l.toDate || l.endDate).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-xs text-[#667085] mt-1 italic">"{l.reason}"</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      l.status === 'approved' ? 'bg-[#ECFDF5] text-[#047857]' :
                      l.status === 'rejected' ? 'bg-[#FFF7ED] text-[#EF4444]' :
                      'bg-[#FEF3C7] text-[#92400E]'
                    }`}>
                      {l.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SWAPS */}
          {activeTab === 'swaps' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                  Shift Swap Requests
                </h2>
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  + Request Shift Trade
                </button>
              </div>

              <div className="space-y-3">
                {swaps.map((sw) => (
                  <div key={sw._id} className="p-4 rounded-xl border border-[#E4E7EC] bg-[#F6F7F4] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#171A1F]">Trade with: {sw.targetEmployee?.name || 'Peer Driver'}</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">Reason: {sw.reason}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FEF3C7] text-[#92400E]">
                      {sw.adminStatus || 'Pending'}
                    </span>
                  </div>
                ))}
                {swaps.length === 0 && (
                  <p className="text-center py-8 text-xs text-[#667085]">Zero shift swap requests recorded.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ISSUES */}
          {activeTab === 'issues' && (
            <div className="bg-white p-5 sm:p-7 rounded-[24px] shadow-sm border border-[#E4E7EC] space-y-5 animate-card-entrance">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-[#171A1F] tracking-tight">
                  Reported Bus & Maintenance Issues
                </h2>
                <button
                  onClick={() => setShowIssueModal(true)}
                  className="btn-warning px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  + Report Bus Problem
                </button>
              </div>

              <div className="space-y-3">
                {issues.map((issue) => (
                  <div key={issue._id} className="p-4 rounded-xl border border-[#E4E7EC] bg-[#F6F7F4] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#171A1F]">Bus {issue.bus?.busNumber} • {issue.issueType}</p>
                      <p className="text-[11px] text-[#667085] mt-0.5">{issue.description}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ECFDF5] text-[#047857]">
                      {issue.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SHIFTS / CALENDAR ROSTER */}
          {activeTab === 'shifts' && (
            <div className="space-y-4 animate-card-entrance">
              <CalendarScheduleView shifts={shifts} />
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <NotificationCenterView
              notifications={notifications}
              onToast={(msg) => showToast(msg)}
            />
          )}

          {/* TAB 8: PROFILE */}
          {activeTab === 'profile' && (
            <ProfileView
              attendanceCount={attendance.length}
              leaveCount={leaves.length}
              shiftCount={myShifts.length || shifts.length}
            />
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView onToast={(msg) => showToast(msg)} />
          )}
        </main>
      </div>

      {/* LEAVE APPLICATION MODAL */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-md overflow-hidden animate-card-entrance">
            <div className="bg-[#171A1F] text-white p-5 flex items-center justify-between border-b border-[#2A2E36]">
              <div className="flex items-center space-x-2">
                <div className="bg-[#10B981] p-1.5 rounded-lg text-white">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Submit Driver Leave Request</h3>
              </div>
              <button onClick={() => setShowLeaveModal(false)} className="text-[#667085] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-[#FFF7ED] border border-[#EF4444]/30 text-[#EF4444] p-3 rounded-xl text-xs font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Leave Classification *
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Medical Leave">Medical Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                  <option value="Other">Other Duty Off</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                    From Date *
                  </label>
                  <input
                    type="date"
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                    To Date *
                  </label>
                  <input
                    type="date"
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Reason for Absence *
                </label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Scheduled medical checkup and doctor prescribed rest"
                  className="input-transit w-full p-2.5 rounded-xl text-xs h-20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={leaveForm.remarks}
                  onChange={(e) => setLeaveForm({ ...leaveForm, remarks: e.target.value })}
                  placeholder="Available on mobile if urgent"
                  className="input-transit w-full p-2.5 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit to Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-md overflow-hidden animate-card-entrance">
            <div className="bg-[#171A1F] text-white p-5 flex items-center justify-between border-b border-[#2A2E36]">
              <h3 className="text-base font-black text-white">Report Bus / Equipment Problem</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-[#667085] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Bus Vehicle *
                </label>
                <select
                  value={issueForm.bus}
                  onChange={(e) => setIssueForm({ ...issueForm, bus: e.target.value })}
                  className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                  required
                >
                  <option value="">-- Choose Bus --</option>
                  {buses.map((b) => (
                    <option key={b._id} value={b._id}>{b.busNumber} ({b.registrationNumber})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Issue Classification
                </label>
                <select
                  value={issueForm.issueType}
                  onChange={(e) => setIssueForm({ ...issueForm, issueType: e.target.value })}
                  className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <option value="engine">Engine / Acceleration</option>
                  <option value="brake">Braking System</option>
                  <option value="electrical">Electrical / Headlights</option>
                  <option value="ac">Air Conditioning / Ventilation</option>
                  <option value="other">Other Mechanical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Problem Description *
                </label>
                <textarea
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  placeholder="e.g. Brake pressure warning light flashing on dashboard"
                  className="input-transit w-full p-2.5 rounded-xl text-xs h-20"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#171A1F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary-transit px-5 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Reporting...' : 'Dispatch Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SWAP MODAL */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-md overflow-hidden animate-card-entrance">
            <div className="bg-[#171A1F] text-white p-5 flex items-center justify-between border-b border-[#2A2E36]">
              <h3 className="text-base font-black text-white">Request Shift Exchange</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-[#667085] hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSwapSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Select Peer Driver *
                </label>
                <select
                  value={swapForm.targetEmployee}
                  onChange={(e) => setSwapForm({ ...swapForm, targetEmployee: e.target.value })}
                  className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                  required
                >
                  <option value="">-- Choose Peer Driver --</option>
                  {drivers.filter(d => d.user?._id !== user?._id).map((d) => (
                    <option key={d._id} value={d.user?._id || d._id}>{d.name} ({d.employeeId})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  My Assigned Shift to Trade *
                </label>
                <select
                  value={swapForm.requesterShift}
                  onChange={(e) => setSwapForm({ ...swapForm, requesterShift: e.target.value })}
                  className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                  required
                >
                  <option value="">-- Choose Shift --</option>
                  {myShifts.map((s) => (
                    <option key={s._id} value={s._id}>
                      {new Date(s.shiftDate).toLocaleDateString()} • {s.startTime} - {s.endTime} (Route {s.route?.routeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Swap Reason *
                </label>
                <input
                  type="text"
                  value={swapForm.reason}
                  onChange={(e) => setSwapForm({ ...swapForm, reason: e.target.value })}
                  placeholder="e.g. Urgent family commitment in morning"
                  className="input-transit w-full p-2.5 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#E4E7EC]">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#667085] hover:text-[#171A1F] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary-transit px-5 py-2.5 text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Trade Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
