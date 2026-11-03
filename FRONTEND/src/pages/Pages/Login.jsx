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

  // Load remembered credentials if previously saved
  const getRememberedCredentials = () => {
    try {
      const saved = localStorage.getItem('remembered_credentials');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const initialRemembered = getRememberedCredentials();
  const [rememberMe, setRememberMe] = useState(Boolean(initialRemembered));
  const [email, setEmail] = useState(initialRemembered?.username || initialRemembered?.email || '');
  const [password, setPassword] = useState(initialRemembered?.password || '');
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
        // Save or clear remembered credentials based on checkbox
        if (rememberMe) {
          localStorage.setItem('remembered_credentials', JSON.stringify({
            username: email,
            password: password
          }));
        } else {
          localStorage.removeItem('remembered_credentials');
        }

        const menuPages = Array.isArray(response.data?.menuPage)
          ? response.data.menuPage
          : (Array.isArray(response.menuPage) ? response.menuPage : []);

        setAuthData({
          token: response.token?.accessToken,
          user: response.data?.user,
          context: response.data?.context,
          session: response.session,
          photo: response.photo,
          userMenu: menuPages,
          rawResponse: response
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
      <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] dark:bg-[#090d16] font-sans selection:bg-indigo-500 selection:text-white">

        {/* ========================================== */}
        {/* LEFT COLUMN: Clean Modern SaaS Form       */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 bg-white/90 dark:bg-[#0b0f19]/90 backdrop-blur-xl text-slate-900 dark:text-slate-100 min-h-screen border-r border-slate-200/60 dark:border-slate-800/60">

          {/* Top Brand Header */}
          <div className="flex items-center justify-between w-full">
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center p-2 shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all">
                <img src={logo} alt="Vishvin ERP" className="w-full h-full object-contain filter drop-shadow brightness-0 invert" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    Vishvin
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    ERP
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  Enterprise Cloud Portal
                </span>
              </div>
            </div>

            {/* Quick Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>

          {/* Center Form Section */}
          <div className="w-full max-w-[410px] mx-auto my-auto py-8">

            {/* LOGIN VIEW */}
            {isLogin && (
              <div className="space-y-6">
                <div>
                  {/* <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    SECURE ENTERPRISE LOGIN
                  </div> */}
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Welcome back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Sign in with your enterprise credentials to access your workspace.
                  </p>
                </div>

                {authError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Username / Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Username, Email, or Phone
                    </label>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. admin or admin@vishvin.com"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your security password"
                        className="w-full px-4 py-3 pr-11 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
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
                        className="rounded-md accent-indigo-600 w-4 h-4 cursor-pointer"
                        checked={rememberMe}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setRememberMe(checked);
                          if (!checked) {
                            localStorage.removeItem('remembered_credentials');
                          }
                        }}
                      />
                      <span className="font-medium">Remember me</span>
                    </label>
                    <span
                      onClick={() => navigate('/pages/auth/forgot-password')}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline cursor-pointer font-semibold"
                    >
                      Forgot password?
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                      </>
                    ) : (
                      "Sign in to Dashboard"
                    )}
                  </button>
                </form>

                {/* Or Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                  <span className="shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Or continue with</span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
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
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    INSTANT WORKSPACE SETUP
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Create your account
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Sign up to begin your enterprise operations experience.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      placeholder="john@company.com"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Choose a strong password"
                        className="w-full px-4 py-3 pr-11 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
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
                      className="rounded-md accent-indigo-600 w-4 h-4 cursor-pointer"
                      defaultChecked
                      required
                    />
                    <label htmlFor="terms" className="cursor-pointer text-slate-600 dark:text-slate-400 select-none font-medium">
                      I agree to the <span className="underline font-semibold text-slate-800 dark:text-slate-200">Terms of Service</span> and <span className="underline font-semibold text-slate-800 dark:text-slate-200">Privacy Policy</span>
                    </label>
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                {/* Or Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                  <span className="shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Or continue with</span>
                  <div className="flex-grow border-t border-slate-200/80 dark:border-slate-800"></div>
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('Google')}
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-indigo-400/40"
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
                    className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs hover:border-indigo-400/40"
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
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    PASSWORD RECOVERY
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Reset your password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter your email and we'll send recovery instructions.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/otp'); }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      defaultValue=""
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Send Verification Code
                  </button>
                </form>

                <p className="text-xs text-center text-slate-500 pt-2">
                  Remember your password?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/pages/auth/login')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    SECURE PASSWORD RESET
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Set new password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter your new secure password below.
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Choose a strong password"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Repeat your new password"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-2xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                    TWO-FACTOR VERIFICATION
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Verify your identity
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                    Enter the 6-digit code sent to your registered email address.
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/reset-password'); }} className="space-y-4">
                  <div className="grid grid-cols-6 gap-2.5 text-center py-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength="1"
                        defaultValue={i === 1 ? "4" : i === 2 ? "9" : i === 3 ? "2" : ""}
                        className="h-14 text-center text-xl font-extrabold border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/80 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 transition-all shadow-2xs"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
                  >
                    Verify & Proceed
                  </button>
                </form>

                <p className="text-xs text-center text-slate-500 pt-1">
                  Didn't receive the code?{' '}
                  <button type="button" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                    Resend code
                  </button>
                </p>
              </div>
            )}

          </div>

          <div className="h-4"></div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: Modern Indigo/Violet Showcase */}
        {/* ========================================== */}
        <div className="w-full md:w-1/2 lg:w-5/12 xl:w-1/2 relative text-white p-8 sm:p-12 lg:p-14 xl:p-16 flex flex-col justify-between overflow-hidden min-h-screen" style={{ background: 'linear-gradient(135deg, #312e81 0%, #4c1d95 40%, #1e1b4b 100%)' }}>

          {/* Animated mesh gradient orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 -left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-purple-600/25 rounded-full blur-3xl"></div>
          </div>

          {/* Floating dots grid - top right */}
          <div className="absolute top-8 right-8 grid grid-cols-5 gap-2 opacity-20 pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>
            ))}
          </div>

          {/* Floating dots grid - bottom left */}
          <div className="absolute bottom-8 left-8 grid grid-cols-5 gap-2 opacity-15 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>
            ))}
          </div>

          {/* Top Badge */}
          <div className="relative z-10">
            {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Enterprise Cloud Platform · 99.99% uptime
            </div> */}
          </div>

          {/* Center Showcase Mockup Cards */}
          <div className="relative my-auto w-full max-w-[440px] mx-auto py-6">

            {/* Primary Analytics Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-800 w-full max-w-[400px] border border-white/20">
              {/* Card Header with Tabs */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span className="font-bold text-sm text-slate-800">Performance Analytics</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg text-[10px] text-slate-400">
                  {['Weekly', 'Monthly', 'Yearly'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setChartPeriod(t)}
                      className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-all ${chartPeriod === t ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-slate-600'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric Row */}
              <div className="grid grid-cols-3 gap-3 py-3 border-b border-slate-100">
                <div className="text-center">
                  <div className="text-lg font-extrabold text-slate-900">1,284</div>
                  <div className="text-[10px] text-slate-400 font-medium">Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-emerald-600">94.2%</div>
                  <div className="text-[10px] text-slate-400 font-medium">Attendance</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-extrabold text-indigo-600">$1.2M</div>
                  <div className="text-[10px] text-slate-400 font-medium">Payroll</div>
                </div>
              </div>

              {/* Chart Line Visualization */}
              <div className="h-32 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
                        backgroundColor: '#4f46e5',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '11px',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(79,70,229,0.5)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val1"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4, fill: '#4f46e5' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="val2"
                      stroke="#c4b5fd"
                      strokeWidth={1.5}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overlapping Donut Circle Card (Floating bottom right) */}
            <div className="absolute -bottom-6 right-0 sm:right-2 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl w-44 sm:w-48 flex flex-col items-center justify-center border border-white/20">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Donut Ring SVG */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-indigo-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Active Progress Segment */}
                  <path
                    stroke="url(#donutGrad)"
                    strokeDasharray="68, 100"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <defs>
                    <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center Percentage Label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                  <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">68%</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold mt-2 text-center">Efficiency Index</p>
            </div>

          </div>

          {/* Bottom Heading and Subtitle */}
          <div className="relative z-10 text-center max-w-md mx-auto pt-10 space-y-3">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
              Your entire business,<br /><span className="text-violet-300">one intelligent platform</span>
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed font-normal">
              Vishvin ERP unifies HR, CRM, POS, payroll, and operations into one seamless cloud workspace.
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] dark:bg-[#090d16]">
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative text-center max-w-md mx-auto p-10 rounded-3xl bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-2xl space-y-6">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 dark:from-indigo-900/30 dark:to-violet-900/30 flex items-center justify-center border border-indigo-500/20 dark:border-violet-500/20 shadow-inner">
            {isMaint ? <RefreshCw className="w-9 h-9 text-indigo-600 dark:text-indigo-400 animate-spin" /> : <ShieldAlert className="w-9 h-9 text-rose-500 dark:text-rose-400" />}
          </div>

          <div className="space-y-2">
            {is404 && (
              <>
                <h2 className="text-7xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">404</h2>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">Page Not Found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">The route you're looking for couldn't be found in our navigation tree.</p>
              </>
            )}

            {is403 && (
              <>
                <h2 className="text-7xl font-black bg-gradient-to-r from-rose-500 to-red-600 bg-clip-text text-transparent">403</h2>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">Access Denied</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">You don't have permission to view this module. Contact your system administrator.</p>
              </>
            )}

            {is500 && (
              <>
                <h2 className="text-7xl font-black bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">500</h2>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">Server Error</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">An unexpected error occurred on our servers. Our team has been notified.</p>
              </>
            )}

            {isMaint && (
              <>
                <div className="text-5xl mb-2">🔧</div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Under Maintenance</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Vishvin ERP is being upgraded. We'll be back online shortly.</p>
              </>
            )}

            {isSoon && (
              <>
                <div className="text-5xl mb-2">🚀</div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Coming Soon</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">We're building something amazing for this module. Stand by for release.</p>
              </>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
            >
              ← Go Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white cursor-pointer shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
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
          <Sparkles className="w-5 h-5 text-indigo-700" /> Utility Systems & Heartbeat
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
