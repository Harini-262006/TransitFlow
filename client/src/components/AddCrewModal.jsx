import React, { useState } from 'react';
import { X, UserPlus, Loader2, Plus, AlertCircle, Bus, Ticket } from 'lucide-react';

const AddCrewModal = ({ isOpen, onClose, onCrewAdded }) => {
  const [crewType, setCrewType] = useState('driver'); // 'driver' | 'conductor'
  const [formData, setFormData] = useState({
    name: '',
    identifier: '', // licenseNumber or employeeId
    phone: ''
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

    if (!formData.name.trim() || !formData.identifier.trim() || !formData.phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      if (crewType === 'driver') {
        await onCrewAdded('driver', {
          name: formData.name,
          licenseNumber: formData.identifier,
          phone: formData.phone,
          status: 'available'
        });
      } else {
        await onCrewAdded('conductor', {
          name: formData.name,
          employeeId: formData.identifier,
          phone: formData.phone,
          status: 'available'
        });
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add crew member.');
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
              <UserPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white">Enroll Transit Personnel</h3>
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

          {/* Role Pill Switcher */}
          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1.5">
              Personnel Category
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F6F7F4] border border-[#E4E7EC] rounded-xl">
              <button
                type="button"
                onClick={() => setCrewType('driver')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  crewType === 'driver'
                    ? 'bg-[#10B981] text-white shadow-sm'
                    : 'text-[#667085] hover:text-[#171A1F]'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>Bus Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setCrewType('conductor')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  crewType === 'conductor'
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-[#667085] hover:text-[#171A1F]'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Conductor</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Suresh Raina"
              className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              {crewType === 'driver' ? 'Driver License Number *' : 'Employee ID *'}
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder={crewType === 'driver' ? 'e.g. DL-KA-2022-9876' : 'e.g. CND-105'}
              className="input-transit w-full p-2.5 rounded-xl text-xs uppercase font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A1F] uppercase tracking-wider mb-1">
              Contact Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 98765 00101"
              className="input-transit w-full p-2.5 rounded-xl text-xs font-medium"
              required
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <span>Register {crewType === 'driver' ? 'Driver' : 'Conductor'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrewModal;
