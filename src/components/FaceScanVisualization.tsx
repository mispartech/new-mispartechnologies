import React, { useState, useEffect } from 'react';

type ScanState = 'detecting' | 'recognized' | 'saved';

const stateConfig = {
  detecting: {
    color: 'hsl(190 90% 50%)',    // cyan
    glowColor: 'hsl(190 90% 50%)',
    label: 'Detecting Face...',
    confidence: '0.72',
    tailwindGlow: 'bg-cyan/5',
    tailwindGlow2: 'bg-cyan/3',
  },
  recognized: {
    color: 'hsl(45 100% 60%)',    // warm amber
    glowColor: 'hsl(45 100% 60%)',
    label: 'Face Recognized',
    confidence: '0.96',
    tailwindGlow: 'bg-amber-400/5',
    tailwindGlow2: 'bg-amber-400/3',
  },
  saved: {
    color: 'hsl(142 70% 50%)',    // green
    glowColor: 'hsl(142 70% 50%)',
    label: 'Identity Verified ✓',
    confidence: '0.99',
    tailwindGlow: 'bg-emerald-400/5',
    tailwindGlow2: 'bg-emerald-400/3',
  },
};

const FaceScanVisualization = () => {
  const [scanState, setScanState] = useState<ScanState>('detecting');

  useEffect(() => {
    const cycle = () => {
      setScanState('detecting');
      const t1 = setTimeout(() => setScanState('recognized'), 3000);
      const t2 = setTimeout(() => setScanState('saved'), 5500);
      const t3 = setTimeout(() => setScanState('detecting'), 8000);
      return [t1, t2, t3];
    };

    let timers = cycle();
    const interval = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = cycle();
    }, 8000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const config = stateConfig[scanState];
  const c = config.color;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
      
      {/* Subtle radial glow - changes with state */}
      <div 
        className="absolute top-1/2 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] -translate-y-1/2 rounded-full blur-[60px] md:blur-[100px] transition-colors duration-1000"
        style={{ backgroundColor: `${c.replace(')', ' / 0.05)')}` }}
      />
      <div 
        className="absolute bottom-0 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full blur-[50px] md:blur-[80px] transition-colors duration-1000"
        style={{ backgroundColor: `${c.replace(')', ' / 0.03)')}` }}
      />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-[0.04] md:opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={c} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanning line animation */}
      <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2">
        <div 
          className="scan-line absolute w-[200px] md:w-[600px] h-[2px] left-1/2 -translate-x-1/2 opacity-20 md:opacity-40 transition-colors duration-1000"
          style={{ background: `linear-gradient(to right, transparent, ${c}, transparent)` }}
        />
      </div>

      {/* Face detection frame — desktop only */}
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[320px] h-[400px] hidden lg:block">
        {/* Corner brackets with state-based color */}
        {[
          { pos: 'top-0 left-0', border: 'border-l-2 border-t-2', delay: '0s' },
          { pos: 'top-0 right-0', border: 'border-r-2 border-t-2', delay: '0.2s' },
          { pos: 'bottom-0 left-0', border: 'border-l-2 border-b-2', delay: '0.4s' },
          { pos: 'bottom-0 right-0', border: 'border-r-2 border-b-2', delay: '0.6s' },
        ].map((corner, i) => (
          <div
            key={i}
            className={`absolute ${corner.pos} w-12 h-12 ${corner.border} animate-pulse transition-colors duration-700`}
            style={{ borderColor: `${c.replace(')', ' / 0.6)')}`, animationDelay: corner.delay }}
          />
        ))}

        {/* Friendly face SVG — softer, rounder, welcoming */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head outline — softer ellipse */}
          <ellipse cx="160" cy="165" rx="90" ry="110" stroke={c} strokeWidth="1.2" opacity="0.3" className="transition-all duration-700">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Hair line — gives a friendly silhouette */}
          <path d="M70 145 Q80 70 160 55 Q240 70 250 145" stroke={c} strokeWidth="0.8" opacity="0.15" />
          
          {/* Jaw / chin — smoother curve */}
          <path d="M70 185 Q85 290 160 315 Q235 290 250 185" stroke={c} strokeWidth="0.8" opacity="0.2">
            <animate attributeName="opacity" values="0.15;0.25;0.15" dur="4s" repeatCount="indefinite" />
          </path>
          
          {/* Left eye — friendly almond shape */}
          <path d="M110 152 Q125 140 140 152 Q125 162 110 152" stroke={c} strokeWidth="1" opacity="0.4" fill="none" />
          {/* Left iris */}
          <circle cx="125" cy="152" r="5" stroke={c} strokeWidth="0.8" opacity="0.35" fill="none" />
          <circle cx="125" cy="152" r="2" fill={c} opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Right eye — friendly almond shape */}
          <path d="M180 152 Q195 140 210 152 Q195 162 180 152" stroke={c} strokeWidth="1" opacity="0.4" fill="none" />
          {/* Right iris */}
          <circle cx="195" cy="152" r="5" stroke={c} strokeWidth="0.8" opacity="0.35" fill="none" />
          <circle cx="195" cy="152" r="2" fill={c} opacity="0.5">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
          </circle>
          
          {/* Eyebrows — gentle arcs */}
          <path d="M108 138 Q125 128 142 136" stroke={c} strokeWidth="0.8" opacity="0.25" fill="none" />
          <path d="M178 136 Q195 128 212 138" stroke={c} strokeWidth="0.8" opacity="0.25" fill="none" />
          
          {/* Nose — subtle gentle shape */}
          <path d="M160 170 L156 202 Q160 210 164 202 L160 170" stroke={c} strokeWidth="0.6" opacity="0.2" fill="none" />
          
          {/* Smile — warm, welcoming */}
          <path d="M130 240 Q145 260 160 262 Q175 260 190 240" stroke={c} strokeWidth="1" opacity="0.35" fill="none">
            <animate attributeName="opacity" values="0.25;0.45;0.25" dur="3s" repeatCount="indefinite" />
          </path>
          
          {/* Ears */}
          <path d="M70 140 Q58 160 65 185" stroke={c} strokeWidth="0.6" opacity="0.15" fill="none" />
          <path d="M250 140 Q262 160 255 185" stroke={c} strokeWidth="0.6" opacity="0.15" fill="none" />
          
          {/* Neck */}
          <line x1="140" y1="315" x2="135" y2="375" stroke={c} strokeWidth="0.5" opacity="0.12" />
          <line x1="180" y1="315" x2="185" y2="375" stroke={c} strokeWidth="0.5" opacity="0.12" />
          {/* Shoulders hint */}
          <path d="M135 375 Q100 380 70 400" stroke={c} strokeWidth="0.5" opacity="0.1" fill="none" />
          <path d="M185 375 Q220 380 250 400" stroke={c} strokeWidth="0.5" opacity="0.1" fill="none" />
        </svg>

        {/* cvzone-style detection rectangles with state colors */}
        <div className="absolute border rounded-sm transition-colors duration-700" style={{ top: '32%', left: '24%', width: '22%', height: '10%', borderColor: `${c.replace(')', ' / 0.4)')}` }}>
          <div className="absolute -top-4 left-0 text-[9px] font-mono transition-colors duration-700" style={{ color: `${c.replace(')', ' / 0.5)')}` }}>L_EYE {config.confidence}</div>
        </div>
        <div className="absolute border rounded-sm transition-colors duration-700" style={{ top: '32%', right: '24%', width: '22%', height: '10%', borderColor: `${c.replace(')', ' / 0.4)')}` }}>
          <div className="absolute -top-4 right-0 text-[9px] font-mono transition-colors duration-700" style={{ color: `${c.replace(')', ' / 0.5)')}` }}>R_EYE {config.confidence}</div>
        </div>
        <div className="absolute border rounded-sm transition-colors duration-700" style={{ top: '42%', left: '40%', width: '20%', height: '15%', borderColor: `${c.replace(')', ' / 0.3)')}` }}>
          <div className="absolute -top-4 left-0 text-[9px] font-mono transition-colors duration-700" style={{ color: `${c.replace(')', ' / 0.5)')}` }}>NOSE {config.confidence}</div>
        </div>
        <div className="absolute border rounded-sm transition-colors duration-700" style={{ top: '54%', left: '33%', width: '34%', height: '10%', borderColor: `${c.replace(')', ' / 0.3)')}` }}>
          <div className="absolute -bottom-4 left-0 text-[9px] font-mono transition-colors duration-700" style={{ color: `${c.replace(')', ' / 0.5)')}` }}>MOUTH {config.confidence}</div>
        </div>

        {/* Face landmark dots */}
        <div className="absolute inset-0">
          {[
            { top: '35%', left: '30%', size: 'w-2 h-2', delay: '0s' },
            { top: '35%', right: '30%', size: 'w-2 h-2', delay: '0.3s' },
            { top: '50%', left: '50%', size: 'w-1.5 h-1.5', delay: '0.5s', transform: '-translate-x-1/2' },
            { top: '65%', left: '35%', size: 'w-1.5 h-1.5', delay: '0.7s' },
            { top: '65%', right: '35%', size: 'w-1.5 h-1.5', delay: '0.9s' },
          ].map((dot, i) => (
            <div
              key={i}
              className={`absolute ${dot.size} rounded-full animate-ping transition-colors duration-700 ${dot.transform || ''}`}
              style={{
                top: dot.top,
                left: dot.left,
                right: dot.right,
                backgroundColor: c,
                boxShadow: `0 0 10px ${c}`,
                animationDuration: '2s',
                animationDelay: dot.delay,
              }}
            />
          ))}
        </div>

        {/* Connecting mesh lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 transition-colors duration-700" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[
            [30, 35, 70, 35],
            [30, 35, 50, 50],
            [70, 35, 50, 50],
            [50, 50, 35, 65],
            [50, 50, 65, 65],
            [35, 65, 65, 65],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.3" className="animate-pulse" />
          ))}
        </svg>

        {/* Main bounding box label — cvzone style top bar */}
        <div className="absolute -top-7 left-0 right-0 flex items-center">
          <div 
            className="backdrop-blur-sm px-2 py-0.5 rounded-t-sm border border-b-0 transition-all duration-700"
            style={{ 
              backgroundColor: `${c.replace(')', ' / 0.2)')}`,
              borderColor: `${c.replace(')', ' / 0.3)')}`,
            }}
          >
            <span className="text-[10px] font-mono transition-colors duration-700" style={{ color: c }}>
              FACE_0 conf:{config.confidence} — {config.label}
            </span>
          </div>
        </div>

        {/* Orbiting particle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit">
            <div 
              className="w-1.5 h-1.5 rounded-full transition-colors duration-700"
              style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
            />
          </div>
        </div>
      </div>

      {/* Status indicator - desktop only */}
      <div className="absolute top-1/2 right-[5%] -translate-y-1/2 hidden xl:block">
        <div className="space-y-3 text-xs font-inter text-white/50">
          {[
            { label: 'Face Detected', state: 'detecting' as ScanState, delay: '0.5s' },
            { label: 'Identity Matched', state: 'recognized' as ScanState, delay: '0.8s' },
            { label: 'Record Saved', state: 'saved' as ScanState, delay: '1.1s' },
          ].map((item) => {
            const isActive = scanState === item.state || 
              (item.state === 'detecting' && (scanState === 'recognized' || scanState === 'saved')) ||
              (item.state === 'recognized' && scanState === 'saved');
            return (
              <div key={item.label} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: item.delay }}>
                <div 
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${isActive ? 'animate-pulse scale-125' : 'opacity-40'}`}
                  style={{ backgroundColor: isActive ? stateConfig[item.state].color : 'hsl(210 15% 45%)' }}
                />
                <span className={`transition-colors duration-700 ${isActive ? 'text-white/80' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full animate-float transition-colors duration-1000"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
            backgroundColor: `${c.replace(')', ' / 0.3)')}`,
          }}
        />
      ))}
    </div>
  );
};

export default FaceScanVisualization;
