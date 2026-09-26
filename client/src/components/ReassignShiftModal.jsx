import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  User,
  Loader2,
  Sparkles,
  AlertCircle,
  Clock,
  Bus as BusIcon,
  MapPin,
  ShieldCheck,
  Check,
  ArrowDown,
  UserCheck
} from 'lucide-react';
import { shiftAPI, driverAPI, conductorAPI, leaveAPI } from '../services/api';

const ReassignShiftModal = ({ isOpen, onClose, leaveId, onApproved, onRejected }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaveData, setLeaveData] = useState(null);
  const [affectedShifts, setAffectedShifts] = useState([]);
  const [crewType, setCrewType] = useState('driver'); // 'driver' | 'conductor'
  const [crewMap, setCrewMap] = useState({}); // shiftId -> available crew array
  const [selectedReplacements, setSelectedReplacements] = useState({}); // shiftId -> selected replacement crew id
  const [managerRemarks, setManagerRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && leaveId) {
      fetchLeaveConflictData();
    }
  }, [isOpen, leaveId]);

  const fetchLeaveConflictData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await shiftAPI.getAffectedByLeave(leaveId);
      const leave = res.data.leave;
      const shifts = res.data.data || [];
      const type = res.data.crewType || (leave?.applicant?.role === 'conductor' ? 'conductor' : 'driver');

      setLeaveData(leave);
      setAffectedShifts(shifts);
      setCrewType(type);

      // For each affected shift, fetch evaluated available replacement crew
      const map = {};
      const initialSelections = {};

      for (const shift of shifts) {
        let evalCrew = [];
        if (type === 'conductor') {
          const cndRes = await conductorAPI.getAvailableForShift(shift._id);
          evalCrew = cndRes.data.data || [];
        } else {
          const drvRes = await driverAPI.getAvailableForShift(shift._id);
          evalCrew = drvRes.data.data || [];
        }

        map[shift._id] = evalCrew;

        // Auto-select first recommended available crew if any
        const recommended = evalCrew.find((c) => c.isAvailable && c.isRecommended) || evalCrew.find((c) => c.isAvailable);
        if (recommended) {
          initialSelections[shift._id] = recommended.id;
        }
      }

      setCrewMap(map);
      setSelectedReplacements(initialSelections);
    } catch (err) {
      console.error('Failed to load leave conflict data:', err);
      setError('Unable to fetch shift conflicts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !leaveId) return null;

  const handleReplacementChange = (shiftId, crewId) => {
    setSelectedReplacements((prev) => ({ ...prev, [shiftId]: crewId }));
  };

  const handleConfirmApprove = async () => {
    setError('');

    // Prepare reassignments array
    const reassignments = affectedShifts.map((shift) => ({
      shiftId: shift._id,
      replacementCrewId: selectedReplacements[shift._id],
      replacementDriverId: crewType === 'driver' ? selectedReplacements[shift._id] : undefined,
      replacementConductorId: crewType === 'conductor' ? selectedReplacements[shift._id] : undefined
    }));

    // Verify replacement selections
    if (affectedShifts.length > 0) {
      for (const shift of affectedShifts) {
        const sel = selectedReplacements[shift._id];
        if (sel) {
          const evalList = crewMap[shift._id] || [];
          const chosen = evalList.find((c) => c.id === sel);
          if (chosen && !chosen.isAvailable) {
            setError(`Selected ${crewType} '${chosen.name}' is unavailable on ${new Date(shift.shiftDate).toLocaleDateString()} (${chosen.validationReason})`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await leaveAPI.approveWithReassignments(leaveId, {
        reassignments,
        managerRemarks: managerRemarks.trim() || 'Leave approved by Manager'
      });
      if (onApproved) onApproved(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const applicantRole = leaveData?.applicant?.role || leaveData?.employeeRole || crewType;
  const isDriver = applicantRole === 'driver';
  const roleLabel = isDriver ? 'Driver' : 'Conductor';
  const fromDateStr = new Date(leaveData?.fromDate || leaveData?.startDate).toLocaleDateString();
  const toDateStr = new Date(leaveData?.toDate || leaveData?.endDate).toLocaleDateString();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-2xl overflow-hidden transform transition-all my-8 animate-card-entrance">
        
        {/* Modal Header */}
        <div className="bg-[#171A1F] text-white px-6 py-5 flex items-center justify-between border-b border-[#2A2E36]">
          <div className="flex items-center space-x-3">
            <div className="bg-[#10B981] p-2.5 rounded-xl text-white shadow-md shadow-[#10B981]/25 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Leave Approval & Vacancy Resolution Console
              </h3>
              <p className="text-xs text-[#667085]">
                Evaluate shift schedules & allocate replacement personnel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-white p-1.5 rounded-xl hover:bg-[#20242B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="bg-[#FFF7ED] border-l-4 border-[#EF4444] p-4 rounded-xl flex items-start space-x-3 text-[#EF4444] text-xs font-semibold animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-[#667085] space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#10B981]" />
              <p className="text-xs font-bold text-[#171A1F]">Checking shift rosters & evaluating available replacements...</p>
            </div>
          ) : (
            <>
              {/* Applicant Summary Card */}
              <div className="bg-[#F6F7F4] rounded-2xl p-4 border border-[#E4E7EC] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E7EC]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isDriver ? 'bg-[#ECFDF5] text-[#047857] border border-[#10B981]/30' : 'bg-[#FFF7ED] text-[#C2410C] border border-[#F97316]/30'
                      }`}>
                        {roleLabel}
                      </span>
                      <span className="text-xs text-[#667085] font-mono">ID: {leaveData?.employeeId || leaveData?.applicant?.employeeId}</span>
                    </div>
                    <h4 className="text-base font-black text-[#171A1F] mt-0.5">
                      {leaveData?.employeeName || leaveData?.applicant?.name}
                    </h4>
                  </div>
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30 self-start sm:self-center">
                    {leaveData?.leaveType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#667085] font-bold uppercase block text-[10px]">Leave Dates</span>
                    <span className="font-extrabold text-[#171A1F] text-sm">
                      {fromDateStr} ➔ {toDateStr}
                    </span>
                    <span className="text-[#10B981] font-bold block text-xs mt-0.5">
                      ({leaveData?.numberOfDays || 1} day{(leaveData?.numberOfDays || 1) > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#667085] font-bold uppercase block text-[10px]">Submitted Reason</span>
                    <span className="text-[#171A1F] font-medium italic">"{leaveData?.reason}"</span>
                    {leaveData?.remarks && (
                      <p className="text-[11px] text-[#667085] mt-1">Remarks: {leaveData.remarks}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conflict Status Banner */}
              {affectedShifts.length > 0 ? (
                <div className="bg-[#FFF7ED] border-l-4 border-[#F97316] p-4 rounded-xl flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#F97316] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-[#9A3412] text-xs">
                      Shift Vacancy Detected: {affectedShifts.length} Assigned Shift(s) Need Reassignment!
                    </div>
                    <div className="text-[11px] text-[#C2410C] mt-0.5">
                      This {roleLabel.toLowerCase()} has scheduled shifts during the leave period. Select replacement {roleLabel.toLowerCase()}s below to prevent service disruption.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#ECFDF5] border-l-4 border-[#10B981] p-4 rounded-xl flex items-start space-x-3 text-[#065F46] text-xs font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Zero Shift Conflicts:</span> No active shifts are scheduled for this {roleLabel.toLowerCase()} during the requested period. Ready for instant approval!
                  </div>
                </div>
              )}

              {/* Affected Shifts Reassignment Cards */}
              {affectedShifts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase text-[#667085] tracking-wider">
                      Affected Shifts & Replacement Selection ({affectedShifts.length})
                    </h4>
                  </div>

                  {affectedShifts.map((shift, idx) => {
                    const evalList = crewMap[shift._id] || [];
                    const selectedId = selectedReplacements[shift._id] || '';
                    const chosenCrew = evalList.find(c => c.id === selectedId);

                    return (
                      <div
                        key={shift._id}
                        className="p-4 rounded-2xl border border-[#E4E7EC] bg-[#FFFFFF] shadow-sm space-y-3 card-hover-lift"
                      >
                        <div className="flex items-center justify-between border-b border-[#E4E7EC] pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-black text-[#171A1F]">
                              {new Date(shift.shiftDate).toLocaleDateString()} • {shift.startTime} - {shift.endTime}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                            <BusIcon className="w-3.5 h-3.5" /> Bus {shift.bus?.busNumber}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#667085]">
                          <div>
                            <span className="text-[#667085] font-bold block text-[10px]">ROUTE</span>
                            <span className="font-semibold text-[#171A1F]">
                              Route {shift.route?.routeNumber}: {shift.route?.source} ➔ {shift.route?.destination}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#667085] font-bold block text-[10px]">CO-CREW ASSIGNED</span>
                            <span className="text-[#171A1F]">
                              {isDriver ? `Conductor: ${shift.conductor?.name || 'N/A'}` : `Driver: ${shift.driver?.name || 'N/A'}`}
                            </span>
                          </div>
                        </div>

                        {/* Transition Indicator (Original -> Replacement) */}
                        <div className="bg-[#F6F7F4] p-2.5 rounded-xl border border-[#E4E7EC] flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#667085] block">Original {roleLabel}</span>
                            <span className="font-semibold text-[#EF4444] line-through">{leaveData?.employeeName || 'Assigned Staff'}</span>
                          </div>
                          <ArrowDown className="w-4 h-4 text-[#10B981] rotate-[-90deg]" />
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#667085] block">Replacement Status</span>
                            <span className={`font-bold ${chosenCrew ? 'text-[#10B981]' : 'text-[#F97316]'}`}>
                              {chosenCrew ? `✓ ${chosenCrew.name}` : 'Pending Selection'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                            Select Replacement {roleLabel}:
                          </label>
                          <select
                            value={selectedId}
                            onChange={(e) => handleReplacementChange(shift._id, e.target.value)}
                            className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                          >
                            <option value="">-- Choose Replacement {roleLabel} --</option>
                            {evalList.map((c) => (
                              <option
                                key={c.id}
                                value={c.id}
                                disabled={!c.isAvailable}
                                className={!c.isAvailable ? 'text-[#EF4444] bg-[#F6F7F4]' : 'font-semibold text-[#171A1F]'}
                              >
                                {c.name} ({c.employeeId}) - {c.validationReason} {c.isRecommended ? '★ Recommended' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Manager Remarks */}
              <div>
                <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                  Manager Approval Remarks
                </label>
                <input
                  type="text"
                  value={managerRemarks}
                  onChange={(e) => setManagerRemarks(e.target.value)}
                  placeholder="e.g. Leave approved. Shifts reassigned to replacement crew."
                  className="input-transit w-full p-2.5 rounded-xl text-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-[#F6F7F4] px-6 py-4 border-t border-[#E4E7EC] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmApprove}
            disabled={submitting || loading}
            className="btn-success px-5 py-2.5 text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processing Approval...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Confirm & Approve Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignShiftModal;
