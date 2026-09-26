import React, { useState } from 'react';
import { X, Bus as BusIcon, Loader2, Plus, AlertCircle } from 'lucide-react';

const AddBusModal = ({ isOpen, onClose, onBusAdded }) => {
  const [formData, setFormData] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 45,
    modelName: '',
    status: 'active'
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

    if (!formData.busNumber.trim() || !formData.registrationNumber.trim()) {
      setError('Please provide Bus Number and Registration Number.');
      return;
    }

    setLoading(true);
    try {
      await onBusAdded(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bus. Please try again.');
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
              <BusIcon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Add New Bus to Fleet</h3>
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
              Bus Code / Identifier *
            </label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              placeholder="e.g. BUS-108"
              className="input-transit w-full p-2.5 rounded-xl text-xs uppercase font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Vehicle Registration Number *
            </label>
            <input
              type="text"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="e.g. KA-01-F-7890"
              className="input-transit w-full p-2.5 rounded-xl text-xs uppercase font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="10"
                max="90"
                className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
                Fleet Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-transit w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <option value="active">Active (In Service)</option>
                <option value="maintenance">In Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Make / Model Name
            </label>
            <input
              type="text"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              placeholder="e.g. Tata Marcopolo Ultra"
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
                  <span>Adding Bus...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Save Bus to Fleet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusModal;
