// src/pages/Pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Lock,
  User,
  Radio,
  Zap,
  Gauge,
  Navigation,
  Server,
  BookOpen,
  Wrench,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Layers,
  ExternalLink
} from 'lucide-react';
import { useERPStore } from '../../store/useERPStore';
import { authService } from '../../services';
import logo from '../../assets/vite.svg';

// ==========================================
// VISHVIN FLAGSHIP PROJECTS & SOLUTIONS DATA
// ==========================================
const VISHVIN_PROJECTS = [
  {
    id: 'smart-poles',
    code: 'IOT-POLE',
    short: 'Smart Poles',
    title: 'Smart Poles (Street Poles + IoT)',
    category: 'Smart City Infrastructure',
    tagline: 'Intelligent urban poles far beyond traditional lighting',
    description:
      'Innovative smart poles integrating IoT edge controllers, smart LED dimming, environmental sensors, 5G microcells, and public safety surveillance into a unified municipal grid.',
    icon: Radio,
    accent: 'from-blue-500 to-cyan-400',
    stat: '10,000+ Active',
    metrics: [
      { label: 'Energy Savings', value: '42%' },
      { label: 'Uptime', value: '99.9%' },
      { label: 'Sensors/Pole', value: '6+' }
    ],
    url: 'https://www.vishvin.com/smartpoles'
  },
  {
    id: 'ami',
    code: 'AMI-GRID',
    short: 'AMI',
    title: 'AMI (Advanced Metering Infrastructure)',
    category: 'Smart Grid & Power Utilities',
    tagline: 'Two-way intelligent communication network for utilities',
    description:
      'Next-generation Smart Meters delivering bidirectional data synchronization between consumer meters and utility Head-End Systems (HES) / Meter Data Management Systems (MDMS).',
    icon: Zap,
    accent: 'from-amber-500 to-orange-400',
    stat: '1.2M+ Meters',
    metrics: [
      { label: 'Two-Way Sync', value: '< 2s' },
      { label: 'Data Accuracy', value: '99.98%' },
      { label: 'Grid Feed', value: 'Real-time' }
    ],
    url: 'https://www.vishvin.com/advancedmeteringinfrastructure'
  },
  {
    id: 'amr',
    code: 'AMR-AUTO',
    short: 'AMR',
    title: 'AMR (Automatic Meter Reading)',
    category: 'Telemetry & Automated Billing',
    tagline: 'Autonomous consumption, diagnostic and status harvesting',
    description:
      'Automated meter telemetry that collects consumption profiles, tamper alarms, and voltage diagnostics without manual intervention, accelerating billing cycles.',
    icon: Gauge,
    accent: 'from-emerald-500 to-teal-400',
    stat: '850K+ Endpoints',
    metrics: [
      { label: 'Billing Speed', value: '4x' },
      { label: 'Zero Leakage', value: '100%' },
      { label: 'Automated Cycle', value: 'Daily' }
    ],
    url: 'https://www.vishvin.com/automaticmeterreading'
  },
  {
    id: 'drone-services',
    code: 'AERO-GIS',
    short: 'Drone Services',
    title: 'Drone-Based Services',
    category: 'Aerial Inspection & Surveying',
    tagline: 'Frontier drone robotics for rapid high-precision inspection',
    description:
      'High-precision aerial surveying, LiDAR point clouds, and thermal hotspot diagnostics for high-voltage transmission corridors, solar farms, and civil infrastructure.',
    icon: Navigation,
    accent: 'from-indigo-500 to-violet-400',
    stat: '25,000+ km',
    metrics: [
      { label: 'Resolution', value: '1.2 cm/px' },
      { label: 'Survey Speed', value: '10x Faster' },
      { label: 'LiDAR + Thermal', value: 'Enabled' }
    ],
    url: 'https://www.vishvin.com/dronebasedservices'
  },
  {
    id: 'vms',
    code: 'VMS-SEC',
    short: 'VMS',
    title: 'VMS (Vigilance Metering System)',
    category: 'Energy Vigilance & Revenue Protection',
    tagline: 'Field enforcement & web application vigilance software',
    description:
      'Enables power distribution companies to enforce vigil, detect meter bypass and revenue leakage through specialized field audit tools and real-time analytical dashboards.',
    icon: ShieldCheck,
    accent: 'from-rose-500 to-pink-500',
    stat: '₹48 Cr+ Loss Recovered',
    metrics: [
      { label: 'AT&C Loss Reduction', value: '18%' },
      { label: 'Audit Speed', value: '< 5 min' },
      { label: 'Enforcement Tracking', value: 'Live' }
    ],
    url: 'https://www.vishvin.com/vigilancemeteringsystem'
  },
  {
    id: 'it-infrastructure',
    code: 'IT-CORE',
    short: 'IT Infrastructure',
    title: 'IT Infrastructure Specialism',
    category: 'Enterprise Integration & Data Centers',
    tagline: 'System integration & high-availability knowledge consulting',
    description:
      'Comprehensive system architecture, server orchestration, redundant data centers, and multi-cloud infrastructure engineered to support mission-critical enterprise workloads.',
    icon: Server,
    accent: 'from-blue-600 to-indigo-500',
    stat: 'Tier-3 Grade',
    metrics: [
      { label: 'Uptime SLA', value: '99.99%' },
      { label: 'Multi-Cloud', value: 'Hybrid' },
      { label: 'Latency', value: '< 15ms' }
    ],
    url: 'https://www.vishvin.com/itinfrastructurespecialism'
  },
  {
    id: 'meter-installation',
    code: 'FLD-OPS',
    short: 'Meter Installation',
    title: 'Meter Supply & Installation',
    category: 'Turnkey Field Rollout',
    tagline: 'Nationwide installation through specialized technical teams',
    description:
      'Turnkey meter replacement, consumer indexing, GIS asset tagging, and field quality assurance executed via our dedicated in-house technical workforce.',
    icon: Wrench,
    accent: 'from-teal-500 to-emerald-400',
    stat: '2M+ Units Installed',
    metrics: [
      { label: 'Daily Rollout', value: '3,500+' },
      { label: 'QC Pass Rate', value: '99.8%' },
      { label: 'GIS Tagged', value: '100%' }
    ],
    url: 'https://www.vishvin.com/meterinstallationservices'
  },
  {
    id: 'digital-library',
    code: 'E-LIB',
    short: 'Digital Library',
    title: 'Digital Library Software',
    category: 'e-Content Hosting & Knowledge Search',
    tagline: 'Enterprise cloud hosting & intelligent content management',
    description:
      'Scalable digital repository with high-performance semantic search, DRM rights management, and cloud archival for technical standards and enterprise documentation.',
    icon: BookOpen,
    accent: 'from-purple-500 to-fuchsia-400',
    stat: '5M+ Docs Indexed',
    metrics: [
      { label: 'Search Latency', value: '< 80ms' },
      { label: 'Cloud Hosted', value: '100%' },
      { label: 'Format Support', value: '50+ Types' }
    ],
    url: 'https://www.vishvin.com/digitallibrary'
  }
];

const ROTATE_MS = 5200;

// ==========================================
// PAGE ANIMATIONS (drone delivery + showcase)
// ==========================================
const DRONE_CSS = `
.vx-carrier{animation:vxFlyIn 1.8s cubic-bezier(.22,.8,.25,1) both}
@keyframes vxFlyIn{
  0%{transform:translate3d(-85vw,-75vh,0) rotate(-6deg);opacity:0}
  10%{opacity:1}
  100%{transform:none;opacity:1}
}

.vx-drone{animation:vxDroneFlight 4.6s ease-in-out both}
@keyframes vxDroneFlight{
  0%{transform:rotate(12deg);opacity:1}
  39%{transform:rotate(-3deg)}
  46%{transform:rotate(0)}
  65%{transform:translate(0,0) rotate(0);opacity:1}
  74%{transform:translate(-1vw,-2vh) rotate(-8deg);opacity:1}
  100%{transform:translate(60vw,-85vh) rotate(14deg) scale(.7);opacity:0}
}
.vx-hover{animation:vxHover 2.2s ease-in-out infinite}
@keyframes vxHover{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

/* Propeller: blades spin inside a flattened (perspective) group, plus a motion-blur disc */
.vx-spin{transform-box:fill-box;transform-origin:center;animation:vxSpinRot .085s linear infinite}
@keyframes vxSpinRot{to{transform:rotate(360deg)}}
.vx-disc{animation:vxDisc .18s ease-in-out infinite alternate}
@keyframes vxDisc{from{opacity:.75}to{opacity:1}}
.vx-blink{animation:vxBlink 1s ease-in-out infinite}
@keyframes vxBlink{0%,100%{opacity:1}50%{opacity:.25}}

.vx-cables{animation:vxCable .35s ease-in 2.15s both}
@keyframes vxCable{0%{opacity:1}100%{opacity:0}}

.vx-hud{animation:vxHud 1.4s ease both;animation-delay:1.8s}
@keyframes vxHud{
  0%{opacity:0;transform:translateX(-8px)}
  15%{opacity:1;transform:none}
  80%{opacity:1}
  100%{opacity:0}
}

.vx-beam{animation:vxBeam 1.1s ease-out 2.1s both}
@keyframes vxBeam{0%{opacity:0}25%{opacity:.9}100%{opacity:0}}

.vx-card{transform-origin:top center;animation:vxCardLaunch 1.1s cubic-bezier(.25,.9,.3,1) 2.2s both}
@keyframes vxCardLaunch{
  0%{transform:translateY(-24px) scale(.22)}
  50%{transform:translateY(22px) scale(1.05)}
  72%{transform:translateY(-8px) scale(.99)}
  88%{transform:translateY(3px) scale(1.005)}
  100%{transform:none}
}

.vx-ring{animation:vxRing 1s ease-out 2.7s both}
.vx-ring.delay{animation-delay:2.85s}
@keyframes vxRing{
  0%{opacity:0;transform:scale(.98)}
  15%{opacity:.8}
  100%{opacity:0;transform:scale(1.14)}
}

/* Showcase content swap + auto-rotate progress */
.vx-swap{animation:vxSwap .45s ease both}
@keyframes vxSwap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.vx-progress{animation:vxProgress ${ROTATE_MS}ms linear both}
@keyframes vxProgress{from{width:0}to{width:100%}}
.vx-float{animation:vxFloat 5s ease-in-out infinite}
@keyframes vxFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

@media (prefers-reduced-motion: reduce){
  .vx-carrier,.vx-card{animation:none!important}
  .vx-drone,.vx-cables,.vx-hud,.vx-beam,.vx-ring{display:none!important}
  .vx-spin,.vx-disc,.vx-hover,.vx-swap,.vx-float,.vx-progress{animation:none!important}
}
`;

// One propeller: motion-blur disc + spinning blades, drawn flat then squashed for perspective
function Rotor({ cx, cy, r, tilt = 0.17, delay = 0 }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${tilt})`}>
      <circle className="vx-disc" r={r} fill="url(#vxDisc)" />
      <g className="vx-spin" style={{ animationDelay: `${delay}s` }}>
        <rect x={-r} y={-1.7} width={r * 2} height={3.4} rx={1.7} fill="#0b1220" opacity=".92" />
        <rect x={-r} y={-0.6} width={r * 2} height={1.2} rx={0.6} fill="#94a3b8" opacity=".5" />
      </g>
      <circle r={3.4} fill="#1e293b" stroke="#64748b" strokeWidth=".8" />
      <circle r={1.2} fill="#cbd5e1" />
    </g>
  );
}

// Motor housing (cylinder with shading)
function Motor({ cx, cy, w = 15, h = 11 }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy + h} rx={w / 2} ry={3.2} fill="#020617" opacity=".55" />
      <rect x={cx - w / 2} y={cy} width={w} height={h} rx={3} fill="url(#vxMotor)" stroke="#475569" strokeWidth=".6" />
      <rect x={cx - w / 2 + 2} y={cy + 3} width={w - 4} height={1.1} fill="#38bdf8" opacity=".75" />
      <ellipse cx={cx} cy={cy} rx={w / 2} ry={3} fill="#334155" stroke="#64748b" strokeWidth=".6" />
    </g>
  );
}

function DeliveryDrone() {
  return (
    <svg viewBox="0 0 240 96" width="240" height="96" className="vx-hover overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="vxShell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="45%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="vxBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id="vxArm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="vxMotor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="40%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="vxDisc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#94a3b8" stopOpacity=".05" />
          <stop offset="70%" stopColor="#cbd5e1" stopOpacity=".16" />
          <stop offset="100%" stopColor="#e2e8f0" stopOpacity=".34" />
        </radialGradient>
        <radialGradient id="vxLens" cx="38%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a5f3fc" />
          <stop offset="35%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <radialGradient id="vxDome" cx="40%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>
        <filter id="vxShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#020617" floodOpacity=".45" />
        </filter>
      </defs>

      <g filter="url(#vxShadow)">
        {/* ===== Rear (far) arms + rotors, drawn smaller for depth ===== */}
        <g opacity=".85">
          <line x1="106" y1="40" x2="66" y2="22" stroke="url(#vxArm)" strokeWidth="5" strokeLinecap="round" />
          <line x1="134" y1="40" x2="174" y2="22" stroke="url(#vxArm)" strokeWidth="5" strokeLinecap="round" />
          <Motor cx={66} cy={14} w={12} h={9} />
          <Motor cx={174} cy={14} w={12} h={9} />
          <Rotor cx={66} cy={12} r={25} tilt={0.14} delay={0.03} />
          <Rotor cx={174} cy={12} r={25} tilt={0.14} delay={0.06} />
        </g>

        {/* ===== Landing gear ===== */}
        <g stroke="#1e293b" strokeLinecap="round" fill="none">
          <path d="M98 60 L84 86" strokeWidth="3" />
          <path d="M142 60 L156 86" strokeWidth="3" />
          <path d="M76 87 L94 87" strokeWidth="3.4" stroke="#0f172a" />
          <path d="M146 87 L164 87" strokeWidth="3.4" stroke="#0f172a" />
        </g>

        {/* ===== Front (near) arms ===== */}
        <line x1="98" y1="48" x2="30" y2="40" stroke="#020617" strokeWidth="7.5" strokeLinecap="round" opacity=".5" />
        <line x1="142" y1="48" x2="210" y2="40" stroke="#020617" strokeWidth="7.5" strokeLinecap="round" opacity=".5" />
        <line x1="98" y1="47" x2="30" y2="38" stroke="url(#vxArm)" strokeWidth="6.5" strokeLinecap="round" />
        <line x1="142" y1="47" x2="210" y2="38" stroke="url(#vxArm)" strokeWidth="6.5" strokeLinecap="round" />
        <line x1="98" y1="45.2" x2="32" y2="36.4" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity=".7" />
        <line x1="142" y1="45.2" x2="208" y2="36.4" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" opacity=".7" />

        {/* ===== Fuselage ===== */}
        <path d="M84 50 Q84 34 104 32 L136 32 Q156 34 156 50 Q156 62 140 63 L100 63 Q84 62 84 50 Z" fill="url(#vxShell)" stroke="#475569" strokeWidth=".8" />
        {/* upper shell highlight */}
        <path d="M92 42 Q96 35 108 34 L132 34 Q144 35 148 42 Q132 38 120 38 Q104 38 92 42 Z" fill="#fff" opacity=".45" />
        {/* belly / battery pack */}
        <path d="M92 55 L148 55 Q150 62 140 63 L100 63 Q90 62 92 55 Z" fill="url(#vxBelly)" />
        {/* cooling vents */}
        <g stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" opacity=".7">
          <line x1="104" y1="45" x2="136" y2="45" />
          <line x1="106" y1="48.5" x2="134" y2="48.5" />
          <line x1="108" y1="52" x2="132" y2="52" />
        </g>
        {/* accent stripe */}
        <rect x="88" y="55" width="64" height="1.6" rx=".8" fill="#22d3ee" opacity=".9" />
        {/* GPS dome */}
        <ellipse cx="120" cy="32" rx="9" ry="4.2" fill="url(#vxDome)" stroke="#475569" strokeWidth=".6" />
        <line x1="120" y1="28" x2="120" y2="22" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="120" cy="21.5" r="1.4" fill="#f43f5e" className="vx-blink" />

        {/* nav lights */}
        <circle cx="87" cy="50" r="2.4" fill="#f43f5e" className="vx-blink" />
        <circle cx="153" cy="50" r="2.4" fill="#22c55e" className="vx-blink" />

        {/* ===== Front camera gimbal ===== */}
        <rect x="113" y="62" width="14" height="5" rx="2" fill="#0f172a" />
        <circle cx="120" cy="70" r="7.5" fill="#0f172a" stroke="#64748b" strokeWidth=".9" />
        <circle cx="120" cy="70" r="4.8" fill="url(#vxLens)" stroke="#020617" strokeWidth=".8" />
        <circle cx="118.3" cy="68.2" r="1.3" fill="#fff" opacity=".85" />

        {/* ===== Tether hooks (cables attach here) ===== */}
        <rect x="96" y="58" width="8" height="4" rx="1.5" fill="#0f172a" />
        <rect x="136" y="58" width="8" height="4" rx="1.5" fill="#0f172a" />
        <line x1="100" y1="62" x2="100" y2="82" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="140" y1="62" x2="140" y2="82" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="100" cy="84" r="2.6" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="140" cy="84" r="2.6" fill="none" stroke="#38bdf8" strokeWidth="1.6" />

        {/* ===== Front (near) motors + rotors, drawn last ===== */}
        <Motor cx={30} cy={32} w={16} h={12} />
        <Motor cx={210} cy={32} w={16} h={12} />
        <Rotor cx={30} cy={30} r={32} tilt={0.17} delay={0} />
        <Rotor cx={210} cy={30} r={32} tilt={0.17} delay={0.04} />
      </g>
    </svg>
  );
}

export default function PagesView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Showcase state
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Drone delivery: card becomes interactive only after it lands
  const [cardReady, setCardReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setCardReady(true), reduce ? 0 : 3000);
    return () => clearTimeout(t);
  }, []);

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

  const theme = useERPStore((state) => state.theme);
  const setTheme = useERPStore((state) => state.setTheme);

  const [authError, setAuthError] = useState(null);
  const setAuthData = useERPStore((state) => state.setAuthData);
  const showToast = useERPStore((state) => state.showToast);

  // Auto-rotate featured projects unless hovered
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveProjectIdx((prev) => (prev + 1) % VISHVIN_PROJECTS.length);
    }, ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [isPaused, activeProjectIdx]);

  const activeProject = VISHVIN_PROJECTS[activeProjectIdx];
  const ActiveIcon = activeProject.icon;

  // Authentication Flow Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const response = await authService.login(email, password);
      if (response?.success) {
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
        showToast('Login successful! Welcome to Vishvin ERP.', 'success');
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
      <div
        className={`min-h-screen lg:h-screen w-full relative flex flex-col font-sans select-none overflow-x-hidden lg:overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-[#080d1a] text-slate-100' : 'bg-[#edf3fb] text-slate-800'
          }`}
        style={{
          background:
            theme === 'dark'
              ? 'radial-gradient(ellipse at 25% 25%, #0f1e3c 0%, #080d1a 55%, #04070e 100%)'
              : 'radial-gradient(ellipse at 25% 25%, #e6effa 0%, #edf3fb 50%, #dbe6f4 100%)'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ========================================================= */}
        {/* AMBIENT BACKGROUND GLOWS & BLUEPRINT GRID                  */}
        {/* ========================================================= */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full blur-3xl transition-opacity duration-500 ${theme === 'dark' ? 'bg-blue-600/18' : 'bg-blue-400/25'
              }`}
          ></div>
          <div
            className={`absolute top-1/3 -right-28 w-[480px] h-[480px] rounded-full blur-3xl transition-opacity duration-500 ${theme === 'dark' ? 'bg-cyan-500/12' : 'bg-indigo-300/25'
              }`}
          ></div>
          <div
            className={`absolute -bottom-28 left-1/4 w-[540px] h-[540px] rounded-full blur-3xl transition-opacity duration-500 ${theme === 'dark' ? 'bg-indigo-600/15' : 'bg-teal-300/20'
              }`}
          ></div>

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                theme === 'dark'
                  ? `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`
                  : `linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
              opacity: theme === 'dark' ? 0.035 : 0.045
            }}
          ></div>
        </div>

        {/* ========================================================= */}
        {/* TOP BAR: BRAND (left) • ENTERPRISE RESOURCE PLAN (center) • CONTROLS (right) */}
        {/* ========================================================= */}
        <header className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-3.5 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2 border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 justify-self-start">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center p-2 shadow-lg shadow-blue-500/25 ring-1 ring-white/30">
              <img src={logo} alt="Vishvin" className="w-full h-full object-contain filter brightness-0 invert" />
            </div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white">
              VISHVIN <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">TECHNOLOGIES</span>
            </h1>
          </div>

          {/* Center title */}
          <div className="order-last col-span-2 md:order-none md:col-span-1 text-center">
            <p className="text-xs sm:text-sm lg:text-xl font-extrabold tracking-[0.22em] uppercase text-slate-900 dark:text-white">
              Enterprise Resource Plan
            </p>
            <div className="mx-auto mt-1 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          </div>

          {/* Status Indicator & Theme Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3 justify-self-end">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Grid Telemetry: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Live</strong>
              </span>
            </div>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* MAIN STAGE: wide two-column grid, left-aligned showcase    */}
        {/* ========================================================= */}
        <main className="flex-1 min-h-0 w-full px-4 sm:px-8 lg:px-10 py-5 lg:py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_460px] gap-8 lg:gap-14 items-center">
          {/* ------------------------------------------------------- */}
          {/* LEFT SIDE: LEFT-ALIGNED, FULL-WIDTH SHOWCASE            */}
          {/* ------------------------------------------------------- */}
          <div className="w-full min-w-0 lg:max-h-full lg:overflow-y-auto custom-scrollbar flex flex-col items-start text-left gap-5 xl:gap-6 py-2 pr-0 lg:pr-2">
            {/* Category & Code Badges */}
            <div key={`b-${activeProject.id}`} className="vx-swap flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/80 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-1.5 backdrop-blur-md">
                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                {activeProject.category}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/10 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-400 border border-blue-500/25 dark:border-cyan-500/30">
                {activeProject.code}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {activeProject.stat}
              </span>
            </div>

            {/* HERO: text on the left, large project emblem on the right (fills the empty space) */}
            <div key={`h-${activeProject.id}`} className="vx-swap w-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-8 items-center">
              <div className="space-y-4 min-w-0">
                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                  {activeProject.title}
                </h2>
                <p className="text-base sm:text-lg xl:text-xl font-semibold bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-600 dark:from-blue-300 dark:via-slate-200 dark:to-cyan-200 bg-clip-text text-transparent">
                  "{activeProject.tagline}"
                </p>
                <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-2xl">
                  {activeProject.description}
                </p>
              </div>

              {/* Emblem */}
              <div className="hidden xl:flex items-center justify-center">
                <div className="vx-float relative w-60 h-60">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${activeProject.accent} opacity-20 blur-2xl`} />
                  <div className="absolute inset-0 rounded-full border border-slate-300/60 dark:border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-dashed border-slate-300/70 dark:border-white/15" />
                  <div className={`absolute inset-12 rounded-[2rem] rotate-6 bg-gradient-to-br ${activeProject.accent} shadow-2xl shadow-blue-500/25 flex items-center justify-center`}>
                    <ActiveIcon className="w-16 h-16 text-white -rotate-6 drop-shadow" strokeWidth={1.6} />
                  </div>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/85 dark:bg-slate-900/85 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm backdrop-blur">
                    {activeProject.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics (full width, separate tiles) */}
            <div key={`m-${activeProject.id}`} className="vx-swap w-full grid grid-cols-3 gap-3 sm:gap-4">
              {activeProject.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-none"
                >
                  <div className="text-xl sm:text-2xl xl:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">
                    {m.label}
                  </div>
                  <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${activeProject.accent} opacity-80`} />
                </div>
              ))}
            </div>

            {/* Action Links & Step Buttons */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3">
              <a
                href={activeProject.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600/10 dark:bg-blue-600/20 hover:bg-blue-600/20 dark:hover:bg-blue-600/30 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-all group"
              >
                <span>View Full Solution Specification</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setActiveProjectIdx((prev) => (prev - 1 + VISHVIN_PROJECTS.length) % VISHVIN_PROJECTS.length)
                  }
                  className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Previous Solution"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 px-1">
                  {String(activeProjectIdx + 1).padStart(2, '0')} / {String(VISHVIN_PROJECTS.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProjectIdx((prev) => (prev + 1) % VISHVIN_PROJECTS.length)}
                  className="w-9 h-9 rounded-xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                  title="Next Solution"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Project selector + auto-rotate progress */}
            <div className="w-full pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Project to Inspect:
                </span>
                <span className="text-[11px] text-slate-400">8 Deployments Active</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {VISHVIN_PROJECTS.map((proj, idx) => {
                  const IconComponent = proj.icon;
                  const isSelected = idx === activeProjectIdx;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => setActiveProjectIdx(idx)}
                      className={`relative overflow-hidden flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer border ${isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 ring-1 ring-white/20'
                        : 'bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-cyan-400'}`}
                      />
                      <div className="truncate min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{proj.short}</p>
                        <p className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>{proj.code}</p>
                      </div>
                      {isSelected && (
                        <span
                          key={`p-${activeProjectIdx}`}
                          className="vx-progress absolute left-0 bottom-0 h-[3px] bg-white/80"
                          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* RIGHT SIDE: DRONE-DELIVERED GLASSMORPHISM LOGIN CARD     */}
          {/* ------------------------------------------------------- */}
          <div className="w-full max-w-[460px] justify-self-center lg:justify-self-end shrink-0 flex items-center justify-center">
            <style>{DRONE_CSS}</style>

            <div className="vx-carrier relative w-full">
              {/* Scan beam */}
              <div
                className="vx-beam absolute left-1/2 -translate-x-1/2 w-[90%] z-10 pointer-events-none"
                style={{
                  top: -50,
                  height: 'calc(100% + 50px)',
                  clipPath: 'polygon(40% 0, 60% 0, 100% 100%, 0 100%)',
                  background:
                    'linear-gradient(to bottom, rgba(34,211,238,.55), rgba(59,130,246,.14) 70%, transparent)'
                }}
              />

              {/* Landing shockwave rings */}
              <div className="vx-ring absolute inset-0 rounded-3xl border-2 border-cyan-400/60 pointer-events-none z-10" />
              <div className="vx-ring delay absolute inset-0 rounded-3xl border border-blue-400/50 pointer-events-none z-10" />

              {/* Cables holding the card pod */}
              <svg
                className="vx-cables absolute z-30 pointer-events-none"
                style={{ left: '50%', marginLeft: -60, top: -50 }}
                width="120"
                height="26"
                viewBox="0 0 120 26"
              >
                <line x1="40" y1="0" x2="12" y2="26" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="80" y1="0" x2="108" y2="26" stroke="#38bdf8" strokeWidth="1.5" />
              </svg>

              {/* HUD tag */}
              <div
                className="vx-hud hidden md:flex absolute z-30 items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide bg-slate-900/80 text-cyan-300 border border-cyan-400/40 whitespace-nowrap pointer-events-none"
                style={{ top: -120, right: 'calc(50% + 130px)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Deploying secure login…
              </div>

              {/* The drone */}
              <div
                className="vx-drone absolute left-1/2 z-30 pointer-events-none"
                style={{ top: -135, marginLeft: -120, width: 240 }}
              >
                <DeliveryDrone />
              </div>

              {/* The Glassmorphism Card Container (delivered by the drone) */}
              <div
                className={`vx-card relative z-20 w-full rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-colors duration-300 border ${cardReady ? '' : 'pointer-events-none'
                  } ${theme === 'dark'
                    ? 'bg-slate-900/60 border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] ring-1 ring-white/10'
                    : 'bg-white/75 border-white/90 shadow-[0_20px_50px_-12px_rgba(30,58,138,0.18)] ring-1 ring-white/80'
                  }`}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
              >
                {/* LOGIN VIEW */}
                {isLogin && (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 dark:bg-blue-900/30 border border-blue-500/20 dark:border-blue-800 text-[10.5px] font-bold text-blue-700 dark:text-blue-300 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Role-Based Enterprise Access</span>
                      </div>
                      <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                        Sign In
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Enter authorized credentials to access Vishvin ERP modules
                      </p>
                    </div>

                    {authError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fadeIn">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                        <span className="font-medium">{authError}</span>
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-3 sm:space-y-3.5">
                      {/* Username / Corporate Email */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                          User Name / Corporate Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your user name"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-normal shadow-xs backdrop-blur-sm"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all font-normal shadow-xs backdrop-blur-sm"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Options: Remember me & Forgot Password */}
                      <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={rememberMe}
                            onClick={() => {
                              const next = !rememberMe;
                              setRememberMe(next);
                              if (!next) localStorage.removeItem('remembered_credentials');
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${rememberMe ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                              }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${rememberMe ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                          </button>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Remember me
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => navigate('/pages/auth/forgot-password')}
                          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Sign In Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 flex items-center justify-center gap-2 mt-3"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Authenticating...
                          </>
                        ) : (
                          <>
                            <span>Sign In to ERP Portal</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* Request Account link */}
                    {/* <div className="pt-2 text-center border-t border-slate-200/80 dark:border-slate-800/80">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Need employee access?{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/pages/auth/register')}
                          className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                        >
                          Request Account
                        </button>
                      </p>
                    </div> */}
                  </div>
                )}

                {/* REGISTER VIEW */}
                {isRegister && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Request ERP Account
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Submit details for departmental role provisioning
                      </p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3">
                      <input
                        type="text"
                        placeholder="Full Legal Name"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Corporate Email (@vishvin.com)"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Desired Password"
                          className="w-full px-4 py-2.5 sm:py-3 pr-11 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/25 mt-2 cursor-pointer"
                      >
                        {loading ? "Submitting Request..." : "Submit Provisioning Request"}
                      </button>
                    </form>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/pages/auth/login')}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </div>
                )}

                {/* FORGOT PASSWORD VIEW */}
                {isForgot && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Recover Password
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter corporate email to receive security verification
                      </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/otp'); }} className="space-y-3.5">
                      <input
                        type="email"
                        placeholder="Enter registered corporate email"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-blue-500/25 mt-2 cursor-pointer"
                      >
                        Send Security Code
                      </button>
                    </form>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/pages/auth/login')}
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  </div>
                )}

                {/* RESET PASSWORD VIEW */}
                {isReset && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Set New Password
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Choose a secure password of at least 8 characters
                      </p>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/60 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/25 cursor-pointer"
                      >
                        Update Password & Sign In
                      </button>
                    </form>
                  </div>
                )}

                {/* OTP VERIFICATION VIEW */}
                {isOTP && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Security Verification
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Enter the 6-digit verification code sent to your email
                      </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); navigate('/pages/auth/reset-password'); }} className="space-y-4">
                      <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <input
                            key={i}
                            type="text"
                            maxLength="1"
                            defaultValue={i === 1 ? "7" : i === 2 ? "3" : i === 3 ? "9" : ""}
                            className="h-11 sm:h-12 text-center text-lg font-bold border border-slate-200/90 dark:border-slate-700/70 rounded-xl bg-white/60 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                          />
                        ))}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/25 cursor-pointer"
                      >
                        Verify Code
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* FOOTER                                                    */}
        {/* ========================================================= */}
        <footer className="shrink-0 relative z-20 w-full px-4 sm:px-8 lg:px-12 py-3 border-t border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1.5 sm:gap-2">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              256-bit TLS Encrypted Session • Enterprise RBAC Protected
            </span>
            <span>© 2026 Vishvin Technologies Pvt. Ltd. All rights reserved.</span>
          </div>
        </footer>
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
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-[#080d1a] text-white' : 'bg-[#edf3fb] text-slate-900'}`}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative text-center max-w-md mx-auto p-10 rounded-3xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30 shadow-inner">
            {isMaint ? <RefreshCw className="w-9 h-9 text-blue-500 animate-spin" /> : <ShieldAlert className="w-9 h-9 text-rose-500" />}
          </div>

          <div className="space-y-2">
            {is404 && (
              <>
                <h2 className="text-7xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">404</h2>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">Page Not Found</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">The requested route could not be found in the Vishvin ERP navigation tree.</p>
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
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Vishvin ERP is currently being upgraded. We will be back online shortly.</p>
              </>
            )}

            {isSoon && (
              <>
                <div className="text-5xl mb-2">🚀</div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Coming Soon</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">We're developing this enterprise module. Stand by for the upcoming release.</p>
              </>
            )}
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
            >
              ← Go Back
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
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
          <Sparkles className="w-5 h-5 text-blue-600" /> Utility Systems & Heartbeat
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





















// src/pages/Pages/Login.jsx
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   Eye, EyeOff, Sun, Moon, RefreshCw, ShieldAlert, ShieldCheck,
//   Lock, User, ArrowRight, Radio, Zap, Gauge, Navigation,
//   Server, BookOpen, Wrench, Layers, Activity, Cpu, Sparkles
// } from 'lucide-react';
// import { useERPStore } from '../../store/useERPStore';
// import { authService } from '../../services';
// import logo from '../../assets/vite.svg';

// /* ---------------------------------------------------------------
//    Rotating "workspace" capability labels for the left animation
// --------------------------------------------------------------- */
// const CAPABILITIES = [
//   { label: 'Smart Poles', code: 'IOT-POLE', Icon: Radio, accent: 'from-blue-500 to-cyan-400' },
//   { label: 'AMI Grid', code: 'AMI-GRID', Icon: Zap, accent: 'from-amber-500 to-orange-400' },
//   { label: 'AMR Telemetry', code: 'AMR-AUTO', Icon: Gauge, accent: 'from-emerald-500 to-teal-400' },
//   { label: 'Drone Survey', code: 'AERO-GIS', Icon: Navigation, accent: 'from-indigo-500 to-violet-400' },
//   { label: 'Vigilance', code: 'VMS-SEC', Icon: ShieldCheck, accent: 'from-rose-500 to-pink-500' },
//   { label: 'IT Core', code: 'IT-CORE', Icon: Server, accent: 'from-blue-600 to-indigo-500' },
//   { label: 'Field Ops', code: 'FLD-OPS', Icon: Wrench, accent: 'from-teal-500 to-emerald-400' },
//   { label: 'Digital Library', code: 'E-LIB', Icon: BookOpen, accent: 'from-purple-500 to-fuchsia-400' },
// ];

// const FLOAT_ICONS = [Radio, Zap, Gauge, Navigation, Server, BookOpen, Wrench, Layers, Cpu, Activity];

// function useParticles(count = 22) {
//   return useMemo(
//     () =>
//       Array.from({ length: count }).map((_, i) => {
//         const Icon = FLOAT_ICONS[i % FLOAT_ICONS.length];
//         return {
//           id: i,
//           Icon,
//           left: `${(i * 41.7) % 100}%`,
//           top: `${(i * 47.3) % 100}%`,
//           size: 10 + ((i * 7) % 18),
//           delay: `${(i * 0.53) % 9}s`,
//           duration: `${14 + ((i * 3.1) % 12)}s`,
//           drift: `${-30 + ((i * 13) % 60)}px`,
//           opacity: 0.07 + ((i % 5) * 0.03),
//         };
//       }),
//     [count]
//   );
// }

// function LiveTicker({ dark }) {
//   const [tick, setTick] = useState(0);
//   useEffect(() => {
//     const t = setInterval(() => setTick((v) => v + 1), 1200);
//     return () => clearInterval(t);
//   }, []);
//   return (
//     <div className="flex items-end gap-[3px] h-8">
//       {Array.from({ length: 26 }).map((_, i) => {
//         const h = 4 + ((Math.sin((tick + i) * 0.6) + 1) / 2) * 24;
//         return (
//           <span
//             key={i}
//             className="w-[3px] rounded-full transition-all duration-700 ease-out"
//             style={{
//               height: `${h}px`,
//               background: dark
//                 ? 'linear-gradient(180deg,#38bdf8,#6366f1)'
//                 : 'linear-gradient(180deg,#2563eb,#06b6d4)',
//               opacity: 0.35 + h / 50,
//             }}
//           />
//         );
//       })}
//     </div>
//   );
// }

// export default function PagesView() {
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [authError, setAuthError] = useState(null);

//   const particles = useParticles(22);

//   // Rotating capability on the animation panel
//   const [capIdx, setCapIdx] = useState(0);
//   useEffect(() => {
//     const t = setInterval(() => setCapIdx((p) => (p + 1) % CAPABILITIES.length), 3600);
//     return () => clearInterval(t);
//   }, []);
//   const activeCap = CAPABILITIES[capIdx];
//   const ActiveCapIcon = activeCap.Icon;

//   // mouse-follow glow inside the LEFT stage only
//   const glowRef = useRef(null);
//   const stageRef = useRef(null);
//   const handleMove = (e) => {
//     const rect = stageRef.current?.getBoundingClientRect();
//     if (!rect || !glowRef.current) return;
//     glowRef.current.style.transform = `translate(${e.clientX - rect.left - 220}px, ${e.clientY - rect.top - 220}px)`;
//   };

//   // remembered credentials
//   const getRemembered = () => {
//     try {
//       const raw = localStorage.getItem('remembered_credentials');
//       return raw ? JSON.parse(raw) : null;
//     } catch { return null; }
//   };
//   const init = getRemembered();
//   const [rememberMe, setRememberMe] = useState(Boolean(init));
//   const [email, setEmail] = useState(init?.username || init?.email || '');
//   const [password, setPassword] = useState(init?.password || '');

//   const theme = useERPStore((s) => s.theme);
//   const setTheme = useERPStore((s) => s.setTheme);
//   const setAuthData = useERPStore((s) => s.setAuthData);
//   const showToast = useERPStore((s) => s.showToast);
//   const isDark = theme === 'dark';

//   const handleAuthSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setAuthError(null);
//     try {
//       const response = await authService.login(email, password);
//       if (response?.success) {
//         if (rememberMe) {
//           localStorage.setItem('remembered_credentials', JSON.stringify({ username: email, password }));
//         } else {
//           localStorage.removeItem('remembered_credentials');
//         }
//         const menuPages = Array.isArray(response.data?.menuPage)
//           ? response.data.menuPage
//           : Array.isArray(response.menuPage) ? response.menuPage : [];
//         setAuthData({
//           token: response.token?.accessToken,
//           user: response.data?.user,
//           context: response.data?.context,
//           session: response.session,
//           photo: response.photo,
//           userMenu: menuPages,
//           rawResponse: response,
//         });
//         showToast('Login successful! Welcome to Vishvin ERP.', 'success');
//         navigate('/dashboard');
//       } else {
//         setAuthError(response?.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (err) {
//       const msg = err?.data?.message || err?.message || 'Invalid username or password';
//       setAuthError(msg);
//       showToast(msg, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- AUTH ROUTE ---------------- */
//   if (pathname.includes('/pages/auth/')) {
//     const isLogin = pathname.includes('/login');

//     return (
//       <div
//         className="relative min-h-screen w-full overflow-hidden font-sans select-none flex flex-col"
//         style={{
//           background: isDark
//             ? 'radial-gradient(ellipse at 20% 20%, #0f1e3c 0%, #080d1a 55%, #04070e 100%)'
//             : 'radial-gradient(ellipse at 20% 20%, #e6effa 0%, #edf3fb 50%, #dbe6f4 100%)',
//         }}
//       >
//         {/* ---------- top bar ---------- */}
//         <header className="relative z-20 w-full px-5 sm:px-8 py-4 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
//           <div className="flex items-center gap-2.5">
//             <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center p-2 shadow-lg shadow-blue-500/25 ring-1 ring-white/30">
//               <img src={logo} alt="Vishvin" className="w-full h-full object-contain filter brightness-0 invert" />
//             </div>
//             <div className="leading-tight">
//               <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-900 dark:text-white">
//                 VISHVIN <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">ERP</span>
//               </p>
//               <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Operations Workspace</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2.5">
//             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
//               <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
//                 Grid: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Live</strong>
//               </span>
//             </div>
//             <button
//               onClick={() => setTheme(isDark ? 'light' : 'dark')}
//               className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
//               title="Toggle theme"
//             >
//               {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
//             </button>
//           </div>
//         </header>

//         {/* ---------- main split stage ---------- */}
//         <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">

//           {/* ===================================================== */}
//           {/* LEFT — ANIMATED WORKSPACE STAGE                        */}
//           {/* ===================================================== */}
//           <div
//             ref={stageRef}
//             onMouseMove={handleMove}
//             className={`relative overflow-hidden rounded-3xl border min-h-[520px] lg:min-h-0 flex flex-col ${isDark
//                 ? 'border-white/[0.08] bg-slate-950/40 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.75)]'
//                 : 'border-white/80 bg-white/50 shadow-[0_20px_50px_-18px_rgba(30,58,138,0.18)]'
//               }`}
//           >
//             {/* ambient glows */}
//             <div className="absolute inset-0 pointer-events-none overflow-hidden">
//               <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full blur-3xl"
//                 style={{ background: isDark ? 'rgba(59,130,246,0.16)' : 'rgba(96,165,250,0.25)' }} />
//               <div className="absolute top-1/3 -right-32 w-[380px] h-[380px] rounded-full blur-3xl"
//                 style={{ background: isDark ? 'rgba(34,211,238,0.12)' : 'rgba(129,140,248,0.20)' }} />
//               <div className="absolute -bottom-32 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl"
//                 style={{ background: isDark ? 'rgba(99,102,241,0.14)' : 'rgba(45,212,191,0.18)' }} />

//               {/* blueprint grid */}
//               <div
//                 className="absolute inset-0"
//                 style={{
//                   backgroundImage: isDark
//                     ? 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)'
//                     : 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)',
//                   backgroundSize: '44px 44px',
//                   opacity: isDark ? 0.05 : 0.06,
//                 }}
//               />

//               {/* drifting icons */}
//               {particles.map(({ id, Icon, left, top, size, delay, duration, drift, opacity }) => (
//                 <div
//                   key={id}
//                   className="absolute animate-drift"
//                   style={{ left, top, animationDelay: delay, animationDuration: duration, ['--drift']: drift }}
//                 >
//                   <Icon
//                     style={{ width: size, height: size, opacity }}
//                     className={isDark ? 'text-cyan-300' : 'text-blue-500'}
//                   />
//                 </div>
//               ))}

//               {/* scan line sweep */}
//               <div
//                 className="absolute inset-x-0 h-px animate-scan-line"
//                 style={{
//                   background: isDark
//                     ? 'linear-gradient(90deg, transparent, #38bdf8, transparent)'
//                     : 'linear-gradient(90deg, transparent, #2563eb, transparent)',
//                   boxShadow: isDark ? '0 0 12px #38bdf8' : '0 0 12px #2563eb',
//                 }}
//               />

//               {/* mouse-follow glow */}
//               <div
//                 ref={glowRef}
//                 className="absolute w-[440px] h-[440px] rounded-full pointer-events-none transition-transform duration-300 ease-out"
//                 style={{
//                   background: isDark
//                     ? 'radial-gradient(circle, rgba(56,189,248,0.14), transparent 65%)'
//                     : 'radial-gradient(circle, rgba(37,99,235,0.14), transparent 65%)',
//                   filter: 'blur(20px)',
//                 }}
//               />
//             </div>

//             {/* stage content */}
//             <div className="relative z-10 flex flex-col justify-between h-full p-6 sm:p-8 lg:p-10">
//               {/* top status row */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <span className="relative flex w-2 h-2">
//                     <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
//                     <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
//                   </span>
//                   <span className="text-[10.5px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
//                     Workspace Online
//                   </span>
//                 </div>
//                 <LiveTicker dark={isDark} />
//               </div>

//               {/* center hero — rotating capability */}
//               <div className="flex flex-col items-center text-center py-6">
//                 <div className="relative mb-6">
//                   {/* pulsing rings */}
//                   <span className="absolute inset-0 rounded-3xl animate-ping-slow"
//                     style={{ background: isDark ? 'rgba(56,189,248,0.10)' : 'rgba(37,99,235,0.10)' }} />
//                   <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${activeCap.accent} flex items-center justify-center shadow-2xl ring-1 ring-white/40 transition-all duration-500`}>
//                     <ActiveCapIcon className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
//                   </div>
//                 </div>

//                 <div key={activeCap.code} className="animate-fade-up">
//                   <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-400 border border-blue-500/25 dark:border-cyan-500/30 mb-2">
//                     <Sparkles className="w-3 h-3" />
//                     {activeCap.code}
//                   </span>
//                   <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
//                     {activeCap.label}
//                   </h2>
//                   <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
//                     Deployed across Vishvin's integrated grid, telemetry &amp; field operations stack.
//                   </p>
//                 </div>

//                 {/* capability dots */}
//                 <div className="flex items-center gap-1.5 mt-6">
//                   {CAPABILITIES.map((c, i) => (
//                     <button
//                       key={c.code}
//                       type="button"
//                       onClick={() => setCapIdx(i)}
//                       className={`h-1.5 rounded-full transition-all duration-300 ${i === capIdx
//                           ? 'w-6 bg-blue-600 dark:bg-cyan-400'
//                           : 'w-1.5 bg-slate-400/40 dark:bg-slate-600 hover:bg-slate-500'
//                         }`}
//                       aria-label={c.label}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* bottom live-metric strip */}
//               <div className="grid grid-cols-3 gap-2">
//                 {[
//                   { k: 'Active Nodes', v: '10.4K' },
//                   { k: 'Grid Uptime', v: '99.9%' },
//                   { k: 'Data Sync', v: '<2s' },
//                 ].map((m) => (
//                   <div
//                     key={m.k}
//                     className="rounded-xl px-3 py-2.5 border backdrop-blur-md bg-white/60 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800/70"
//                   >
//                     <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">{m.v}</div>
//                     <div className="text-[9.5px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{m.k}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* ===================================================== */}
//           {/* RIGHT — LOGIN CARD                                     */}
//           {/* ===================================================== */}
//           <div className="flex items-center justify-center">
//             <div
//               className={`w-full max-w-[420px] rounded-3xl p-7 sm:p-8 backdrop-blur-2xl border transition-all duration-300 ${isDark
//                   ? 'bg-slate-900/55 border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.75)] ring-1 ring-white/10'
//                   : 'bg-white/80 border-white/90 shadow-[0_20px_50px_-12px_rgba(30,58,138,0.18)] ring-1 ring-white/80'
//                 }`}
//             >
//               {/* heading */}
//               <div className="mb-5">
//                 <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 dark:bg-blue-900/30 border border-blue-500/20 dark:border-blue-800 text-[10px] font-bold text-blue-700 dark:text-blue-300 mb-2.5">
//                   <ShieldCheck className="w-3.5 h-3.5" />
//                   <span>Role-Based Access</span>
//                 </div>
//                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In</h3>
//                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
//                   Enter authorized credentials to access your workspace
//                 </p>
//               </div>

//               {authError && (
//                 <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-fade-up">
//                   <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
//                   <span className="font-medium">{authError}</span>
//                 </div>
//               )}

//               <form onSubmit={handleAuthSubmit} className="space-y-3.5">
//                 <div>
//                   <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-widest">
//                     User Name / Corporate Email
//                   </label>
//                   <div className="relative">
//                     <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                     <input
//                       type="text"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       placeholder="Enter your user name"
//                       className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm rounded-xl bg-white/70 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all backdrop-blur-sm"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-[10.5px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-widest">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       placeholder="Enter your password"
//                       className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-sm rounded-xl bg-white/70 dark:bg-slate-950/50 border border-slate-200/90 dark:border-slate-700/70 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all backdrop-blur-sm"
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
//                     >
//                       {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
//                     </button>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between pt-0.5">
//                   <label className="flex items-center gap-2 cursor-pointer select-none">
//                     <button
//                       type="button"
//                       role="switch"
//                       aria-checked={rememberMe}
//                       onClick={() => {
//                         const next = !rememberMe;
//                         setRememberMe(next);
//                         if (!next) localStorage.removeItem('remembered_credentials');
//                       }}
//                       className={`relative inline-flex h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors duration-200 ${rememberMe ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
//                         }`}
//                     >
//                       <span
//                         className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${rememberMe ? 'translate-x-4' : 'translate-x-0'
//                           }`}
//                       />
//                     </button>
//                     <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Remember me</span>
//                   </label>
//                   <button
//                     type="button"
//                     onClick={() => navigate('/pages/auth/forgot-password')}
//                     className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
//                   >
//                     Forgot password?
//                   </button>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-[0.99] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-2"
//                 >
//                   {loading ? (
//                     <><RefreshCw className="w-4 h-4 animate-spin" /> Authenticating…</>
//                   ) : (
//                     <><span>Sign In to ERP Portal</span><ArrowRight className="w-4 h-4" /></>
//                   )}
//                 </button>
//               </form>

//               {isLogin && (
//                 <div className="pt-4 mt-4 text-center border-t border-slate-200/70 dark:border-slate-800/70">
//                   <p className="text-[11px] text-slate-500 dark:text-slate-400">
//                     Need employee access?{' '}
//                     <button
//                       type="button"
//                       onClick={() => navigate('/pages/auth/register')}
//                       className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
//                     >
//                       Request Account
//                     </button>
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>

//         {/* ---------- footer ---------- */}
//         <footer className="relative z-20 w-full px-5 sm:px-8 py-3 border-t border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md bg-white/40 dark:bg-slate-950/40">
//           <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-1.5">
//             <span className="flex items-center gap-1.5 font-medium">
//               <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
//               256-bit TLS Encrypted Session • Enterprise RBAC Protected
//             </span>
//             <span>© 2026 Vishvin Technologies Pvt. Ltd.</span>
//           </div>
//         </footer>

//         {/* keyframes */}
//         <style>{`
//           @keyframes drift {
//             0%   { transform: translate(0, 0); }
//             50%  { transform: translate(var(--drift, 20px), -30px); }
//             100% { transform: translate(0, 0); }
//           }
//           .animate-drift { animation-name: drift; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

//           @keyframes scan-line {
//             0%   { top: -2px; opacity: 0; }
//             10%  { opacity: 1; }
//             90%  { opacity: 1; }
//             100% { top: 100%; opacity: 0; }
//           }
//           .animate-scan-line { animation: scan-line 7s linear infinite; }

//           @keyframes ping-slow {
//             0%   { transform: scale(0.9); opacity: 0.7; }
//             100% { transform: scale(1.35); opacity: 0; }
//           }
//           .animate-ping-slow { animation: ping-slow 2.8s cubic-bezier(0,0,0.2,1) infinite; }

//           @keyframes fade-up {
//             0%   { opacity: 0; transform: translateY(8px); }
//             100% { opacity: 1; transform: translateY(0); }
//           }
//           .animate-fade-up { animation: fade-up 0.5s ease-out both; }
//         `}</style>
//       </div>
//     );
//   }

//   /* ---------------- ERROR ROUTES ---------------- */
//   if (pathname.includes('/pages/error/')) {
//     const is404 = pathname.includes('/404');
//     const is403 = pathname.includes('/403');
//     const is500 = pathname.includes('/500');
//     const isMaint = pathname.includes('/maintenance');
//     const isSoon = pathname.includes('/coming-soon');

//     return (
//       <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#080d1a] text-white' : 'bg-[#edf3fb] text-slate-900'}`}>
//         <div className="relative text-center max-w-md mx-auto p-10 rounded-3xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
//           <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
//             {isMaint ? <RefreshCw className="w-9 h-9 text-blue-500 animate-spin" /> : <ShieldAlert className="w-9 h-9 text-rose-500" />}
//           </div>
//           {is404 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">404</h2><p className="font-extrabold">Page Not Found</p></>)}
//           {is403 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">403</h2><p className="font-extrabold">Access Denied</p></>)}
//           {is500 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">500</h2><p className="font-extrabold">Server Error</p></>)}
//           {isMaint && (<><div className="text-5xl">🔧</div><p className="text-xl font-extrabold">Under Maintenance</p></>)}
//           {isSoon && (<><div className="text-5xl">🚀</div><p className="text-xl font-extrabold">Coming Soon</p></>)}
//           <div className="flex justify-center gap-3 pt-2">
//             <button onClick={() => navigate(-1)} className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">← Go Back</button>
//             <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Dashboard</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- UTILITIES ---------------- */
//   return (
//     <div className="space-y-6">
//       <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
//         <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
//           <Activity className="w-5 h-5 text-blue-600" /> Utility Systems
//         </h2>
//         <p className="text-xs text-slate-500 mt-1">Operational support widgets and cloud diagnostics.</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48">
//           <h5 className="font-bold text-slate-900 dark:text-slate-50 text-sm">System Heartbeat</h5>
//           <div className="flex items-center gap-2">
//             <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
//             <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">All services active</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






















// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   Eye, EyeOff, Sun, Moon, RefreshCw, ShieldAlert, ShieldCheck,
//   User, Lock, Activity
// } from 'lucide-react';
// import { useERPStore } from '../../store/useERPStore';
// import { authService } from '../../services';

// /* ---------------------------------------------------------------
//    Cozy desk scene (inline SVG) — sits on the left of the card
// --------------------------------------------------------------- */
// /* ---------- helpers ---------- */
// function Worker({ cx, hair, top, topDark, bun = false, headphones = false }) {
//   return (
//     <g>
//       {/* neck */}
//       <rect x={cx - 8} y="446" width="16" height="28" fill="#efc09a" />
//       {/* upper arms */}
//       <ellipse cx={cx - 60} cy="524" rx="15" ry="38" fill={topDark} />
//       <ellipse cx={cx + 60} cy="524" rx="15" ry="38" fill={topDark} />
//       {/* shoulders + back */}
//       <path
//         d={`M${cx - 64} 574 C${cx - 70} 526 ${cx - 60} 482 ${cx - 34} 472 L${cx - 12} 465 Q${cx} 472 ${cx + 12} 465 L${cx + 34} 472 C${cx + 60} 482 ${cx + 70} 526 ${cx + 64} 574 Z`}
//         fill={top}
//       />
//       {/* head (seen from behind) */}
//       {bun && <circle cx={cx} cy="398" r="13" fill={hair} />}
//       <circle cx={cx} cy="428" r="28" fill={hair} />
//       <ellipse cx={cx - 27} cy="438" rx="4" ry="6" fill="#f1c39c" />
//       <ellipse cx={cx + 27} cy="438" rx="4" ry="6" fill="#f1c39c" />
//       <path d={`M${cx - 20} 452 Q${cx} 462 ${cx + 20} 452 L${cx + 14} 448 Q${cx} 454 ${cx - 14} 448 Z`} fill={hair} />
//       {headphones && (
//         <g>
//           <path d={`M${cx - 30} 436 A30 30 0 0 1 ${cx + 30} 436`} stroke="#3b3552" strokeWidth="5" fill="none" strokeLinecap="round" />
//           <rect x={cx - 37} y="428" width="11" height="20" rx="5" fill="#3b3552" />
//           <rect x={cx + 26} y="428" width="11" height="20" rx="5" fill="#3b3552" />
//         </g>
//       )}
//       {/* chair back (nearest to the viewer) */}
//       <rect x={cx - 62} y="526" width="124" height="72" rx="28" fill="#5d4f86" />
//       <rect x={cx - 48} y="536" width="96" height="6" rx="3" fill="#7968a8" />
//       <rect x={cx - 6} y="596" width="12" height="18" fill="#3b3552" />
//       <ellipse cx={cx} cy="620" rx="48" ry="7" fill="#3b3552" />
//       <circle cx={cx - 44} cy="627" r="5" fill="#2a2540" />
//       <circle cx={cx + 44} cy="627" r="5" fill="#2a2540" />
//       <circle cx={cx} cy="630" r="5" fill="#2a2540" />
//     </g>
//   );
// }

// function Monitor({ x, kind }) {
//   const y = 322;
//   return (
//     <g filter="url(#of-shadow)">
//       <rect x={x + 85} y={y + 116} width="20" height="16" fill="#4a4363" />
//       <ellipse cx={x + 95} cy={y + 134} rx="36" ry="6" fill="#4a4363" />
//       <rect x={x} y={y} width="190" height="120" rx="10" fill="#3b3552" />
//       <rect x={x + 8} y={y + 8} width="174" height="98" rx="5" fill="#fbf9ff" />
//       <rect x={x + 8} y={y + 8} width="174" height="15" rx="5" fill="#ece3fb" />
//       <circle cx={x + 18} cy={y + 15.5} r="2.6" fill="#f4a6a0" />
//       <circle cx={x + 27} cy={y + 15.5} r="2.6" fill="#f2cf5a" />
//       <circle cx={x + 36} cy={y + 15.5} r="2.6" fill="#8fd0c4" />
//       {kind === 'kanban' &&
//         [0, 1, 2].map((i) => {
//           const x0 = x + 16 + i * 56;
//           const colors = ['#b79de9', '#f4a6a0', '#8fd0c4'];
//           return (
//             <g key={i}>
//               <rect x={x0} y={y + 30} width="50" height="68" rx="5" fill="#f3edfc" />
//               <rect x={x0 + 5} y={y + 36} width="40" height="14" rx="3" fill={colors[i]} />
//               <rect x={x0 + 5} y={y + 54} width="40" height="14" rx="3" fill="#fff" stroke="#e4d9f6" />
//               {i < 2 && <rect x={x0 + 5} y={y + 72} width="40" height="14" rx="3" fill="#fff" stroke="#e4d9f6" />}
//             </g>
//           );
//         })}
//       {kind === 'chart' && (
//         <g>
//           {[22, 36, 28, 48, 40, 58].map((h, i) => (
//             <rect key={i} x={x + 20 + i * 26} y={y + 98 - h} width="16" height={h} rx="3" fill={i % 2 ? '#d4c3f3' : '#b79de9'} />
//           ))}
//           <polyline
//             points={`${x + 28},${y + 66} ${x + 54},${y + 56} ${x + 80},${y + 62} ${x + 106},${y + 46} ${x + 132},${y + 52} ${x + 158},${y + 38}`}
//             fill="none" stroke="#f4a6a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
//           />
//           <circle cx={x + 158} cy={y + 38} r="4" fill="#f4a6a0" />
//         </g>
//       )}
//       {/* keyboard + mouse */}
//       <rect x={x + 50} y={y + 138} width="90" height="9" rx="3" fill="#e7e0f3" />
//       <ellipse cx={x + 160} cy={y + 142} rx="6" ry="4" fill="#e7e0f3" />
//     </g>
//   );
// }

// function OfficeScene() {
//   return (
//     <svg
//       viewBox="0 0 720 640"
//       preserveAspectRatio="xMinYMax meet"
//       className="absolute left-0 bottom-0 w-full h-full dark:brightness-90 transition"
//       aria-hidden="true"
//     >
//       <defs>
//         <linearGradient id="of-desk" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0" stopColor="#fadfb2" />
//           <stop offset="1" stopColor="#f3cf98" />
//         </linearGradient>
//         <linearGradient id="of-floor" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0" stopColor="#e6dbf4" />
//           <stop offset="1" stopColor="#d9cbee" />
//         </linearGradient>
//         <filter id="of-shadow" x="-15%" y="-15%" width="130%" height="135%">
//           <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6a5a95" floodOpacity="0.18" />
//         </filter>
//       </defs>

//       {/* floor */}
//       <rect x="0" y="560" width="720" height="80" fill="url(#of-floor)" />
//       <rect x="0" y="556" width="720" height="6" fill="#d4c6ea" />

//       {/* wall dashboard */}
//       <g filter="url(#of-shadow)">
//         <rect x="392" y="104" width="250" height="152" rx="12" fill="#3b3552" />
//         <rect x="400" y="112" width="234" height="136" rx="6" fill="#fbf9ff" />
//         <rect x="400" y="112" width="234" height="18" rx="6" fill="#ece3fb" />
//         <rect x="410" y="118" width="60" height="6" rx="3" fill="#b79de9" />
//         {[0, 1, 2].map((i) => (
//           <g key={i}>
//             <rect x={410 + i * 74} y="138" width="66" height="30" rx="6" fill="#f3edfc" />
//             <rect x={418 + i * 74} y="146" width="26" height="5" rx="2.5" fill="#cbb8f0" />
//             <rect x={418 + i * 74} y="156" width="40" height="7" rx="3.5" fill={['#b79de9', '#f4a6a0', '#8fd0c4'][i]} />
//           </g>
//         ))}
//         {[34, 52, 40, 66, 48, 76, 58, 84, 70].map((h, i) => (
//           <rect key={i} x={414 + i * 24} y={240 - h} width="14" height={h} rx="3" fill={i % 2 ? '#d4c3f3' : '#b79de9'} />
//         ))}
//         <polyline
//           points="421,200 445,190 469,196 493,180 517,188 541,168 565,176 589,160 613,152"
//           fill="none" stroke="#f4a6a0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
//         />
//       </g>

//       {/* wall clock */}
//       <g filter="url(#of-shadow)">
//         <circle cx="326" cy="236" r="26" fill="#fffaf5" stroke="#e2d3f2" strokeWidth="5" />
//         <path d="M326 236 V220 M326 236 L338 242" stroke="#4a3d6b" strokeWidth="3" strokeLinecap="round" />
//         <circle cx="326" cy="236" r="2.5" fill="#4a3d6b" />
//       </g>

//       {/* shelf with binders and plant */}
//       <g filter="url(#of-shadow)">
//         <rect x="36" y="268" width="176" height="12" rx="6" fill="#efcea0" />
//         <rect x="46" y="216" width="16" height="52" rx="3" fill="#b79de9" />
//         <rect x="64" y="224" width="14" height="44" rx="3" fill="#f4a6a0" />
//         <rect x="80" y="214" width="18" height="54" rx="3" fill="#f2cf5a" />
//         <rect x="100" y="228" width="14" height="40" rx="3" fill="#8fd0c4" />
//         <rect x="150" y="248" width="34" height="20" rx="7" fill="#e6cfbb" />
//       </g>
//       <g fill="#7fbf7a">
//         <ellipse cx="158" cy="238" rx="7" ry="16" transform="rotate(-25 158 238)" />
//         <ellipse cx="176" cy="238" rx="7" ry="16" transform="rotate(25 176 238)" />
//         <ellipse cx="167" cy="232" rx="8" ry="19" />
//       </g>

//       {/* monitors (far side of the desk) */}
//       <Monitor x={130} kind="kanban" />
//       <Monitor x={430} kind="chart" />

//       {/* desk lamp between stations */}
//       <g>
//         <ellipse cx="385" cy="458" rx="16" ry="4" fill="#4a4363" />
//         <path d="M385 456 L372 410 L398 384" stroke="#4a4363" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M388 376 L414 388 L404 404 L380 392 Z" fill="#f2cf5a" />
//       </g>

//       {/* mug + sticky notes */}
//       <rect x="342" y="434" width="20" height="22" rx="5" fill="#f6b9bd" />
//       <rect x="96" y="440" width="16" height="16" rx="2" fill="#f2cf5a" />
//       <rect x="104" y="436" width="16" height="16" rx="2" fill="#f4a6a0" transform="rotate(8 112 444)" />

//       {/* desk surface + front */}
//       <path d="M-10 462 Q-10 450 10 450 H730 V474 H-10 Z" fill="url(#of-desk)" />
//       <rect x="-10" y="472" width="740" height="12" fill="#e9c28a" />
//       <rect x="-10" y="484" width="740" height="74" fill="#efd2a2" />
//       <rect x="40" y="484" width="12" height="74" fill="#e3bd86" />
//       <rect x="352" y="484" width="12" height="74" fill="#e3bd86" />
//       <rect x="660" y="484" width="12" height="74" fill="#e3bd86" />

//       {/* plant on the floor (left) */}
//       <g filter="url(#of-shadow)">
//         <g fill="#7fbf7a">
//           <ellipse cx="40" cy="470" rx="13" ry="40" transform="rotate(-22 40 470)" />
//           <ellipse cx="62" cy="456" rx="14" ry="46" />
//           <ellipse cx="84" cy="474" rx="12" ry="36" transform="rotate(22 84 474)" />
//         </g>
//         <rect x="32" y="508" width="60" height="52" rx="14" fill="#c9b2f0" />
//       </g>

//       {/* people */}
//       <Worker cx={165} hair="#6b4430" top="#b79de9" topDark="#a38ad8" bun />
//       <Worker cx={470} hair="#2f2a3a" top="#8fb8ea" topDark="#7ba5da" headphones />
//     </svg>
//   );
// }

// export default function PagesView() {
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [authError, setAuthError] = useState(null);

//   // remembered credentials
//   const getRemembered = () => {
//     try {
//       const raw = localStorage.getItem('remembered_credentials');
//       return raw ? JSON.parse(raw) : null;
//     } catch { return null; }
//   };
//   const init = getRemembered();
//   const [rememberMe, setRememberMe] = useState(Boolean(init));
//   const [email, setEmail] = useState(init?.username || init?.email || '');
//   const [password, setPassword] = useState(init?.password || '');

//   const theme = useERPStore((s) => s.theme);
//   const setTheme = useERPStore((s) => s.setTheme);
//   const setAuthData = useERPStore((s) => s.setAuthData);
//   const showToast = useERPStore((s) => s.showToast);
//   const isDark = theme === 'dark';

//   const handleAuthSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setAuthError(null);
//     try {
//       const response = await authService.login(email, password);
//       if (response?.success) {
//         if (rememberMe) {
//           localStorage.setItem('remembered_credentials', JSON.stringify({ username: email, password }));
//         } else {
//           localStorage.removeItem('remembered_credentials');
//         }
//         const menuPages = Array.isArray(response.data?.menuPage)
//           ? response.data.menuPage
//           : Array.isArray(response.menuPage) ? response.menuPage : [];
//         setAuthData({
//           token: response.token?.accessToken,
//           user: response.data?.user,
//           context: response.data?.context,
//           session: response.session,
//           photo: response.photo,
//           userMenu: menuPages,
//           rawResponse: response,
//         });
//         showToast('Login successful! Welcome to Vishvin ERP.', 'success');
//         navigate('/dashboard');
//       } else {
//         setAuthError(response?.message || 'Login failed. Please check your credentials.');
//       }
//     } catch (err) {
//       const msg = err?.data?.message || err?.message || 'Invalid username or password';
//       setAuthError(msg);
//       showToast(msg, 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ---------------- AUTH ROUTE ---------------- */
//   if (pathname.includes('/pages/auth/')) {
//     const fieldWrap =
//       'flex items-center gap-3 h-14 pl-2 pr-3.5 rounded-xl bg-white dark:bg-[#1d1830] ' +
//       'border border-[#e6def4] dark:border-[#3a3157] transition ' +
//       'focus-within:border-[#b8a3e6] focus-within:ring-4 focus-within:ring-[#e6dcf8] dark:focus-within:ring-[#4a3d73]/60';
//     const iconTile =
//       'w-10 h-10 shrink-0 rounded-lg bg-[#eee7fa] dark:bg-[#352c52] flex items-center justify-center text-[#8d72cf] dark:text-[#c3aef0]';

//     return (
//       <div className="min-h-screen w-full flex flex-col font-sans bg-[#ece8f5] dark:bg-[#141022] transition-colors">
//         <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&display=swap');`}</style>
//         {/* ---------- header ---------- */}
//         <header className="w-full px-5 sm:px-8 py-4 grid grid-cols-[1fr_auto_1fr] items-center border-b border-[#ddd5ee] dark:border-[#2c2545] bg-white/60 dark:bg-[#1a1530]/80 backdrop-blur-md">
//           <span aria-hidden="true" />

//           <h1
//             className="text-center text-xl sm:text-2xl lg:text-[28px] font-semibold tracking-wide text-[#4a3d6b] dark:text-[#ece5fb]"
//             style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}
//           >
//             Enterprise Resource Planning
//           </h1>

//           <div className="flex items-center justify-end gap-3">
//             <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3eefc] dark:bg-[#2a2245] text-[11px] font-medium text-[#6b5b95] dark:text-[#cdbff0]">
//               <span className="relative flex w-2 h-2">
//                 <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
//                 <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
//               </span>
//               All systems operational
//             </span>
//             <button
//               type="button"
//               onClick={() => setTheme(isDark ? 'light' : 'dark')}
//               className="p-2 rounded-xl bg-[#f3eefc] dark:bg-[#2a2245] text-[#6b5b95] dark:text-[#e4dcf7] hover:bg-[#e9e0f8] dark:hover:bg-[#352c52] transition cursor-pointer"
//               title="Toggle theme"
//               aria-label="Toggle theme"
//             >
//               {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
//             </button>
//           </div>
//         </header>

//         {/* ---------- main ---------- */}
//         <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6 lg:py-8">
//           <div className="relative w-full max-w-6xl overflow-hidden rounded-[28px] bg-gradient-to-br from-[#fdf1ea] via-[#fbeee8] to-[#f7e7e3] dark:from-[#2a2240] dark:via-[#231c38] dark:to-[#1d1730] shadow-[0_20px_60px_-20px_rgba(110,80,170,0.35)] lg:min-h-[640px] flex flex-col lg:block">
//             {/* scene (desktop only) */}
//             <div className="hidden lg:block absolute inset-y-0 left-0 w-[68%] pointer-events-none">
//               <OfficeScene />
//             </div>

//             {/* welcome copy */}
//             <div className="relative z-10 px-8 sm:px-12 pt-10 lg:pt-10 lg:max-w-[44%]">
//               <h2 className="text-3xl sm:text-4xl font-bold text-[#4a3d6b] dark:text-[#f0eafc] tracking-tight flex items-center gap-2">
//                 Welcome back!
//                 <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
//                   <path d="M12 1l2.6 7.4L22 11l-7.4 2.6L12 21l-2.6-7.4L2 11l7.4-2.6z" fill="#f7cf55" />
//                 </svg>
//               </h2>
//               <p className="mt-3 text-base text-[#5b4f7c] dark:text-[#c9bee6] leading-relaxed max-w-xs">
//                 Log in to continue your journey and get things done.
//               </p>
//             </div>

//             {/* login card */}
//             <div className="relative z-10 w-full lg:w-[40%] lg:absolute lg:right-7 lg:top-7 lg:bottom-7 p-4 sm:p-8 lg:p-0 mt-6 lg:mt-0">
//               <div className="h-full rounded-3xl bg-[#fffaf7] dark:bg-[#251e3b] border border-white/70 dark:border-[#3a3157] shadow-[0_18px_50px_-18px_rgba(110,80,170,0.35)] px-6 sm:px-10 py-10 lg:py-12 flex flex-col">
//                 <h1 className="text-3xl sm:text-[34px] leading-tight font-bold text-center text-[#4a3d6b] dark:text-[#f0eafc]">
//                   Log in to your account
//                 </h1>
//                 <p className="mt-2 text-center text-base text-[#5b4f7c] dark:text-[#bfb3de]">
//                   We’re happy to see you again! <span className="text-[#a58bd9]">💜</span>
//                 </p>

//                 {authError && (
//                   <div role="alert" className="mt-5 p-3 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2.5">
//                     <ShieldAlert className="w-4 h-4 shrink-0" />
//                     <span className="font-medium">{authError}</span>
//                   </div>
//                 )}

//                 <form onSubmit={handleAuthSubmit} className="flex-1 flex flex-col justify-evenly gap-6 mt-6">
//                   <div>
//                     <label htmlFor="login-user" className="block text-sm font-semibold text-[#3b3350] dark:text-[#d9cff3] mb-2">
//                       User name / Email
//                     </label>
//                     <div className={fieldWrap}>
//                       <span className={iconTile}><User className="w-[18px] h-[18px]" /></span>
//                       <input
//                         id="login-user"
//                         type="text"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="Enter your user name"
//                         autoComplete="username"
//                         className="flex-1 min-w-0 bg-transparent text-base text-[#3b3350] dark:text-white placeholder:text-[#a89fbf] focus:outline-none"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label htmlFor="login-pass" className="block text-sm font-semibold text-[#3b3350] dark:text-[#d9cff3] mb-2">
//                       Password
//                     </label>
//                     <div className={fieldWrap}>
//                       <span className={iconTile}><Lock className="w-[18px] h-[18px]" /></span>
//                       <input
//                         id="login-pass"
//                         type={showPassword ? 'text' : 'password'}
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Enter your password"
//                         autoComplete="current-password"
//                         className="flex-1 min-w-0 bg-transparent text-base text-[#3b3350] dark:text-white placeholder:text-[#a89fbf] focus:outline-none"
//                         required
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="p-1 text-[#9a90b3] hover:text-[#6b5b95] dark:hover:text-white"
//                         aria-label={showPassword ? 'Hide password' : 'Show password'}
//                       >
//                         {showPassword ? <Eye className="w-[18px] h-[18px]" /> : <EyeOff className="w-[18px] h-[18px]" />}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-sm">
//                     <label className="flex items-center gap-2 cursor-pointer text-[#6b5f88] dark:text-[#bfb3de]">
//                       <input
//                         type="checkbox"
//                         checked={rememberMe}
//                         onChange={(e) => {
//                           setRememberMe(e.target.checked);
//                           if (!e.target.checked) localStorage.removeItem('remembered_credentials');
//                         }}
//                         className="w-4 h-4 rounded accent-[#a58bd9]"
//                       />
//                       Keep me signed in
//                     </label>
//                     <button
//                       type="button"
//                       onClick={() => navigate('/pages/auth/forgot-password')}
//                       className="font-medium text-[#8a6fd0] dark:text-[#c3aef0] hover:underline"
//                     >
//                       Forgot your password?
//                     </button>
//                   </div>

//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full h-14 rounded-xl bg-gradient-to-b from-[#b7a0e8] to-[#9d82d6] hover:from-[#ad94e2] hover:to-[#8f73cc] disabled:opacity-70 text-white text-base font-semibold shadow-[0_6px_14px_-4px_rgba(140,110,210,0.6),inset_0_-3px_0_rgba(90,60,150,0.25)] flex items-center justify-center gap-2 transition active:translate-y-px cursor-pointer"
//                   >
//                     {loading ? (<><RefreshCw className="w-4 h-4 animate-spin" /> Logging in…</>) : 'Log in'}
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </main>

//         {/* ---------- footer ---------- */}
//         <footer className="w-full px-5 sm:px-8 py-3.5 border-t border-[#ddd5ee] dark:border-[#2c2545] bg-white/60 dark:bg-[#1a1530]/80 backdrop-blur-md">
//           <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs text-[#7a6f99] dark:text-[#a99dc9]">
//             <span className="flex items-center gap-1.5">
//               <ShieldCheck className="w-3.5 h-3.5 text-[#8a6fd0] dark:text-[#c3aef0]" />
//               Encrypted session · Role-based access
//             </span>
//             <span>© 2026 All rights reserved.</span>
//           </div>
//         </footer>
//       </div>
//     );
//   }

//   /* ---------------- ERROR ROUTES ---------------- */
//   if (pathname.includes('/pages/error/')) {
//     const is404 = pathname.includes('/404');
//     const is403 = pathname.includes('/403');
//     const is500 = pathname.includes('/500');
//     const isMaint = pathname.includes('/maintenance');
//     const isSoon = pathname.includes('/coming-soon');

//     return (
//       <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-[#080d1a] text-white' : 'bg-[#edf3fb] text-slate-900'}`}>
//         <div className="relative text-center max-w-md mx-auto p-10 rounded-3xl bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
//           <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
//             {isMaint ? <RefreshCw className="w-9 h-9 text-blue-500 animate-spin" /> : <ShieldAlert className="w-9 h-9 text-rose-500" />}
//           </div>
//           {is404 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">404</h2><p className="font-extrabold">Page Not Found</p></>)}
//           {is403 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-600">403</h2><p className="font-extrabold">Access Denied</p></>)}
//           {is500 && (<><h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">500</h2><p className="font-extrabold">Server Error</p></>)}
//           {isMaint && (<><div className="text-5xl">🔧</div><p className="text-xl font-extrabold">Under Maintenance</p></>)}
//           {isSoon && (<><div className="text-5xl">🚀</div><p className="text-xl font-extrabold">Coming Soon</p></>)}
//           <div className="flex justify-center gap-3 pt-2">
//             <button onClick={() => navigate(-1)} className="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">← Go Back</button>
//             <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Dashboard</button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /* ---------------- UTILITIES ---------------- */
//   return (
//     <div className="space-y-6">
//       <div className="pb-5 border-b border-slate-200 dark:border-slate-800">
//         <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
//           <Activity className="w-5 h-5 text-blue-600" /> Utility Systems
//         </h2>
//         <p className="text-xs text-slate-500 mt-1">Operational support widgets and cloud diagnostics.</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between h-48">
//           <h5 className="font-bold text-slate-900 dark:text-slate-50 text-sm">System Heartbeat</h5>
//           <div className="flex items-center gap-2">
//             <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
//             <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">All services active</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }