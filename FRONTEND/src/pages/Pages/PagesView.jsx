// src/pages/Pages/PagesView.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  RefreshCw,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip
} from 'recharts';
import { useERPStore } from '../../store/useERPStore';
import { authService } from '../../services';
import logo from '../../assets/vite.svg';

export default function PagesView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('andrew@vishvin-erp.com');
  const [password, setPassword] = useState('password123');
  const [chartPeriod, setChartPeriod] = useState('Weekly');

  const theme = useERPStore((state) => state.theme);
  const setTheme = useERPStore((state) => state.setTheme);

  // Mock chart data for right-side visual preview card
  const chartData = [
    { day: 'MON', val1: 22, val2: 14 },
    { day: 'TUE', val1: 48, val2: 36 },
    { day: 'WED', val1: 28, val2: 20 },
    { day: 'THU', val1: 56, val2: 34 },
    { day: 'FRI', val1: 36, val2: 44 },
    { day: 'SAT', val1: 64, val2: 50 },
    { day: 'SUN', val1: 52, val2: 42 }
  ];

  const [authError, setAuthError] = useState(null);
  const setAuthData = useERPStore((state) => state.setAuthData);
  const showToast = useERPStore((state) => state.showToast);

  // Authentication Flow Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const response = await authService.login(email, password);
      if (response?.success) {
        setAuthData({
          token: response.token?.accessToken,
          user: response.data?.user,
          context: response.data?.context,
          session: response.session,
          photo: response.photo
        });
        showToast('Login successful! Welcome back.', 'success');
        navigate('/dashboard');
      } else {
        setAuthError(response?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      const errorMsg = err?.data?.message || err?.message || 'Invalid username or password';
      setAuthError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = (provider) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast(`Authenticated successfully via ${provider}!`, 'success');
      navigate('/dashboard');
    }, 450);
  };

  // ==========================================
  // 1. AUTHENTICATION SCREENS (LOGIN, REGISTER, FORGOT, RESET, OTP)
  // ==========================================
  if (pathname.includes('/pages/auth/')) {
    const isLogin = pathname.includes('/login');
    const isRegister = pathname.includes('/register');
    const isForgot = pathname.includes('/forgot-password');
    const isReset = pathname.includes('/reset-password');
    const isOTP = pathname.includes('/otp');

    return (
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-white dark:bg-slate-950 font-sans">

        {/* ========================================== */}
        {/* LEFT COLUMN: Clean Form Interface         */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">

          {/* Top Brand Header */}
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/20 flex items-center justify-center p-2 shrink-0 shadow-xs group-hover:border-teal-500/40 transition-all">
                <img src={logo} alt="Vishvin ERP" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white uppercase">
                VISHVIN ERP
              </span>
            </div>
          </div>

          {/* Center Form Section */}
          <div className="w-full max-w-[400px] mx-auto my-auto py-8">

            {/* LOGIN VIEW */}
            {isLogin && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Sign in to your account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter your registered credentials to access your dashboard.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Username / Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Username or Email or PhoneNo
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your username or email"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#053742] dark:focus:ring-teal-500 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-11 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#053742] dark:focus:ring-teal-500 transition-all shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                      <input
                        type="checkbox"
                        className="rounded-md accent-[#053742] w-4 h-4 cursor-pointer"
                        defaultChecked
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <span
                      onClick={() => navigate('/pages/auth/forgot-password')}
                      className="text-slate-600 dark:text-slate-400 hover:text-[#053742] dark:hover:text-teal-400 hover:underline cursor-pointer font-medium"
                    >
                      Forgot password?
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#053742] hover:bg-[#03262e] active:scale-[0.99] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#053742]/25 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </form>

                {/* Or Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('Google')}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin('Facebook')}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Footer Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/pages/auth/register')}
                      className="text-[#053742] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* REGISTER VIEW */}
            {isRegister && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Create an account
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Sign up to begin your enterprise operations experience.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#053742] dark:focus:ring-teal-500 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your mail"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#053742] dark:focus:ring-teal-500 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-11 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#053742] dark:focus:ring-teal-500 transition-all shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded-md accent-[#053742] w-4 h-4 cursor-pointer"
                      defaultChecked
                      required
                    />
                    <label htmlFor="terms" className="cursor-pointer text-slate-600 dark:text-slate-400 select-none font-medium">
                      I agree to all the <span className="underline font-semibold text-slate-800 dark:text-slate-200">Terms & Conditions</span>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#053742] hover:bg-[#03262e] active:scale-[0.99] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#053742]/25 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                      </>
                    ) : (
                      "Sign up"
                    )}
                  </button>
                </form>

                {/* Or Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  <span className="shrink-0 mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('Google')}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSSOLogin('Facebook')}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-slate-300"
                  >
                    <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>

                {/* Footer Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/pages/auth/login')}
                      className="text-[#053742] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* FORGOT PASSWORD */}
            {isForgot && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Reset password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter your email to receive recovery instructions.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/otp'); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your mail"
                      defaultValue="andrew@vishvin-erp.com"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#053742]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#053742] hover:bg-[#03262e] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#053742]/25"
                  >
                    Send Verification Code
                  </button>
                </form>

                <p className="text-xs text-center text-slate-500 pt-2">
                  Back to{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/pages/auth/login')}
                    className="text-[#053742] dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            )}

            {/* RESET PASSWORD */}
            {isReset && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Set new password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter your new secure password below.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#053742] hover:bg-[#03262e] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#053742]/25"
                  >
                    Update Password & Sign In
                  </button>
                </form>
              </div>
            )}

            {/* OTP SCREEN */}
            {isOTP && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Verification Code
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter the 6-digit code dispatched to your registered email.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/reset-password'); }} className="space-y-4">
                  <div className="grid grid-cols-6 gap-2 text-center py-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        defaultValue={i === 1 ? "4" : i === 2 ? "9" : i === 3 ? "2" : ""}
                        className="h-12 text-center text-lg font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/80 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#053742]"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-[#053742] hover:bg-[#03262e] text-white font-bold text-sm transition-all cursor-pointer shadow-md shadow-[#053742]/25"
                  >
                    Verify Code
                  </button>
                </form>
              </div>
            )}

          </div>

          <div className="h-4"></div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Rich Deep Teal Showcase (SS) */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 lg:w-5/12 xl:w-1/2 relative bg-[#04333d] dark:bg-[#021f26] text-white p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between overflow-hidden min-h-screen">

          {/* Subtle Geometric Square Mosaics (Top-Right & Bottom-Left) */}
          <div className="absolute top-4 right-4 grid grid-cols-4 gap-2.5 opacity-25 pointer-events-none">
            <div className="w-7 h-7 rounded-md bg-white/40"></div>
            <div className="w-7 h-7 rounded-md bg-white/20"></div>
            <div className="w-7 h-7 rounded-md bg-white/60"></div>
            <div className="w-7 h-7 rounded-md bg-transparent"></div>
            <div className="w-7 h-7 rounded-md bg-transparent"></div>
            <div className="w-7 h-7 rounded-md bg-white/30"></div>
            <div className="w-7 h-7 rounded-md bg-white/50"></div>
            <div className="w-7 h-7 rounded-md bg-white/20"></div>
          </div>

          <div className="absolute bottom-6 left-6 grid grid-cols-4 gap-2.5 opacity-20 pointer-events-none">
            <div className="w-6 h-6 rounded-md bg-white/30"></div>
            <div className="w-6 h-6 rounded-md bg-white/50"></div>
            <div className="w-6 h-6 rounded-md bg-transparent"></div>
            <div className="w-6 h-6 rounded-md bg-white/20"></div>
            <div className="w-6 h-6 rounded-md bg-white/40"></div>
            <div className="w-6 h-6 rounded-md bg-transparent"></div>
          </div>

          {/* Top spacer */}
          <div></div>

          {/* Center Showcase Mockup Cards (Exact visual recreation from screenshot) */}
          <div className="relative my-auto w-full max-w-[440px] mx-auto py-6">

            {/* Primary Analytics Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-800 w-full max-w-[400px]">
              {/* Card Header with Tabs */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-800">Analytics</span>
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg text-[10px] text-slate-400">
                  {['Weekly', 'Monthly', 'Yearly'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setChartPeriod(t)}
                      className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-all ${chartPeriod === t ? 'bg-white text-slate-800 shadow-xs' : 'hover:text-slate-600'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Line Visualization */}
              <div className="h-40 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      stroke="#94a3b8"
                      fontSize={9}
                      dy={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#053742',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val1"
                      stroke="#053742"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#053742' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val2"
                      stroke="#94a3b8"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="3 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overlapping Donut Circle Card (Floating on bottom right) */}
            <div className="absolute -bottom-6 right-0 sm:right-2 bg-white rounded-2xl p-5 shadow-2xl w-44 sm:w-48 flex flex-col items-center justify-center border border-slate-100 animate-fade-in">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Donut Ring SVG */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active Progress Segment */}
                  <path
                    className="text-[#053742]"
                    strokeDasharray="42, 100"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center Percentage Label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
                  <span className="text-lg font-black text-[#053742]">42%</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Heading and Subtitle (From screenshot) */}
          <div className="relative z-10 text-center max-w-md mx-auto pt-10 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Very simple way you can engage
            </h3>
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed font-normal">
              Welcome to Vishvin ERP Management System! Efficiently track and manage your business operations with ease.
            </p>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // 2. ERROR PAGES (404, 403, 500, MAINTENANCE, COMING SOON)
  // ==========================================
  if (pathname.includes('/pages/error/')) {
    const is404 = pathname.includes('/404');
    const is403 = pathname.includes('/403');
    const is500 = pathname.includes('/500');
    const isMaint = pathname.includes('/maintenance');
    const isSoon = pathname.includes('/coming-soon');

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fade-in">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
            {isMaint ? <RefreshCw className="w-8 h-8 text-teal-700 animate-spin" /> : <ShieldAlert className="w-8 h-8 text-red-500" />}
          </div>

          <div className="space-y-2">
            {is404 && (
              <>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">404</h2>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Page Not Found</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">The route path you searched could not be located in our system navigation tree.</p>
              </>
            )}

            {is403 && (
              <>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">403</h2>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Unauthorized Access</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">You do not have authorization to view this module. Contact your system administrator.</p>
              </>
            )}

            {is500 && (
              <>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white">500</h2>
                <p className="text-base font-bold text-slate-700 dark:text-slate-300">Internal Server Error</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">The local service layer encountered an unexpected exception while compiling modules.</p>
              </>
            )}

            {isMaint && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Under Maintenance</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vishvin ERP is undergoing structural database updates. We will be back online shortly.</p>
              </>
            )}

            {isSoon && (
              <>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Coming Soon</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">We are currently constructing this segment modules. Stand by for release.</p>
              </>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#053742] text-white hover:bg-[#042d36] cursor-pointer"
            >
              Dashboard Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 3. UTILITIES PAGE
  // ==========================================
  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-tight m-0">
          <Sparkles className="w-5 h-5 text-teal-700" /> Utility Systems & Heartbeat
        </h2>
        <p className="text-xs text-slate-500 mt-1">Operational support widgets and cloud diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-slate-50 text-sm">System Heartbeat</h5>
            <p className="text-xs text-slate-500 mt-1">Uptime status of cloud clusters and microservice endpoints.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">All services active (99.98% uptime)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
