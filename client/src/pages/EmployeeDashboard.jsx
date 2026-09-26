import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { shiftAPI, notificationAPI } from '../services/api';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Bus as BusIcon,
  MapPin,
  Play,
  Check,
  AlertCircle,
  Bell,
  UserCheck,
  RefreshCw,
  Navigation
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();

  const [shifts, setShifts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('shifts'); // 'shifts' | 'notifications'

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [shiftsRes, notifRes] = await Promise.all([
        shiftAPI.getAll(),
        notificationAPI.getAll()
      ]);
      setShifts(shiftsRes.data.data || []);
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error('Failed to load employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async (shiftId, newStatus) => {
    setUpdatingId(shiftId);
    try {
      await shiftAPI.updateStatus(shiftId, newStatus);
      await fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update shift status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 border border-amber-200 text-xs px-3 py-1 rounded-full font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 border border-emerald-200 text-xs px-3 py-1 rounded-full font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-600 border border-red-200 text-xs px-3 py-1 rounded-full font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 border border-blue-200 text-xs px-3 py-1 rounded-full font-bold">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
    }
  };

  const activeShift = shifts.find((s) => s.status === 'in_progress' || s.status === 'scheduled');
  const completedCount = shifts.filter((s) => s.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <BusIcon className="w-4 h-4" /> Bus Operations Console
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Employee ID: <span className="text-slate-200 font-mono font-bold">{user?.employeeId}</span> • Role: <span className="text-blue-300 font-semibold uppercase">{user?.role}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-slate-700 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Duty</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Assigned Shifts</div>
              <div className="text-2xl font-black text-slate-900">{shifts.length} Shifts</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Trips</div>
              <div className="text-2xl font-black text-slate-900">{completedCount} Trips</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-600 p-3.5 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Shift Status</div>
              <div className="text-lg font-bold text-slate-900">
                {activeShift ? activeShift.startTime : 'No active shift'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-4">
          <button
            onClick={() => setActiveTab('shifts')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'shifts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            My Assigned Shifts ({shifts.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'notifications'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            System Notifications ({notifications.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'shifts' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                Fetching assigned bus shifts...
              </div>
            ) : shifts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <BusIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Bus Shifts Assigned Yet</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Check back soon or contact your Bus Operations Manager.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/90 hover:shadow-md transition-shadow space-y-4"
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white p-2.5 rounded-xl font-black text-sm">
                          {shift.bus?.busNumber || 'BUS'}
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-mono">
                            Reg: {shift.bus?.registrationNumber || 'N/A'}
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            Route {shift.route?.routeNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div>{getStatusBadge(shift.status)}</div>
                    </div>

                    {/* Route Details */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                      <div className="flex items-center text-sm font-semibold text-slate-800">
                        <Navigation className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
                        <span>{shift.route?.source || 'Start'} ➔ {shift.route?.destination || 'End'}</span>
                      </div>
                      <div className="flex items-center text-xs text-slate-500 space-x-4 pl-6">
                        <span>Distance: {shift.route?.distanceKm || 0} km</span>
                        <span>Est: {shift.route?.estimatedDurationMins || 0} mins</span>
                      </div>
                    </div>

                    {/* Duty Crew & Time */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-semibold block uppercase">Timing</span>
                        <span className="font-bold text-slate-800 text-sm">
                          {shift.startTime} - {shift.endTime}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-semibold block uppercase">Driver / Conductor</span>
                        <span className="font-bold text-slate-800">
                          {shift.driver?.name || 'N/A'} & {shift.conductor?.name || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Live Action Buttons */}
                    <div className="pt-2 flex items-center justify-end space-x-3">
                      {shift.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusUpdate(shift._id, 'in_progress')}
                          disabled={updatingId === shift._id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Start Trip</span>
                        </button>
                      )}

                      {shift.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(shift._id, 'completed')}
                          disabled={updatingId === shift._id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Trip Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Notifications Log
            </h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">No notifications found.</p>
            ) : (
              notifications.map((notif, i) => (
                <div key={notif._id || i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-bold text-sm text-slate-900">{notif.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{notif.message}</div>
                  <div className="text-[10px] text-slate-400 mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
