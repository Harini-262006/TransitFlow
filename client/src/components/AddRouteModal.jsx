import React, { useState } from 'react';
import { X, MapPin, Loader2, Plus, AlertCircle } from 'lucide-react';

const AddRouteModal = ({ isOpen, onClose, onRouteAdded }) => {
  const [formData, setFormData] = useState({
    routeNumber: '',
    source: '',
    destination: '',
    distanceKm: 15,
    estimatedDurationMins: 30,
    stops: ''
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

    if (!formData.routeNumber.trim() || !formData.source.trim() || !formData.destination.trim()) {
      setError('Please fill in Route Number, Source, and Destination.');
      return;
    }

    setLoading(true);
    try {
      const stopsArray = formData.stops
        ? formData.stops.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await onRouteAdded({
        routeNumber: formData.routeNumber,
        source: formData.source,
        destination: formData.destination,
        distanceKm: Number(formData.distanceKm),
        estimatedDurationMins: Number(formData.estimatedDurationMins),
        stops: stopsArray
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl border border-[#E4E7EC] w-full max-w-md overflow-hidden transform transition-all animate-card-entrance">
        
        {/* Modal Header */}
        <div className="bg-[#171A1F] text-white px-6 py-4 flex items-center justify-between border-b border-[#2A2E36]">
          <div className="flex items-center space-x-2.5">
            <div className="bg-[#10B981] p-2 rounded-xl text-white shadow-md shadow-[#10B981]/25 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Create Transit Route</h3>
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

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Route Number / Identifier *
            </label>
            <input
              type="text"
              name="routeNumber"
              value={formData.routeNumber}
              onChange={handleChange}
              placeholder="e.g. 104-E"
              className="input-transit w-full p-2.5 rounded-xl text-xs uppercase font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Source Depot *
              </label>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g. Central Station"
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Destination *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g. Tech Corridor Bay 4"
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                name="distanceKm"
                value={formData.distanceKm}
                onChange={handleChange}
                min="1"
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Est. Duration (Mins)
              </label>
              <input
                type="number"
                name="estimatedDurationMins"
                value={formData.estimatedDurationMins}
                onChange={handleChange}
                min="5"
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Intermediate Geo-Stops (Comma Separated)
            </label>
            <input
              type="text"
              name="stops"
              value={formData.stops}
              onChange={handleChange}
              placeholder="e.g. Metro Gate, North Plaza, University"
              className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
            />
          </div>

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
                  <span>Saving Route...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Save Route Corridor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRouteModal;
