import React from 'react';

export default function LoginIllustration({ className = '' }) {
  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 680 620"
        className="w-full h-full max-h-[580px] object-contain drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Card & Drop Shadows */}
          <filter id="illShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.18" />
          </filter>
          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0284c7" floodOpacity="0.22" />
          </filter>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Linear Gradients */}
          <linearGradient id="pieGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#84cc16" />
            <stop offset="100%" stopColor="#65a30d" />
          </linearGradient>
          <linearGradient id="pieOrange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="pieBlue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>

          <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="deskGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Ambient Concentric Radar Rings */}
        <g opacity="0.14">
          <circle cx="280" cy="350" r="130" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="280" cy="350" r="190" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="280" cy="350" r="250" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx="280" cy="350" r="310" stroke="#ffffff" strokeWidth="1.5" />
        </g>

        {/* Ambient Glow Orbs */}
        <circle cx="160" cy="180" r="40" fill="#ffffff" opacity="0.08" filter="url(#glowFilter)" />
        <circle cx="430" cy="190" r="50" fill="#ffffff" opacity="0.07" filter="url(#glowFilter)" />
        <circle cx="300" cy="390" r="70" fill="#38bdf8" opacity="0.1" filter="url(#glowFilter)" />

        {/* ========================================================= */}
        {/* TOP LEFT: Cloud 1 & Wifi Rainbow Arc                       */}
        {/* ========================================================= */}
        <g transform="translate(100, 115)" filter="url(#softShadow)">
          {/* Wifi / Rainbow Arcs */}
          <path d="M42 22 A 22 22 0 0 1 70 22" fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
          <path d="M47 27 A 16 16 0 0 1 65 27" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
          <path d="M52 32 A 10 10 0 0 1 60 32" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />

          {/* Cloud Body */}
          <path
            d="M20 50 C12 50 6 44 6 36 C6 29 11 23 18 22 C21 13 30 7 40 7 C52 7 62 15 63 27 C69 27 75 32 75 38 C75 45 69 50 62 50 Z"
            fill="#ffffff"
            opacity="0.95"
          />
        </g>

        {/* MID LEFT: Cloud 2 */}
        <g transform="translate(115, 205)" opacity="0.9" filter="url(#softShadow)">
          <path
            d="M15 38 C9 38 4 33 4 27 C4 22 8 18 13 17 C15 10 22 5 30 5 C39 5 47 11 48 20 C53 20 57 24 57 29 C57 34 52 38 47 38 Z"
            fill="#ffffff"
          />
        </g>

        {/* ========================================================= */}
        {/* TOP CENTER: Floating Dashboard / Browser Window            */}
        {/* ========================================================= */}
        <g transform="translate(180, 85)" filter="url(#illShadow)">
          {/* Card Base */}
          <rect x="0" y="0" width="180" height="116" rx="10" fill="#ffffff" />
          {/* Blue Header Bar */}
          <path d="M0 10 C0 4.5 4.5 0 10 0 L170 0 C175.5 0 180 4.5 180 10 L180 32 L0 32 Z" fill="#2563eb" />
          {/* 3 Header Dots */}
          <circle cx="16" cy="16" r="3.5" fill="#ffffff" opacity="0.9" />
          <circle cx="28" cy="16" r="3.5" fill="#93c5fd" opacity="0.9" />
          <circle cx="40" cy="16" r="3.5" fill="#93c5fd" opacity="0.9" />

          {/* Inside Graphic: Stylized Business/App Motif */}
          <g transform="translate(38, 38)">
            {/* T-Shirt / Folder App Icon Graphic (matches screenshot) */}
            <path
              d="M18 4 L42 4 L54 18 L46 25 L38 20 L38 62 L18 62 L18 20 L10 25 L2 18 Z"
              fill="#2563eb"
            />
            {/* Inner accent cutout */}
            <path
              d="M24 16 L32 16 L32 56 L24 56 Z"
              fill="#ffffff"
              opacity="0.35"
            />
            <path
              d="M26 4 C26 9 34 9 34 4"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </g>

          {/* Right mini list indicators inside the window */}
          <g transform="translate(108, 48)">
            <rect x="0" y="0" width="56" height="6" rx="3" fill="#cbd5e1" />
            <rect x="0" y="14" width="44" height="6" rx="3" fill="#e2e8f0" />
            <rect x="0" y="28" width="52" height="6" rx="3" fill="#e2e8f0" />
            <rect x="0" y="42" width="36" height="6" rx="3" fill="#93c5fd" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* TOP RIGHT: Floating 3D Pie Chart                          */}
        {/* ========================================================= */}
        <g transform="translate(380, 130)" filter="url(#illShadow)">
          {/* 3D Extruded Pie Bottom Rim for Green Wedge */}
          <path
            d="M 50 50 L 50 62 A 45 45 0 0 0 95 62 L 95 50 Z"
            fill="#4d7c0f"
          />
          {/* Lime Green Top Segment (~65%) */}
          <path
            d="M 50 50 L 50 5 A 45 45 0 1 1 5 50 Z"
            fill="url(#pieGreen)"
          />
          {/* 3D Extruded Depth for Orange Slice */}
          <path
            d="M 50 50 L 50 62 L 15 80 L 15 68 Z"
            fill="#c2410c"
          />
          {/* Orange Slice (~35%) */}
          <path
            d="M 50 50 L 5 50 A 45 45 0 0 1 50 5 Z"
            fill="url(#pieOrange)"
          />
          {/* Slice separation line */}
          <path d="M 50 50 L 50 5" stroke="#ffffff" strokeWidth="2" />
          <path d="M 50 50 L 5 50" stroke="#ffffff" strokeWidth="2" />
        </g>

        {/* ========================================================= */}
        {/* BACKGROUND ANALYTICS CARD (behind desk)                   */}
        {/* ========================================================= */}
        <g transform="translate(255, 215)" filter="url(#illShadow)">
          {/* Card Body */}
          <rect x="0" y="0" width="168" height="92" rx="8" fill="#ffffff" />
          {/* Top subtle bar */}
          <path d="M0 6 C0 2.7 2.7 0 6 0 L162 0 C165.3 0 168 2.7 168 6 L168 18 L0 18 Z" fill="#f1f5f9" />
          <rect x="10" y="7" width="30" height="4" rx="2" fill="#94a3b8" />
          <rect x="46" y="7" width="16" height="4" rx="2" fill="#cbd5e1" />

          {/* Bar Chart Bars (vibrant blue/cyan, rising pattern) */}
          <g transform="translate(16, 28)">
            {/* Horizontal guide lines */}
            <line x1="0" y1="12" x2="136" y2="12" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="28" x2="136" y2="28" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="0" y1="44" x2="136" y2="44" stroke="#f1f5f9" strokeWidth="1" />

            {/* 9 Bars */}
            <rect x="0" y="24" width="8" height="26" rx="2" fill="url(#barGrad)" />
            <rect x="15" y="14" width="8" height="36" rx="2" fill="url(#barGrad)" />
            <rect x="30" y="22" width="8" height="28" rx="2" fill="url(#barGrad)" />
            <rect x="45" y="8" width="8" height="42" rx="2" fill="url(#barGrad)" />
            <rect x="60" y="16" width="8" height="34" rx="2" fill="url(#barGrad)" />
            <rect x="75" y="4" width="8" height="46" rx="2" fill="url(#barGrad)" />
            <rect x="90" y="12" width="8" height="38" rx="2" fill="url(#barGrad)" />
            <rect x="105" y="2" width="8" height="48" rx="2" fill="url(#barGrad)" />
            <rect x="120" y="10" width="8" height="40" rx="2" fill="url(#barGrad)" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* ISOMETRIC FLOOR PLATFORM & PERSPECTIVE TILES              */}
        {/* ========================================================= */}
        <g id="floorPlatform">
          {/* Platform 3D Edge / Bevel */}
          <path
            d="M 100 375 L 290 465 L 290 478 L 100 388 Z"
            fill="#94a3b8"
          />
          <path
            d="M 290 465 L 470 375 L 470 388 L 290 478 Z"
            fill="#64748b"
          />

          {/* Platform Top Face */}
          <polygon
            points="280,270 470,375 290,465 100,375"
            fill="#dbe4ef"
            filter="url(#illShadow)"
          />

          {/* Isometric Tile Grid Lines */}
          <g stroke="#cbd5e1" strokeWidth="1.5" opacity="0.85">
            {/* Left-to-right diagonal lines */}
            <line x1="138" y1="354" x2="318" y2="444" />
            <line x1="176" y1="333" x2="356" y2="423" />
            <line x1="214" y1="312" x2="394" y2="402" />
            <line x1="252" y1="291" x2="432" y2="381" />

            {/* Right-to-left diagonal lines */}
            <line x1="318" y1="291" x2="138" y2="396" />
            <line x1="356" y1="312" x2="176" y2="417" />
            <line x1="394" y1="333" x2="214" y2="438" />
            <line x1="432" y1="354" x2="252" y2="459" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* OFFICE DESK & LAPTOP                                      */}
        {/* ========================================================= */}
        <g id="officeDesk">
          {/* Desk shadow on floor */}
          <polygon
            points="210,380 320,380 340,410 230,410"
            fill="#0f172a"
            opacity="0.12"
          />

          {/* Desk Legs (dark metal) */}
          <rect x="220" y="355" width="6" height="52" rx="2" fill="#334155" />
          <rect x="245" y="360" width="5" height="42" rx="2" fill="#475569" />
          <rect x="305" y="355" width="6" height="52" rx="2" fill="#334155" />
          <rect x="325" y="360" width="5" height="42" rx="2" fill="#475569" />

          {/* Desk Surface (Isometric Top) */}
          <polygon
            points="230,340 330,340 320,364 210,364"
            fill="url(#deskGrad)"
            stroke="#cbd5e1"
            strokeWidth="1"
          />
          {/* Desk front edge bevel */}
          <polygon
            points="210,364 320,364 320,370 210,370"
            fill="#cbd5e1"
          />

          {/* LAPTOP on Desk */}
          <g transform="translate(236, 332)">
            {/* Laptop Base */}
            <polygon points="12,18 42,18 39,26 8,26" fill="#94a3b8" />
            {/* Laptop Screen Open at Angle */}
            <polygon
              points="10,2 40,2 42,18 12,18"
              fill="#2563eb"
              stroke="#1d4ed8"
              strokeWidth="1.5"
            />
            {/* Glowing Screen Content */}
            <polygon
              points="12,4 38,4 40,16 14,16"
              fill="#60a5fa"
            />
            {/* Mini dashboard lines on laptop screen */}
            <line x1="16" y1="8" x2="34" y2="8" stroke="#ffffff" strokeWidth="1.2" />
            <line x1="16" y1="12" x2="28" y2="12" stroke="#ffffff" strokeWidth="1.2" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* MODERN ERGONOMIC CHAIR (Warm Orange)                     */}
        {/* ========================================================= */}
        <g id="orangeChair" transform="translate(182, 320)">
          {/* Chair Shadow on Floor */}
          <ellipse cx="25" cy="98" rx="26" ry="12" fill="#0f172a" opacity="0.14" />

          {/* Chair Base & Casters */}
          <path d="M25 80 L25 94" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          <line x1="10" y1="94" x2="40" y2="94" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          <line x1="16" y1="90" x2="34" y2="98" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="10" cy="95" r="2.5" fill="#0f172a" />
          <circle cx="40" cy="95" r="2.5" fill="#0f172a" />

          {/* Chair Seat Cushion */}
          <path
            d="M6 56 C6 50 14 46 28 46 C42 46 48 50 48 56 C48 64 40 68 28 68 C14 68 6 64 6 56 Z"
            fill="url(#pieOrange)"
          />
          {/* Seat Cushion highlight */}
          <ellipse cx="28" cy="54" rx="16" ry="6" fill="#fb923c" opacity="0.6" />

          {/* Backrest (Ergonomic curve) */}
          <path
            d="M4 14 C4 4 10 0 16 0 C22 0 24 6 24 18 L24 46 C24 50 18 52 14 52 L8 50 C5 48 4 30 4 14 Z"
            fill="#ea580c"
          />
          <path
            d="M8 12 C8 6 12 3 16 3 C20 3 21 8 21 16 L21 44 C21 47 18 48 15 48 L10 46 C8 44 8 26 8 12 Z"
            fill="#fb923c"
          />

          {/* Left Armrest */}
          <path
            d="M12 36 L24 36 C28 36 30 40 30 44 L30 52"
            fill="none"
            stroke="#ea580c"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>

        {/* ========================================================= */}
        {/* WOMAN WORKING AT THE DESK                                 */}
        {/* ========================================================= */}
        <g id="personWorking" transform="translate(192, 290)">
          {/* Hair (Sleek dark bob/style) */}
          <path
            d="M20 2 C10 2 6 10 6 18 C6 28 10 32 16 34 L16 38 L24 38 L24 30 C30 30 32 24 32 16 C32 8 28 2 20 2 Z"
            fill="#334155"
          />

          {/* Face & Ear */}
          <path
            d="M18 14 C18 10 22 8 26 8 C29 8 32 11 32 16 C32 22 28 26 22 26 L18 26 Z"
            fill="#fed7aa"
          />
          {/* Eye & Brow suggestion */}
          <circle cx="27" cy="15" r="1.5" fill="#475569" />

          {/* Neck */}
          <rect x="20" y="24" width="6" height="8" rx="2" fill="#fdba74" />

          {/* Torso / Royal Blue Blazer */}
          <path
            d="M14 30 C18 28 26 28 32 30 L40 50 C40 58 36 66 32 72 L16 72 C12 66 10 56 10 48 Z"
            fill="#2563eb"
          />
          {/* Blazer Collar lapel */}
          <path d="M22 30 L25 44 L20 44 Z" fill="#1d4ed8" />

          {/* Left Arm extended typing on laptop */}
          <path
            d="M28 38 L48 48 C54 51 60 48 64 45 L68 45"
            fill="none"
            stroke="#2563eb"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Hand on Keyboard */}
          <ellipse cx="69" cy="45" rx="3.5" ry="2.5" fill="#fed7aa" />

          {/* Legs / Slate Trousers seated */}
          <path
            d="M16 70 L34 70 C38 70 42 74 42 78 L42 98 C42 102 38 105 34 105 L26 105 L22 86 L14 86 Z"
            fill="#1e293b"
          />
          {/* Shoes */}
          <ellipse cx="36" cy="106" rx="6" ry="3.5" fill="#0f172a" />
        </g>

        {/* ========================================================= */}
        {/* INDOOR POTTED PLANT (Lush foliage in terracotta cylinder)  */}
        {/* ========================================================= */}
        <g id="pottedPlant" transform="translate(345, 305)" filter="url(#illShadow)">
          {/* Pot Shadow on Floor */}
          <ellipse cx="22" cy="115" rx="16" ry="7" fill="#0f172a" opacity="0.18" />

          {/* Pot Base & Cylinder Body */}
          <path
            d="M8 82 L10 112 C10 115 15 118 22 118 C29 118 34 115 34 112 L36 82 Z"
            fill="url(#potGrad)"
          />
          {/* Pot Rim */}
          <ellipse cx="22" cy="82" rx="15" ry="5.5" fill="#ea580c" />
          <ellipse cx="22" cy="81.5" rx="13.5" ry="4.5" fill="#c2410c" />
          {/* Soil */}
          <ellipse cx="22" cy="82" rx="12" ry="3.5" fill="#451a03" />

          {/* Foliage / Multi-layered Green Leaves */}
          {/* Leaf 1 (Left background) */}
          <path
            d="M20 80 C8 60 2 40 10 22 C18 40 24 60 22 80 Z"
            fill="#15803d"
          />
          <path d="M12 28 C16 48 20 66 21 80" stroke="#86efac" strokeWidth="1" opacity="0.6" />

          {/* Leaf 2 (Center tall) */}
          <path
            d="M22 80 C15 50 16 20 23 2 C30 20 31 50 24 80 Z"
            fill="#16a34a"
          />
          <path d="M23 4 C24 28 23 58 23 80" stroke="#bbf7d0" strokeWidth="1.2" opacity="0.7" />

          {/* Leaf 3 (Right high) */}
          <path
            d="M24 80 C26 58 35 34 44 18 C46 36 38 60 26 80 Z"
            fill="#22c55e"
          />
          <path d="M42 22 C34 42 28 64 25 80" stroke="#86efac" strokeWidth="1" opacity="0.6" />

          {/* Leaf 4 (Front left fanned) */}
          <path
            d="M20 82 C4 72 -6 56 0 42 C10 54 18 68 21 82 Z"
            fill="#16a34a"
          />
          <path d="M1 44 C8 58 15 70 20 82" stroke="#bbf7d0" strokeWidth="1" opacity="0.6" />

          {/* Leaf 5 (Front right broad leaf) */}
          <path
            d="M24 82 C34 74 46 62 48 48 C42 60 32 72 23 82 Z"
            fill="#4ade80"
          />
          <path d="M46 50 C38 62 30 74 24 82" stroke="#ffffff" strokeWidth="1" opacity="0.7" />

          {/* Leaf 6 (Center bright highlight leaf) */}
          <path
            d="M22 82 C16 68 18 52 24 38 C28 52 28 68 23 82 Z"
            fill="#22c55e"
          />
        </g>

        {/* ========================================================= */}
        {/* ISOMETRIC MAGNIFYING GLASS (Floating mid-left)            */}
        {/* ========================================================= */}
        <g id="magnifier" filter="url(#illShadow)">
          {/* Blue Handle */}
          <line
            x1="184"
            y1="288"
            x2="134"
            y2="338"
            stroke="#0284c7"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Handle grip highlight */}
          <line
            x1="180"
            y1="292"
            x2="140"
            y2="332"
            stroke="#38bdf8"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Glass Lens (Isometric Ring) */}
          <circle
            cx="205"
            cy="265"
            r="32"
            fill="url(#glassGrad)"
            stroke="#0284c7"
            strokeWidth="7"
          />
          {/* Lens Glass Glare Shine */}
          <path
            d="M188 250 A 24 24 0 0 1 222 245"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Ambient Tiny Sparkles */}
        <g fill="#ffffff" opacity="0.7">
          <circle cx="160" cy="110" r="2" />
          <circle cx="340" cy="90" r="1.5" />
          <circle cx="450" cy="270" r="2.5" />
          <circle cx="105" cy="300" r="1.8" />
          <circle cx="280" cy="170" r="1.5" />
          <circle cx="430" cy="115" r="2" />
        </g>
      </svg>
    </div>
  );
}
