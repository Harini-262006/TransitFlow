import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Edit3,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileView = ({ attendanceCount = 0, leaveCount = 0, shiftCount = 0 }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Central Depot, Bay 4');
  const [emergencyContact, setEmergencyContact] = useState('+91 98111 22334');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 600);
  };

  const getRoleTheme = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager':
        return {
          bg: 'bg-[#F5F3FF]',
          text: 'text-[#8B5CF6]',
          border: 'border-[#8B5CF6]/30',
          gradient: 'from-[#8B5CF6] to-[#6D28D9]'
        };
      case 'driver':
        return {
          bg: 'bg-[#ECFDF5]',
          text: 'text-[#047857]',
          border: 'border-[#10B981]/30',
          gradient: 'from-[#10B981] to-[#047857]'
        };
      case 'conductor':
        return {
          bg: 'bg-[#FFF7ED]',
          text: 'text-[#C2410C]',
          border: 'border-[#F97316]/30',
          gradient: 'from-[#F97316] to-[#C2410C]'
        };
      default:
        return {
          bg: 'bg-[#ECFDF5]',
          text: 'text-[#047857]',
          border: 'border-[#10B981]/30',
          gradient: 'from-[#10B981] to-[#047857]'
        };
    }
  };

  const theme = getRoleTheme(user?.role);

  return (
    <div className="space-y-6 animate-card-entrance max-w-4xl mx-auto">
      {/* Profile Header Banner */}
      <div className="bg-[#171A1F] text-white rounded-2xl p-6 sm:p-8 border border-[#2A2E36] relative overflow-hidden shadow-lg">
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white text-2xl font-black shadow-xl shrink-0`}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{user?.name}</h2>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.bg} ${theme.text} ${theme.border}`}
                >
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-[#CBD1D7] font-mono mt-1">
                Employee ID: <span className="text-[#10B981] font-bold">{user?.employeeId}</span> • Registered Account
              </p>
              <p className="text-xs text-[#667085] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Contact Info'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-[#ECFDF5] border border-[#10B981]/30 text-[#047857] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-card-entrance">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>Profile contact details updated successfully!</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-stat p-5">
          <div className="flex items-center gap-3">
            <div className="stat-icon w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#667085]">Duty Attendance</p>
              <p className="text-xl font-black text-[#171A1F]">{attendanceCount} Records</p>
              <p className="text-[10px] text-[#10B981] font-bold">100% Verified Log</p>
            </div>
          </div>
        </div>

        <div className="card-stat p-5">
          <div className="flex items-center gap-3">
            <div className="stat-icon w-10 h-10 rounded-xl bg-[#FFF7ED] text-[#C2410C] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#667085]">Leave Requests</p>
              <p className="text-xl font-black text-[#171A1F]">{leaveCount} Filed</p>
              <p className="text-[10px] text-[#F97316] font-bold">Annual Quota Tracked</p>
            </div>
          </div>
        </div>

        <div className="card-stat p-5">
          <div className="flex items-center gap-3">
            <div className="stat-icon w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#8B5CF6] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#667085]">Assigned Shifts</p>
              <p className="text-xl font-black text-[#171A1F]">{shiftCount} Duties</p>
              <p className="text-[10px] text-[#8B5CF6] font-bold">Depot Active Schedule</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Card & Edit Form */}
      <div className="card-form p-6">
        <h3 className="text-sm font-bold text-[#171A1F] uppercase tracking-wider mb-4 border-b border-[#E4E7EC] pb-3">
          Personnel Details & Operational Station
        </h3>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                  Emergency Phone
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                  Assigned Terminal / Depot Station
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Primary Email</p>
                <p className="font-bold text-[#171A1F] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-[#10B981]" /> {user?.email}
                </p>
              </div>

              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Contact Mobile</p>
                <p className="font-bold text-[#171A1F] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#10B981]" /> {phone}
                </p>
              </div>

              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Emergency Contact</p>
                <p className="font-bold text-[#171A1F] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#EF4444]" /> {emergencyContact}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Depot Base Station</p>
                <p className="font-bold text-[#171A1F] flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {location}
                </p>
              </div>

              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Account Security & Status</p>
                <p className="font-bold text-[#10B981] flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" /> Active & Verified Transport Staff
                </p>
              </div>

              <div>
                <p className="text-[#667085] font-semibold text-[11px]">Authentication Role</p>
                <p className="font-bold text-[#171A1F] uppercase font-mono mt-0.5">
                  {user?.role} (Standard Access)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
