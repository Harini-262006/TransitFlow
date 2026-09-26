import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Bus,
  MapPin,
  UserCheck,
  Ticket,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';

const CalendarScheduleView = ({ shifts = [], onSelectShift, onResolveConflict }) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');

  // Generate 7 days starting from today + offset
  const today = new Date();
  const currentDate = new Date(today);
  currentDate.setDate(today.getDate() + selectedDayOffset);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Week days array
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentDate);
    const dayOfWeek = d.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7; // Monday start
    d.setDate(d.getDate() - distanceToMonday + i);
    return d;
  });

  const [activeDate, setActiveDate] = useState(today.toISOString().split('T')[0]);

  // Filter shifts by active selected date
  const shiftsForDate = shifts.filter((s) => {
    const shiftDateStr = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
    const matchesDate = shiftDateStr === activeDate;
    if (!matchesDate) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'conflict') return s.hasConflict || s.status === 'conflict';
    return s.status === statusFilter;
  });

  const getStatusBadge = (shift) => {
    if (shift.hasConflict || shift.status === 'conflict') {
      return (
        <span className="inline-flex items-center gap-1 bg-[#FEF2F2] text-[#EF4444] border border-[#EF4444]/30 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
          <AlertTriangle className="w-3 h-3 text-[#EF4444]" /> Conflict Detected
        </span>
      );
    }
    switch (shift.status?.toLowerCase()) {
      case 'in-progress':
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" /> Active Now
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-[#F5F3FF] text-[#8B5CF6] border border-[#8B5CF6]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3 text-[#8B5CF6]" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-[#FFF7ED] text-[#EA580C] border border-[#F97316]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
            <Clock className="w-3 h-3 text-[#10B981]" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="card-base overflow-hidden animate-card-entrance">
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 bg-[#171A1F] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#20242B] border border-[#2A2E36] flex items-center justify-center text-[#10B981]">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <p className="text-[11px] text-[#CBD1D7]">Weekly Duty Timetable & Shift Timeline</p>
          </div>
        </div>

        {/* Date Navigator & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-[#20242B] border border-[#2A2E36] rounded-xl p-1">
            <button
              onClick={() => setSelectedDayOffset((prev) => prev - 7)}
              className="p-1.5 hover:bg-[#2A2E36] text-[#CBD1D7] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedDayOffset(0);
                setActiveDate(today.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1 text-[11px] font-bold text-[#10B981] hover:text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDayOffset((prev) => prev + 7)}
              className="p-1.5 hover:bg-[#2A2E36] text-[#CBD1D7] hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#20242B] text-white border border-[#2A2E36] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#10B981] cursor-pointer"
          >
            <option value="all">All Shift Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
            <option value="conflict">Conflicts Only</option>
          </select>
        </div>
      </div>

      {/* Week Days Strip */}
      <div className="grid grid-cols-7 border-b border-[#E4E7EC] bg-[#F6F7F4]">
        {weekDays.map((d) => {
          const dateStr = d.toISOString().split('T')[0];
          const isSelected = dateStr === activeDate;
          const isToday = dateStr === today.toISOString().split('T')[0];

          // Count shifts on this day
          const dayShiftsCount = shifts.filter((s) => {
            const sd = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
            return sd === dateStr;
          }).length;

          const dayConflictCount = shifts.filter((s) => {
            const sd = s.date ? new Date(s.date).toISOString().split('T')[0] : '';
            return sd === dateStr && (s.hasConflict || s.status === 'conflict');
          }).length;

          return (
            <button
              key={dateStr}
              onClick={() => setActiveDate(dateStr)}
              className={`p-3 text-center transition-all border-r last:border-r-0 border-[#E4E7EC] cursor-pointer relative ${
                isSelected
                  ? 'bg-white shadow-sm font-bold border-b-2 border-b-[#10B981]'
                  : 'hover:bg-white/60'
              }`}
            >
              <p className="text-[11px] font-semibold text-[#667085] uppercase">
                {daysOfWeek[d.getDay()]}
              </p>
              <p
                className={`text-sm sm:text-base font-black my-0.5 ${
                  isToday ? 'text-[#10B981]' : 'text-[#171A1F]'
                }`}
              >
                {d.getDate()}
              </p>
              <div className="flex items-center justify-center gap-1">
                {dayShiftsCount > 0 && (
                  <span className="text-[10px] font-mono bg-[#E4E7EC] text-[#171A1F] px-1.5 py-0.2 rounded-full">
                    {dayShiftsCount}
                  </span>
                )}
                {dayConflictCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Shifts Schedule Grid for Selected Day */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-[#171A1F] uppercase tracking-wider flex items-center gap-2">
            <span>Rosters for {new Date(activeDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className="text-[10px] bg-[#ECFDF5] text-[#047857] px-2 py-0.5 rounded-full font-mono font-bold">
              {shiftsForDate.length} Shifts Assigned
            </span>
          </h4>
        </div>

        {shiftsForDate.length === 0 ? (
          <div className="text-center py-12 bg-[#F6F7F4]/50 border border-dashed border-[#E4E7EC] rounded-2xl">
            <CalendarIcon className="w-10 h-10 text-[#CBD1D7] mx-auto mb-2" />
            <p className="text-xs font-bold text-[#171A1F]">No shifts scheduled for this day</p>
            <p className="text-[11px] text-[#667085] mt-0.5">Click on another date or schedule new duties from the shift management tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shiftsForDate.map((shift) => {
              const hasConflict = shift.hasConflict || shift.status === 'conflict';
              return (
                <div
                  key={shift._id}
                  className={`p-4 rounded-2xl card-shift ${
                    hasConflict
                      ? 'bg-[#FEF2F2]/60 border-[#EF4444]/40 shadow-sm'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#20242B] flex items-center justify-center text-[#10B981] shrink-0">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#171A1F]">
                          Bus #{shift.bus?.busNumber || 'N/A'}
                        </p>
                        <p className="text-[10px] text-[#667085] font-mono">
                          {shift.shiftType ? `${shift.shiftType.toUpperCase()} SHIFT` : 'STANDARD DUTY'}
                        </p>
                      </div>
                    </div>
                    <div>{getStatusBadge(shift)}</div>
                  </div>

                  {/* Route & Timing */}
                  <div className="bg-[#F6F7F4] p-2.5 rounded-xl space-y-1.5 text-xs text-[#171A1F] mb-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                      <Clock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                      <span className="font-mono font-bold text-[#171A1F]">
                        {shift.startTime || '06:00'} - {shift.endTime || '14:00'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#667085]">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                      <span className="truncate font-medium">
                        {shift.route?.name || shift.route?.routeNumber || 'Transit Route 101'}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Crew Pair */}
                  <div className="space-y-1 text-xs border-t border-[#E4E7EC] pt-2 mb-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#667085] flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-[#10B981]" /> Driver:
                      </span>
                      <span className="font-bold text-[#171A1F]">
                        {shift.driver?.name || shift.driver?.user?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#667085] flex items-center gap-1">
                        <Ticket className="w-3 h-3 text-[#F97316]" /> Conductor:
                      </span>
                      <span className="font-bold text-[#171A1F]">
                        {shift.conductor?.name || shift.conductor?.user?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Action or Conflict Resolution */}
                  {hasConflict && onResolveConflict && (
                    <button
                      onClick={() => onResolveConflict(shift)}
                      className="btn-danger w-full py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Find Replacement Now</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarScheduleView;
