import React, { useState, useEffect } from 'react';

type ScanState = 'detecting' | 'recognized' | 'saved';

const stateConfig = {
  detecting: {
    color: 'hsl(190 90% 50%)',
    label: 'Detecting Face...',
    confidence: '72%',
    name: '',
  },
  recognized: {
    color: 'hsl(45 100% 60%)',
    label: 'Face Recognized',
    confidence: '96%',
    name: 'Adaeze Okonkwo',
  },
  saved: {
    color: 'hsl(142 70% 50%)',
    label: 'Attendance Saved ✓',
    confidence: '99%',
    name: 'Adaeze Okonkwo',
  },
};

const FaceScanVisualization = () => {
  const [scanState, setScanState] = useState<ScanState>('detecting');

  useEffect(() => {
    const cycle = () => {
      setScanState('detecting');
      const t1 = setTimeout(() => setScanState('recognized'), 4000);
      const t2 = setTimeout(() => setScanState('saved'), 8000);
      const t3 = setTimeout(() => setScanState('detecting'), 12000);
      return [t1, t2, t3];
    };

    let timers = cycle();
    const interval = setInterval(() => {
      timers.forEach(clearTimeout);
      timers = cycle();
    }, 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const config = stateConfig[scanState];
  const c = config.color;

  // Gender-neutral, friendly face SVG
  const FaceSVG = ({ size = 320 }: { size?: number }) => {
    const scale = size / 320;
    return (
      <svg
        width={size}
        height={size * 1.25}
        viewBox="0 0 320 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-1000"
      >
        {/* Head — round, gender-neutral */}
        <ellipse cx="160" cy="175" rx="95" ry="115" stroke={c} strokeWidth="1" opacity="0.25">
          <animate attributeName="opacity" values="0.2;0.35;0.2" dur="4s" repeatCount="indefinite" />
        </ellipse>

        {/* Left eye — simple friendly oval */}
        <ellipse cx="125" cy="160" rx="16" ry="10" stroke={c} strokeWidth="0.8" opacity="0.35" />
        <circle cx="125" cy="160" r="4" fill={c} opacity="0.4">
          <animate attributeName="opacity" values="0.25;0.5;0.25" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Right eye */}
        <ellipse cx="195" cy="160" rx="16" ry="10" stroke={c} strokeWidth="0.8" opacity="0.35" />
        <circle cx="195" cy="160" r="4" fill={c} opacity="0.4">
          <animate attributeName="opacity" values="0.25;0.5;0.25" dur="3s" begin="0.4s" repeatCount="indefinite" />
        </circle>

        {/* Nose — minimal line */}
        <path d="M160 185 L157 210 Q160 215 163 210 Z" stroke={c} strokeWidth="0.6" opacity="0.2" fill="none" />

        {/* Smile */}
        <path d="M135 245 Q148 262 160 264 Q172 262 185 245" stroke={c} strokeWidth="0.9" opacity="0.3" fill="none">
          <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Neck + shoulders — minimal */}
        <line x1="145" y1="290" x2="142" y2="350" stroke={c} strokeWidth="0.4" opacity="0.1" />
        <line x1="175" y1="290" x2="178" y2="350" stroke={c} strokeWidth="0.4" opacity="0.1" />
        <path d="M142 350 Q110 355 80 400" stroke={c} strokeWidth="0.4" opacity="0.08" fill="none" />
        <path d="M178 350 Q210 355 240 400" stroke={c} strokeWidth="0.4" opacity="0.08" fill="none" />
      </svg>
    );
  };

  const DetectionBoxes = ({ isMobile = false }: { isMobile?: boolean }) => {
    const boxOpacity = isMobile ? '0.3' : '0.4';
    const textSize = isMobile ? 'text-[7px]' : 'text-[9px]';
    return (
      <>
        {/* Eye boxes */}
        <div className="absolute border rounded-sm transition-colors duration-1000" style={{ top: '33%', left: '22%', width: '24%', height: '10%', borderColor: `${c.replace(')', ' / ' + boxOpacity + ')')}` }}>
          <div className={`absolute -top-3.5 left-0 ${textSize} font-mono transition-colors duration-1000`} style={{ color: `${c.replace(')', ' / 0.5)')}` }}>L_EYE {config.confidence}</div>
        </div>
        <div className="absolute border rounded-sm transition-colors duration-1000" style={{ top: '33%', right: '22%', width: '24%', height: '10%', borderColor: `${c.replace(')', ' / ' + boxOpacity + ')')}` }}>
          <div className={`absolute -top-3.5 right-0 ${textSize} font-mono transition-colors duration-1000`} style={{ color: `${c.replace(')', ' / 0.5)')}` }}>R_EYE {config.confidence}</div>
        </div>
        {/* Nose box */}
        <div className="absolute border rounded-sm transition-colors duration-1000" style={{ top: '44%', left: '38%', width: '24%', height: '13%', borderColor: `${c.replace(')', ' / 0.25)')}` }}>
          <div className={`absolute -top-3.5 left-0 ${textSize} font-mono transition-colors duration-1000`} style={{ color: `${c.replace(')', ' / 0.5)')}` }}>NOSE {config.confidence}</div>
        </div>
        {/* Mouth box */}
        <div className="absolute border rounded-sm transition-colors duration-1000" style={{ top: '57%', left: '30%', width: '40%', height: '10%', borderColor: `${c.replace(')', ' / 0.25)')}` }}>
          <div className={`absolute -bottom-3.5 left-0 ${textSize} font-mono transition-colors duration-1000`} style={{ color: `${c.replace(')', ' / 0.5)')}` }}>MOUTH {config.confidence}</div>
        </div>
      </>
    );
  };

  const CornerBrackets = ({ size = 'w-10 h-10' }: { size?: string }) => (
    <>
      {[
        { pos: 'top-0 left-0', border: 'border-l-2 border-t-2' },
        { pos: 'top-0 right-0', border: 'border-r-2 border-t-2' },
        { pos: 'bottom-0 left-0', border: 'border-l-2 border-b-2' },
        { pos: 'bottom-0 right-0', border: 'border-r-2 border-b-2' },
      ].map((corner, i) => (
        <div
          key={i}
          className={`absolute ${corner.pos} ${size} ${corner.border} transition-colors duration-1000`}
          style={{ borderColor: `${c.replace(')', ' / 0.5)')}` }}
        />
      ))}
    </>
  );

  const TopLabel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`absolute -top-7 left-0 right-0 flex items-center ${isMobile ? 'justify-center' : ''}`}>
      <div
        className="backdrop-blur-sm px-2 py-0.5 rounded-t-sm border border-b-0 transition-all duration-1000"
        style={{
          backgroundColor: `${c.replace(')', ' / 0.15)')}`,
          borderColor: `${c.replace(')', ' / 0.25)')}`,
        }}
      >
        <span className={`${isMobile ? 'text-[8px]' : 'text-[10px]'} font-mono transition-colors duration-1000`} style={{ color: c }}>
          {config.name ? `${config.name}` : 'Scanning...'} — {config.confidence} — {config.label}
        </span>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-bg))] via-[hsl(var(--section-dark))] to-[hsl(var(--section-darker))]" />

      {/* Radial glow */}
      <div
        className="absolute top-1/2 right-1/4 w-[250px] md:w-[500px] h-[250px] md:h-[500px] -translate-y-1/2 rounded-full blur-[80px] md:blur-[120px] transition-colors duration-1500"
        style={{ backgroundColor: `${c.replace(')', ' / 0.04)')}` }}
      />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.03] md:opacity-[0.06]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke={c} strokeWidth="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scan line — slower */}
      <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2">
        <div
          className="scan-line-slow absolute w-[150px] md:w-[500px] h-[1.5px] left-1/2 -translate-x-1/2 opacity-15 md:opacity-30 transition-colors duration-1000"
          style={{ background: `linear-gradient(to right, transparent, ${c}, transparent)` }}
        />
      </div>

      {/* ====== MOBILE / TABLET face (visible below lg) ====== */}
      <div className="absolute inset-0 flex items-center justify-center lg:hidden pointer-events-none">
        <div className="relative w-[180px] h-[225px] sm:w-[220px] sm:h-[275px] md:w-[260px] md:h-[325px] opacity-20 sm:opacity-25 md:opacity-30">
          <CornerBrackets size="w-6 h-6 sm:w-8 sm:h-8" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FaceSVG size={180} />
          </div>
          <DetectionBoxes isMobile />
        </div>
      </div>

      {/* ====== DESKTOP face (lg+) ====== */}
      <div className="absolute right-[12%] top-1/2 -translate-y-1/2 w-[320px] h-[400px] hidden lg:block">
        <CornerBrackets size="w-12 h-12" />

        <div className="absolute inset-0 flex items-center justify-center">
          <FaceSVG size={320} />
        </div>

        <DetectionBoxes />
        <TopLabel />

        {/* Mesh lines — subtle */}
        <svg className="absolute inset-0 w-full h-full opacity-10 transition-colors duration-1000" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[
            [30, 35, 70, 35],
            [30, 35, 50, 50],
            [70, 35, 50, 50],
            [50, 50, 35, 65],
            [50, 50, 65, 65],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.2" />
          ))}
        </svg>

        {/* Orbiting dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit">
            <div
              className="w-1.5 h-1.5 rounded-full transition-colors duration-1000"
              style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
            />
          </div>
        </div>
      </div>

      {/* Status steps — desktop only */}
      <div className="absolute top-1/2 right-[4%] -translate-y-1/2 hidden xl:block">
        <div className="space-y-3 text-xs font-inter text-white/50">
          {[
            { label: 'Face Detected', state: 'detecting' as ScanState },
            { label: 'Identity Matched', state: 'recognized' as ScanState },
            { label: 'Record Saved', state: 'saved' as ScanState },
          ].map((item) => {
            const isActive = scanState === item.state ||
              (item.state === 'detecting' && (scanState === 'recognized' || scanState === 'saved')) ||
              (item.state === 'recognized' && scanState === 'saved');
            return (
              <div key={item.label} className="flex items-center gap-2">
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${isActive ? 'scale-125' : 'opacity-40'}`}
                  style={{ backgroundColor: isActive ? stateConfig[item.state].color : 'hsl(210 15% 45%)' }}
                />
                <span className={`transition-colors duration-1000 ${isActive ? 'text-white/80' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating particles — fewer, subtler */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full animate-float transition-colors duration-1500"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${8 + i * 2}s`,
            backgroundColor: `${c.replace(')', ' / 0.2)')}`,
          }}
        />
      ))}
    </div>
  );
};

export default FaceScanVisualization;
