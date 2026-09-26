import React, { useState } from 'react';
import { X, Calendar, Clock, Loader2, Plus, AlertCircle, Sparkles } from 'lucide-react';

const AddShiftModal = ({
  isOpen,
  onClose,
  onShiftCreated,
  buses = [],
  drivers = [],
  conductors = [],
  routes = []
}) => {
  const [formData, setFormData] = useState({
    bus: '',
    driver: '',
    conductor: '',
    route: '',
    startTime: '08:00 AM',
    endTime: '04:00 PM',
    shiftDate: new Date().toISOString().split('T')[0]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.bus || !formData.driver || !formData.conductor || !formData.route) {
      setError('Please select a Bus, Driver, Conductor, and Route.');
      return;
    }

    setLoading(true);
    try {
      await onShiftCreated(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign shift. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-lg overflow-hidden transform transition-all animate-card-entrance">
        
        {/* Modal Header */}
        <div className="bg-[#171A1F] text-white px-6 py-4 flex items-center justify-between border-b border-[#2A2E36]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#10B981] p-2 rounded-xl text-white shadow-md shadow-[#10B981]/25 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Assign & Schedule Bus Shift</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#667085] hover:text-white p-1 rounded-lg hover:bg-[#20242B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-[#FFF7ED] border border-[#EF4444]/30 text-[#EF4444] p-3 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shift Date */}
          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Shift Date *
            </label>
            <input
              type="date"
              name="shiftDate"
              value={formData.shiftDate}
              onChange={handleChange}
              className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold"
              required
            />
          </div>

          {/* Time Slot Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Departure Time
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="06:00 AM">06:00 AM (Early Morning)</option>
                <option value="08:00 AM">08:00 AM (Morning Peak)</option>
                <option value="10:00 AM">10:00 AM (Midday)</option>
                <option value="02:00 PM">02:00 PM (Afternoon)</option>
                <option value="04:00 PM">04:00 PM (Evening Peak)</option>
                <option value="08:00 PM">08:00 PM (Night Roster)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Arrival / End Time
              </label>
              <select
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="06:00 PM">06:00 PM</option>
                <option value="10:00 PM">10:00 PM</option>
                <option value="12:00 AM">12:00 AM (Midnight)</option>
              </select>
            </div>
          </div>

          {/* Route Selection */}
          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Select Bus Route *
            </label>
            <select
              name="route"
              value={formData.route}
              onChange={handleChange}
              className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
              required
            >
              <option value="">-- Choose Transit Route --</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  Route {r.routeNumber}: {r.source} ➔ {r.destination} ({r.distanceKm || 15} km)
                </option>
              ))}
            </select>
          </div>

          {/* Bus Fleet Assignment */}
          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Assign Bus Fleet *
            </label>
            <select
              name="bus"
              value={formData.bus}
              onChange={handleChange}
              className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
              required
            >
              <option value="">-- Choose Available Bus --</option>
              {buses
                .filter((b) => b.status === 'active' || b.status === 'in_service')
                .map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.busNumber} ({b.registrationNumber}) - Cap: {b.capacity || 45}
                  </option>
                ))}
            </select>
          </div>

          {/* Crew Allocation Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Assign Driver *
              </label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                required
              >
                <option value="">-- Select Driver --</option>
                {drivers
                  .filter((d) => d.status !== 'on_leave' && d.status !== 'inactive')
                  .map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.employeeId})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Assign Conductor *
              </label>
              <select
                name="conductor"
                value={formData.conductor}
                onChange={handleChange}
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium cursor-pointer"
                required
              >
                <option value="">-- Select Conductor --</option>
                {conductors
                  .filter((c) => c.status !== 'on_leave' && c.status !== 'inactive')
                  .map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.employeeId})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-[#E4E7EC] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-5 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                  <span>Scheduling Shift...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Create Shift Duty</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShiftModal;
