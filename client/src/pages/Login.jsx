import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Bus,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Ticket,
  Shield,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Navigation,
  Compass
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, getRoleDashboardPath } = useAuth();

  const [formData, setFormData] = useState({
    email: 'manager@shift.com',
    password: 'Manager@123',
    rememberMe: false
  });

  const [selectedRoleTab, setSelectedRoleTab] = useState('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const demoAccounts = {
    manager: {
      email: 'manager@shift.com',
      password: 'Manager@123',
      label: 'Manager',
      roleDesc: 'Full depot supervision, shift scheduling & leave approvals',
      color: 'purple',
      badgeBg: 'bg-[#2D1B4E]/60',
      badgeText: 'text-[#C4B5FD]',
      badgeBorder: 'border-[#8B5CF6]/40',
      activeTab: 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/30 border-transparent',
      inactiveTab: 'text-[#CBD1D7] hover:text-white hover:bg-[#2A2E36] border-transparent'
    },
    driver: {
      email: 'driver@shift.com',
      password: 'Driver@123',
      label: 'Driver',
      roleDesc: 'Daily shift roster, check-in/out & leave requests',
      color: 'emerald',
      badgeBg: 'bg-[#064E3B]/60',
      badgeText: 'text-[#6EE7B7]',
      badgeBorder: 'border-[#10B981]/40',
      activeTab: 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/30 border-transparent',
      inactiveTab: 'text-[#CBD1D7] hover:text-white hover:bg-[#2A2E36] border-transparent'
    },
    conductor: {
      email: 'conductor@shift.com',
      password: 'Conductor@123',
      label: 'Conductor',
      roleDesc: 'Roster view, daily attendance & shift swap management',
      color: 'coral',
      badgeBg: 'bg-[#7C2D12]/60',
      badgeText: 'text-[#FDBA74]',
      badgeBorder: 'border-[#F97316]/40',
      activeTab: 'bg-[#F97316] text-white shadow-lg shadow-[#F97316]/30 border-transparent',
      inactiveTab: 'text-[#CBD1D7] hover:text-white hover:bg-[#2A2E36] border-transparent'
    }
  };

  const handleRoleTabClick = (roleKey) => {
    setSelectedRoleTab(roleKey);
    setFormData({
      email: demoAccounts[roleKey].email,
      password: demoAccounts[roleKey].password,
      rememberMe: false
    });
    setError('');
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isSuccess) return;
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = await login(formData.email, formData.password, formData.rememberMe);

      if (res.success) {
        setIsSuccess(true);
        const targetPath = getRoleDashboardPath(res.user?.role);
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 500);
      } else {
        setError(res.message || 'Invalid email or password');
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
        
        {/* LEFT SECTION - Premium Transit Visual Hub (Deep Charcoal & Emerald) */}
        <div className="lg:w-1/2 bg-[#171A1F] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2A2E36]">
          
          {/* Subtle Ambient Glowing Mesh */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2.5s' }}></div>

          {/* Minimal Background Grid */}
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
                Smart Transport Workforce Management
              </span>
            </div>
          </div>

          {/* Transportation Graphic & Interactive Route Line */}
          <div className="relative z-10 my-8 space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#20242B] border border-[#2A2E36] text-[#10B981] text-xs font-semibold backdrop-blur-md auth-stagger-2">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Next-Gen Mobility & Automated Roster Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-white leading-tight tracking-tight auth-stagger-3">
              Intelligent Transit Roster & Crew Operations
            </h1>

            <p className="text-[#CBD1D7] text-sm sm:text-base leading-relaxed font-normal auth-stagger-4">
              Manage daily duty rotations, dynamic leave vacancy detection, smart replacement allocation, and verified digital attendance across all depot terminals.
            </p>

            {/* Visual Route Corridor Illustration (Emerald & Coral) */}
            <div className="relative bg-[#20242B]/90 backdrop-blur-md rounded-2xl p-5 border border-[#2A2E36] overflow-hidden shadow-xl auth-stagger-5">
              <div className="flex items-center justify-between text-xs font-bold text-[#CBD1D7] mb-3">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <Navigation className="w-3.5 h-3.5" /> Active Route Corridor 104
                </span>
                <span className="text-[#F97316] flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> Real-Time Node Sync
                </span>
              </div>

              {/* Transit Route SVG */}
              <svg className="w-full h-12 overflow-visible" viewBox="0 0 340 40" fill="none">
                <path
                  d="M 15 20 Q 90 5, 170 20 T 325 20"
                  stroke="#2A2E36"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 15 20 Q 90 5, 170 20 T 325 20"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-route-dash"
                />
                {/* Node Points: Coral, Amber, Emerald */}
                <circle cx="15" cy="20" r="5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="170" cy="20" r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="325" cy="20" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              </svg>

              <div className="flex justify-between items-center text-[10px] font-mono text-[#667085] mt-1">
                <span>Depot Central</span>
                <span>Interchange Junction</span>
                <span>Terminal Bay 4</span>
              </div>
            </div>

            {/* Floating Metric Highlights */}
            <div className="grid grid-cols-3 gap-3 auth-stagger-6">
              <div className="card-interactive bg-[#20242B] p-3.5 rounded-2xl border border-[#2A2E36] shadow-lg animate-float">
                <div className="flex items-center space-x-1.5 text-[#10B981] mb-1">
                  <Bus className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Fleet</span>
                </div>
                <div className="text-xl font-black text-white">24 Buses</div>
                <div className="text-[11px] text-[#667085]">Active Fleet</div>
              </div>

              <div className="card-interactive bg-[#20242B] p-3.5 rounded-2xl border border-[#2A2E36] shadow-lg animate-float-delayed">
                <div className="flex items-center space-x-1.5 text-[#8B5CF6] mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Crew</span>
                </div>
                <div className="text-xl font-black text-white">86 Staff</div>
                <div className="text-[11px] text-[#667085]">Drivers & Conductors</div>
              </div>

              <div className="card-interactive bg-[#20242B] p-3.5 rounded-2xl border border-[#2A2E36] shadow-lg animate-float">
                <div className="flex items-center space-x-1.5 text-[#F97316] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Rosters</span>
                </div>
                <div className="text-xl font-black text-white">100% On-Time</div>
                <div className="text-[11px] text-[#667085]">Shift Coverage</div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 text-xs text-[#667085] flex items-center justify-between border-t border-[#2A2E36] pt-4">
            <span>TransitFlow Enterprise Platform</span>
            <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              Atlas Connected
            </span>
          </div>
        </div>

        {/* RIGHT SECTION - Dark Form Hub with Rotating Gradient Border & Smooth Focus */}
        <div className="lg:w-1/2 bg-[#101316] p-4 sm:p-8 lg:p-12 flex items-center justify-center relative overflow-hidden">
          
          {/* Subtle background ambient light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="auth-form-container space-y-5 text-white">
            
            {/* Header */}
            <div className="auth-stagger-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#20242B] border border-[#2A2E36] text-[#10B981] text-[10px] font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3 h-3 text-[#10B981]" />
                <span>Authorized Staff Sign-In</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-[#CBD1D7] mt-1 font-medium">
                Manage your depot routes, shifts, and attendance.
              </p>
            </div>

            {/* 3 Role Selector Tabs (Manager, Driver, Conductor) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#20242B] border border-[#2A2E36] rounded-2xl auth-stagger-2">
              <button
                type="button"
                onClick={() => handleRoleTabClick('manager')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  selectedRoleTab === 'manager'
                    ? demoAccounts.manager.activeTab
                    : demoAccounts.manager.inactiveTab
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('driver')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  selectedRoleTab === 'driver'
                    ? demoAccounts.driver.activeTab
                    : demoAccounts.driver.inactiveTab
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Driver</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabClick('conductor')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                  selectedRoleTab === 'conductor'
                    ? demoAccounts.conductor.activeTab
                    : demoAccounts.conductor.inactiveTab
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Conductor</span>
              </button>
            </div>

            {/* Role Context Pill */}
            <div className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between auth-stagger-3 ${demoAccounts[selectedRoleTab].badgeBg} ${demoAccounts[selectedRoleTab].badgeBorder} ${demoAccounts[selectedRoleTab].badgeText}`}>
              <span className="leading-snug">{demoAccounts[selectedRoleTab].roleDesc}</span>
            </div>

            {/* Error Message with Shake Animation */}
            {error && (
              <div className="bg-[#7C2D12]/50 border border-[#EF4444]/40 text-[#FCA5A5] p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Email Address */}
              <div className="auth-input-group auth-stagger-4">
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
                    placeholder="e.g. manager@shift.com"
                    className={`auth-input pl-10 pr-4 ${error && !formData.email ? 'auth-input-error' : ''}`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-input-group auth-stagger-5">
                <div className="flex items-center justify-between mb-1">
                  <label className="auth-label mb-0">
                    Password
                  </label>
                  <span className="text-[10px] text-[#667085] font-mono">Demo: {demoAccounts[selectedRoleTab].password}</span>
                </div>
                <div className="relative">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`auth-input pl-10 pr-10 ${error && !formData.password ? 'auth-input-error' : ''}`}
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
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-0.5 auth-stagger-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#CBD1D7] select-none hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 accent-[#10B981] bg-[#20242B] border-[#2A2E36] rounded focus:ring-[#10B981] cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button (Charcoal -> Emerald Gradient with Shimmer & Hover Lift) */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="btn-primary w-full py-3.5 text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.96] disabled:opacity-60 mt-2 cursor-pointer auth-stagger-6"
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] animate-success-pop" />
                    <span className="text-white font-extrabold">✓ Authenticated! Loading Portal...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
                    <span>Signing in as {demoAccounts[selectedRoleTab].label}...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {demoAccounts[selectedRoleTab].label}</span>
                    <ArrowRight className="w-4 h-4 text-[#10B981]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Demo Credentials */}
            <div className="pt-3 border-t border-[#2A2E36] auth-stagger-6">
              <p className="text-[10px] font-bold text-[#667085] text-center uppercase tracking-wider mb-2">
                Quick 1-Click Demo Fill
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleTabClick('manager')}
                  className="btn-small w-full p-2 rounded-xl bg-[#20242B] border border-[#8B5CF6]/30 hover:bg-[#2A223B] hover:border-[#8B5CF6] text-left transition-all cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-[#A78BFA]">Manager</p>
                  <p className="text-[9px] text-[#667085] font-mono truncate">manager@shift.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabClick('driver')}
                  className="btn-small w-full p-2 rounded-xl bg-[#20242B] border border-[#10B981]/30 hover:bg-[#153428] hover:border-[#10B981] text-left transition-all cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-[#34D399]">Driver</p>
                  <p className="text-[9px] text-[#667085] font-mono truncate">driver@shift.com</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabClick('conductor')}
                  className="btn-small w-full p-2 rounded-xl bg-[#20242B] border border-[#F97316]/30 hover:bg-[#382015] hover:border-[#F97316] text-left transition-all cursor-pointer"
                >
                  <p className="text-[11px] font-bold text-[#FB923C]">Conductor</p>
                  <p className="text-[9px] text-[#667085] font-mono truncate">conductor@shift.com</p>
                </button>
              </div>
            </div>

            {/* Account Creation Link */}
            <div className="text-center pt-2 border-t border-[#2A2E36]">
              <p className="text-xs text-[#CBD1D7]">
                Need a new account?{' '}
                <Link to="/signup" className="font-bold text-[#10B981] hover:text-[#34D399] transition-colors">
                  Create Personnel Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
