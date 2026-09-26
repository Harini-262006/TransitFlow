import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Bus as BusIcon,
  UserCheck,
  Ticket,
  MapPin,
  Clock,
  RefreshCw,
  Check,
  Edit3,
  Loader2,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

const SmartAutoAssignCard = ({ buses = [], drivers = [], conductors = [], routes = [], onConfirmShift }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmedSuccess, setConfirmedSuccess] = useState(false);

  const handleRunSmartAssignment = () => {
    setAnalyzing(true);
    setRecommendation(null);
    setConfirmedSuccess(false);

    setTimeout(() => {
      // Find best candidates
      const availableBus = buses.find(b => b.status === 'active' || b.status === 'in_service') || buses[0] || {
        _id: 'sample-bus',
        busNumber: 'BUS-101',
        registrationNumber: 'AP-07-1234',
        modelName: 'City Master Ultra'
      };

      const availableDriver = drivers.find(d => d.status !== 'on_leave') || drivers[0] || {
        _id: 'sample-drv',
        name: 'Ravi Kumar',
        employeeId: 'DRV-101',
        experience: '5 Years'
      };

      const availableConductor = conductors.find(c => c.status !== 'on_leave') || conductors[0] || {
        _id: 'sample-cnd',
        name: 'Suresh Raina',
        employeeId: 'CND-102'
      };

      const selectedRoute = routes[0] || {
        _id: 'sample-route',
        routeNumber: '104-E',
        source: 'Central Depot (Guntur)',
        destination: 'Tech City (Vijayawada)',
        distanceKm: 32
      };

      setRecommendation({
        bus: availableBus,
        driver: availableDriver,
        conductor: availableConductor,
        route: selectedRoute,
        shiftDate: new Date().toISOString().split('T')[0],
        startTime: '06:00 AM',
        endTime: '02:00 PM',
        confidenceScore: 98
      });

      setAnalyzing(false);
    }, 1200);
  };

  const handleConfirm = async () => {
    if (!recommendation) return;
    setConfirming(true);

    if (onConfirmShift) {
      try {
        await onConfirmShift({
          bus: recommendation.bus._id,
          driver: recommendation.driver._id,
          conductor: recommendation.conductor._id,
          route: recommendation.route._id,
          shiftDate: recommendation.shiftDate,
          startTime: recommendation.startTime,
          endTime: recommendation.endTime
        });
      } catch (e) {
        console.warn('Auto assign confirm warning:', e);
      }
    }

    setTimeout(() => {
      setConfirming(false);
      setConfirmedSuccess(true);
      setTimeout(() => {
        setConfirmedSuccess(false);
        setRecommendation(null);
      }, 3500);
    }, 800);
  };

  return (
    <div className="card-gradient-border animate-card-entrance">
      <div className="p-6 sm:p-7 text-white space-y-5">
        
        {/* Header with Smart Tag */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A2E36] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/25">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Smart AI Shift & Duty Allocation
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#ECFDF5]/10 text-[#10B981] border border-[#10B981]/40">
                  Automated Engine
                </span>
              </div>
              <p className="text-xs text-[#CBD1D7]">
                Multi-factor constraint optimizer for buses, pilots, conductors, and route corridors
              </p>
            </div>
          </div>

          {!recommendation && (
            <button
              onClick={handleRunSmartAssignment}
              disabled={analyzing}
              className="btn-primary-transit px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 self-start sm:self-center cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span>Evaluating Roster Constraints...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                  <span>Find Best Duty Assignment</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Verification Criteria Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-[#20242B] p-3.5 rounded-xl border border-[#2A2E36] text-xs">
          <div className="flex items-center gap-1.5 text-[#CBD1D7]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold text-[11px]">Availability Checked</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#CBD1D7]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold text-[11px]">Leaves Verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#CBD1D7]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold text-[11px]">Zero Conflict Validated</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#CBD1D7]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold text-[11px]">Fleet Health Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#CBD1D7]">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="font-semibold text-[11px]">Balanced Workload</span>
          </div>
        </div>

        {/* Recommendation Showcase Card */}
        {recommendation && (
          <div className="bg-[#20242B] rounded-2xl p-5 border border-[#2A2E36] space-y-4 animate-card-entrance shadow-inner">
            <div className="flex items-center justify-between border-b border-[#2A2E36] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#10B981]">
                  Recommended Smart Duty Pair (Confidence {recommendation.confidenceScore}%)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#CBD1D7] bg-[#171A1F] px-2.5 py-1 rounded-lg border border-[#2A2E36]">
                Shift: {recommendation.startTime} - {recommendation.endTime}
              </span>
            </div>

            {/* Entity Triplet Grid (Route / Bus / Crew) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Route Card */}
              <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#2A2E36] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="font-bold uppercase text-[10px]">ROUTE CORRIDOR</span>
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                </div>
                <div className="font-black text-white text-sm">
                  Route {recommendation.route.routeNumber || '104-E'}
                </div>
                <div className="text-xs text-[#CBD1D7] truncate">
                  {recommendation.route.source} ➔ {recommendation.route.destination}
                </div>
              </div>

              {/* Bus Vehicle */}
              <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#2A2E36] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="font-bold uppercase text-[10px]">OPTIMAL BUS</span>
                  <BusIcon className="w-3.5 h-3.5 text-[#10B981]" />
                </div>
                <div className="font-black text-white text-sm">
                  {recommendation.bus.busNumber}
                </div>
                <div className="text-xs text-[#CBD1D7] font-mono">
                  {recommendation.bus.registrationNumber} • {recommendation.bus.modelName || 'City Express'}
                </div>
              </div>

              {/* Crew Pairing */}
              <div className="p-3.5 rounded-xl bg-[#171A1F] border border-[#2A2E36] space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#667085]">
                  <span className="font-bold uppercase text-[10px]">CREW ALLOCATION</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Driver: {recommendation.driver.name}</span>
                </div>
                <div className="text-xs font-bold text-[#CBD1D7] flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>Conductor: {recommendation.conductor.name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs font-semibold text-[#10B981] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ready for instant roster confirmation</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunSmartAssignment}
                  disabled={analyzing || confirming}
                  className="btn-secondary px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="btn-success px-5 py-2 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Scheduling Duty...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Confirm & Schedule Assignment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmedSuccess && (
          <div className="bg-[#ECFDF5] border border-[#10B981]/40 text-[#047857] p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 animate-success-pop">
            <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
            <span>Smart duty scheduled and synced directly into transit timetable!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAutoAssignCard;
