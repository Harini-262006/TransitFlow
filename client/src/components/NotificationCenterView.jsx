import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Repeat,
  Trash2,
  Check,
  Filter
} from 'lucide-react';

const NotificationCenterView = ({ notifications = [], onMarkRead, onToast }) => {
  const [filter, setFilter] = useState('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="space-y-6 animate-card-entrance max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#171A1F] text-white p-6 rounded-2xl border border-[#2A2E36] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#20242B] border border-[#2A2E36] flex items-center justify-center text-[#10B981]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white">Notification Center</h2>
            <p className="text-[11px] text-[#CBD1D7]">System alerts, schedule modifications, and leave approvals</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#20242B] text-white border border-[#2A2E36] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="read">Archived / Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card-base p-6">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#667085]">
            <CheckCircle2 className="w-10 h-10 text-[#CBD1D7] mx-auto mb-2" />
            <p className="font-bold text-[#171A1F]">No notifications in this view</p>
            <p className="text-[11px] text-[#667085] mt-0.5">You are up-to-date with all depot communications.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((n, idx) => (
              <div
                key={n._id || idx}
                className={`card-notification p-4 rounded-xl flex items-start justify-between gap-4 ${
                  !n.read ? 'unread' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171A1F]">{n.title}</h4>
                    <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-[#667085] font-mono mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Recent alert'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-0.5 rounded-full shrink-0 border border-[#10B981]/20">
                  Delivered
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenterView;
