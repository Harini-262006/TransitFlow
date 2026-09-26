import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  FileText,
  Lock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Bus,
  Eye,
  EyeOff,
  Ticket,
  ArrowRight,
  Sparkles,
  Navigation,
  MapPin
} from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    role: 'driver'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-[#2A2E36]' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Weak', color: 'bg-[#F97316]' }; // Coral
    if (score <= 4) return { score: 66, label: 'Medium', color: 'bg-[#F59E0B]' }; // Amber
    return { score: 100, label: 'Strong', color: 'bg-[#10B981]' }; // Emerald
  };

  const strength = getPasswordStrength(formData.password);

  const validateForm = () => {
    const { name, email, employeeId, password, confirmPassword } = formData;

    if (!name.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!employeeId.trim()) {
      setError('Please enter your Employee ID');
      return false;
    }

    if (!password) {
      setError('Please enter a password');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isSuccess) return;

    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await signup({
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId,
        password: formData.password,
        role: formData.role
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccess('Account registered successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101316] flex flex-col justify-between font-sans text-[#171A1F] selection:bg-[#10B981] selection:text-white">
      <div className="flex-1 flex flex-col lg:flex-row min-h-screen">
        
        {/* LEFT PANEL - Charcoal & Emerald Transit Hub */}
        <div className="lg:w-1/2 bg-[#171A1F] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A2E36]">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:28px_28px]"></div>

          {/* Brand Header */}
          <div className="relative z-10 flex items-center space-x-3.5 auth-stagger-1">
            <div className="bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] p-3 rounded-2xl shadow-xl shadow-[#10B981]/20 text-white flex items-center justify-center">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white block leading-none">
                Transit<span className="text-[#10B981]">Flow</span>
              </span>
              <span className="text-[11px] text-[#CBD1D7] font-semibold tracking-wider uppercase">
                Personnel Onboarding Console
              </span>
            </div>
          </div>

          <div className="relative z-10 my-8 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#20242B] border border-[#2A2E36] text-[#10B981] text-xs font-semibold backdrop-blur-md auth-stagger-2">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Verified Transport Network Access</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white leading-tight tracking-tight auth-stagger-3">
              Start Managing Smarter Transport Operations
            </h1>

            <p className="text-[#CBD1D7] text-sm sm:text-base leading-relaxed auth-stagger-4">
              Register as a Manager, Driver, or Conductor to immediately access digital rosters, leave submissions with vacancy reassignments, and live trip attendance logs.
            </p>

            {/* Role Features Overview Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2 auth-stagger-5">
              <div className="card-interactive p-3.5 bg-[#20242B] border border-[#8B5CF6]/30 rounded-2xl">
                <UserCheck className="w-5 h-5 text-[#8B5CF6] mb-1.5" />
                <p className="text-xs font-bold text-white">Manager</p>
                <p className="text-[10px] text-[#667085]">Rosters, leave approvals & vacancies</p>
              </div>

              <div className="card-interactive p-3.5 bg-[#20242B] border border-[#10B981]/30 rounded-2xl">
                <Bus className="w-5 h-5 text-[#10B981] mb-1.5" />
                <p className="text-xs font-bold text-white">Driver</p>
                <p className="text-[10px] text-[#667085]">Trips, shifts & attendance</p>
              </div>

              <div className="card-interactive p-3.5 bg-[#20242B] border border-[#F97316]/30 rounded-2xl">
                <Ticket className="w-5 h-5 text-[#F97316] mb-1.5" />
                <p className="text-xs font-bold text-white">Conductor</p>
                <p className="text-[10px] text-[#667085]">Rosters, swaps & ticketing</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-[#667085] flex items-center justify-between border-t border-[#2A2E36] pt-4">
            <span>TransitFlow Enterprise Platform</span>
            <span className="text-[#10B981] font-mono">Verified Mobility</span>
          </div>
        </div>

        {/* RIGHT PANEL - Dark Form Hub with Rotating Gradient Border */}
        <div className="lg:w-1/2 bg-[#101316] p-4 sm:p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="auth-form-container space-y-4 text-white">
            
            {/* Header */}
            <div className="auth-stagger-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#20242B] border border-[#2A2E36] text-[#10B981] text-[10px] font-bold uppercase tracking-wider mb-2">
                <UserCheck className="w-3 h-3 text-[#10B981]" />
                <span>New Personnel Registration</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs text-[#CBD1D7] mt-1 font-medium">
                Join the smart transit workforce and roster management system.
              </p>
            </div>

            {error && (
              <div className="bg-[#7C2D12]/50 border border-[#EF4444]/40 text-[#FCA5A5] p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-[#064E3B]/70 border border-[#10B981]/50 text-[#6EE7B7] p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-success-pop">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              
              {/* Full Name */}
              <div className="auth-input-group auth-stagger-2">
                <label className="auth-label">
                  Full Name
                </label>
                <div className="relative">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className="auth-input pl-10 pr-4"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-input-group auth-stagger-3">
                <label className="auth-label">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. ramesh@shift.com"
                    className="auth-input pl-10 pr-4"
                    required
                  />
                </div>
              </div>

              {/* Employee ID & Role Row */}
              <div className="grid grid-cols-2 gap-3 auth-stagger-4">
                <div className="auth-input-group">
                  <label className="auth-label">
                    Employee ID
                  </label>
                  <div className="relative">
                    <FileText className="auth-input-icon" />
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="DRV105"
                      className="auth-input pl-10 pr-3 uppercase font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">
                    Designated Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="auth-input px-3 font-semibold text-white cursor-pointer"
                  >
                    <option value="driver" className="bg-[#20242B] text-white">Driver</option>
                    <option value="conductor" className="bg-[#20242B] text-white">Conductor</option>
                    <option value="manager" className="bg-[#20242B] text-white">Manager</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group auth-stagger-5">
                <label className="auth-label">
                  Password
                </label>
                <div className="relative">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="auth-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#10B981] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator (Coral -> Amber -> Emerald) */}
                {formData.password && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex justify-between text-[10px] text-[#CBD1D7] font-medium">
                      <span>Password strength:</span>
                      <span className="font-bold text-white">{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#20242B] border border-[#2A2E36] rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.score}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-input-group auth-stagger-5">
                <label className="auth-label">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="auth-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#10B981] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="btn-primary w-full py-3.5 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.96] disabled:opacity-60 mt-3 cursor-pointer auth-stagger-6"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] animate-success-pop" />
                    <span>✓ Account Created! Redirecting...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create {formData.role.toUpperCase()} Account</span>
                    <ArrowRight className="w-4 h-4 text-[#10B981]" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-[#2A2E36] auth-stagger-6">
              <p className="text-xs text-[#CBD1D7]">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-[#10B981] hover:text-[#34D399] transition-colors">
                  Sign In to Portal
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
