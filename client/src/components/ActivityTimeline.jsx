import React from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Ticket,
  Repeat,
  Wrench,
  Bus
} from 'lucide-react';

const ActivityTimeline = ({ leaves = [], shifts = [], attendance = [], swaps = [], issues = [] }) => {
  // Build aggregated timeline events from real data
  const events = [];

  // 1. Leave events
  leaves.slice(0, 5).forEach((l) => {
    events.push({
      id: `leave-${l._id}`,
      type: 'leave',
      title: `${l.applicant?.name || 'Employee'} (${l.applicant?.role || 'Crew'}) submitted ${l.leaveType || 'Leave'}`,
      description: `Reason: ${l.reason || 'Personal'} • Status: ${(l.status || 'Pending').toUpperCase()}`,
      time: l.createdAt ? new Date(l.createdAt) : new Date(),
      status: l.status,
      icon: CalendarCheck,
      color: l.status === 'approved' ? 'text-[#10B981]' : l.status === 'rejected' ? 'text-[#EF4444]' : 'text-[#F59E0B]',
      bg: l.status === 'approved' ? 'bg-[#ECFDF5]' : l.status === 'rejected' ? 'bg-[#FEF2F2]' : 'bg-[#FFFBEB]'
    });
  });

  // 2. Attendance events
  attendance.slice(0, 5).forEach((a) => {
    events.push({
      id: `att-${a._id}`,
      type: 'attendance',
      title: `${a.user?.name || 'Staff'} logged attendance as ${a.status?.toUpperCase() || 'PRESENT'}`,
      description: `Duty check-in recorded for terminal shift`,
      time: a.createdAt ? new Date(a.createdAt) : new Date(),
      status: a.status,
      icon: CheckCircle2,
      color: 'text-[#10B981]',
      bg: 'bg-[#ECFDF5]'
    });
  });

  // 3. Shift swap events
  swaps.slice(0, 3).forEach((s) => {
    events.push({
      id: `swap-${s._id}`,
      type: 'swap',
      title: `${s.requester?.name || 'Staff'} requested shift swap with ${s.targetEmployee?.name || 'Peer'}`,
      description: `Peer: ${s.peerStatus} • Manager: ${s.adminStatus || s.managerStatus || 'pending'}`,
      time: s.createdAt ? new Date(s.createdAt) : new Date(),
      status: s.adminStatus || 'pending',
      icon: Repeat,
      color: 'text-[#8B5CF6]',
      bg: 'bg-[#F5F3FF]'
    });
  });

  // 4. Issue events
  issues.slice(0, 3).forEach((iss) => {
    events.push({
      id: `issue-${iss._id}`,
      type: 'issue',
      title: `Issue Reported: ${iss.title || iss.category || 'Bus Maintenance'}`,
      description: `${iss.description || 'Inspection required'} • Priority: ${iss.priority || 'Medium'}`,
      time: iss.createdAt ? new Date(iss.createdAt) : new Date(),
      status: iss.status,
      icon: AlertTriangle,
      color: 'text-[#F97316]',
      bg: 'bg-[#FFF7ED]'
    });
  });

  // Sort events newest first
  events.sort((a, b) => b.time - a.time);
  const displayEvents = events.slice(0, 8);

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-[#E4E7EC] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#171A1F]">
              Recent Activity Feed
            </h4>
            <p className="text-[10px] text-[#667085]">Live system actions and operational updates</p>
          </div>
        </div>
        <span className="text-[10px] font-mono bg-[#F6F7F4] text-[#667085] px-2 py-0.5 rounded-full border border-[#E4E7EC]">
          {displayEvents.length} Events
        </span>
      </div>

      {displayEvents.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#667085]">
          No recent activity logged yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E7EC]">
          {displayEvents.map((evt) => {
            const Icon = evt.icon;
            return (
              <div key={evt.id} className="relative group">
                {/* Node dot on timeline */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full ${evt.bg} border-2 border-white flex items-center justify-center shadow-sm`}
                >
                  <Icon className={`w-2.5 h-2.5 ${evt.color}`} />
                </div>

                <div className="bg-[#F6F7F4]/60 hover:bg-[#F6F7F4] p-2.5 rounded-xl border border-[#E4E7EC]/60 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <p className="font-bold text-[#171A1F] text-[11px] leading-tight">
                      {evt.title}
                    </p>
                    <span className="text-[10px] text-[#667085] font-mono shrink-0 ml-2">
                      {formatTimeAgo(evt.time)}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#667085] mt-0.5 line-clamp-1">
                    {evt.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
