import React, { useState } from 'react';
import {
  Bell,
  Lock,
  Moon,
  Shield,
  Smartphone,
  CheckCircle2,
  Save,
  Loader2,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsView = ({ onToast }) => {
  const [notifyShifts, setNotifyShifts] = useState(true);
  const [notifyLeaves, setNotifyLeaves] = useState(true);
  const [notifySwaps, setNotifySwaps] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [compactRosters, setCompactRosters] = useState(false);
  const [autoCheckinReminder, setAutoCheckinReminder] = useState(true);

  // Security password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    if (onToast) onToast('Notification and system preferences saved successfully!');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus({ error: 'Please fill in all password fields' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ error: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters' });
      return;
    }

    setUpdatingPassword(true);
    setTimeout(() => {
      setUpdatingPassword(false);
      setPasswordStatus({ success: 'Security password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onToast) onToast('Password updated securely!');
      setTimeout(() => setPasswordStatus(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-card-entrance max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#171A1F] text-white p-6 sm:p-7 rounded-2xl border border-[#2A2E36] flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#20242B] border border-[#2A2E36] flex items-center justify-center text-[#10B981]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">System & Portal Settings</h2>
            <p className="text-[11px] text-[#CBD1D7]">Configure notifications, alerts, and account security</p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card-form p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-[#E4E7EC] pb-3">
          <Bell className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-xs font-bold text-[#171A1F] uppercase tracking-wider">
            Notification & Alert Rules
          </h3>
        </div>

        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4]/70 hover:bg-[#F6F7F4] transition-colors cursor-pointer border border-[#E4E7EC]/60">
              <div>
                <p className="text-xs font-bold text-[#171A1F]">Duty & Shift Rosters</p>
                <p className="text-[11px] text-[#667085]">Receive alerts when new shifts or reassignments are issued</p>
              </div>
              <input
                type="checkbox"
                checked={notifyShifts}
                onChange={(e) => setNotifyShifts(e.target.checked)}
                className="w-4 h-4 text-[#10B981] rounded border-[#CBD1D7] focus:ring-[#10B981] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4]/70 hover:bg-[#F6F7F4] transition-colors cursor-pointer border border-[#E4E7EC]/60">
              <div>
                <p className="text-xs font-bold text-[#171A1F]">Leave Status Decisions</p>
                <p className="text-[11px] text-[#667085]">Instant notifications when leave applications are approved or rejected</p>
              </div>
              <input
                type="checkbox"
                checked={notifyLeaves}
                onChange={(e) => setNotifyLeaves(e.target.checked)}
                className="w-4 h-4 text-[#10B981] rounded border-[#CBD1D7] focus:ring-[#10B981] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4]/70 hover:bg-[#F6F7F4] transition-colors cursor-pointer border border-[#E4E7EC]/60">
              <div>
                <p className="text-xs font-bold text-[#171A1F]">Peer Shift Swaps</p>
                <p className="text-[11px] text-[#667085]">Alerts for peer shift trade requests and manager decisions</p>
              </div>
              <input
                type="checkbox"
                checked={notifySwaps}
                onChange={(e) => setNotifySwaps(e.target.checked)}
                className="w-4 h-4 text-[#10B981] rounded border-[#CBD1D7] focus:ring-[#10B981] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#F6F7F4]/70 hover:bg-[#F6F7F4] transition-colors cursor-pointer border border-[#E4E7EC]/60">
              <div>
                <p className="text-xs font-bold text-[#171A1F]">Auto Check-in Reminder</p>
                <p className="text-[11px] text-[#667085]">Push prompt 15 minutes before scheduled duty start time</p>
              </div>
              <input
                type="checkbox"
                checked={autoCheckinReminder}
                onChange={(e) => setAutoCheckinReminder(e.target.checked)}
                className="w-4 h-4 text-[#10B981] rounded border-[#CBD1D7] focus:ring-[#10B981] cursor-pointer"
              />
            </label>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#E4E7EC]">
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Notification Rules</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="card-form p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-[#E4E7EC] pb-3">
          <Lock className="w-4 h-4 text-[#10B981]" />
          <h3 className="text-xs font-bold text-[#171A1F] uppercase tracking-wider">
            Account Security & Authentication Password
          </h3>
        </div>

        {passwordStatus?.error && (
          <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#EF4444]/30 text-[#EF4444] rounded-xl text-xs font-semibold">
            {passwordStatus.error}
          </div>
        )}

        {passwordStatus?.success && (
          <div className="mb-4 p-3 bg-[#ECFDF5] border border-[#10B981]/30 text-[#047857] rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>{passwordStatus.success}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium pr-8"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-transit w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#667085] hover:text-[#171A1F] font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? 'Hide password text' : 'Reveal password text'}</span>
            </button>

            <button
              type="submit"
              disabled={updatingPassword}
              className="btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {updatingPassword ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#10B981]" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsView;
