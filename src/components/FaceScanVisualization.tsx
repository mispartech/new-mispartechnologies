import React, { useState, useEffect, useRef, useCallback } from 'react';

type ScanState = 'entering' | 'detecting' | 'recognized' | 'saved' | 'fading';

const stateConfig = {
  entering: { color: 'hsl(190 90% 50%)', label: '', confidence: 0, name: '' },
  detecting: { color: 'hsl(190 90% 50%)', label: 'Detecting Face...', confidence: 72, name: '' },
  recognized: { color: 'hsl(45 100% 60%)', label: 'Face Recognized', confidence: 96, name: 'Adaeze Okonkwo' },
  saved: { color: 'hsl(142 70% 50%)', label: 'Attendance Saved ✓', confidence: 99, name: 'Adaeze Okonkwo' },
  fading: { color: 'hsl(142 70% 50%)', label: '', confidence: 0, name: '' },
};

// Smooth easing
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const FaceScanVisualization = () => {
  const [scanState, setScanState] = useState<ScanState>('entering');
  const [confidence, setConfidence] = useState(0);
  const [facePos, setFacePos] = useState({ x: 80, y: 0 });
  const [showCorners, setShowCorners] = useState(false);
  const [showFeatures, setShowFeatures] = useState({ eyes: false, nose: false, mouth: false });
  const [cornerScale, setCornerScale] = useState(0.8);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // Face drift — smooth wandering motion using sin/cos
  const updateFacePosition = useCallback(() => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    timeRef.current = elapsed;

    // Gentle wandering: ±15px horizontal, ±8px vertical
    const x = Math.sin(elapsed * 0.4) * 12 + Math.cos(elapsed * 0.25) * 6;
    const y = Math.sin(elapsed * 0.3) * 8 + Math.cos(elapsed * 0.5) * 4;

    setFacePos({ x, y });
    animFrameRef.current = requestAnimationFrame(updateFacePosition);
  }, []);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(updateFacePosition);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [updateFacePosition]);

  // State machine — 10s cycle
  useEffect(() => {
    const runCycle = () => {
      // 0-1s: entering
      setScanState('entering');
      setShowCorners(false);
      setShowFeatures({ eyes: false, nose: false, mouth: false });
      setCornerScale(0.8);
      setConfidence(0);

      // 1s: start detecting, corners snap on
      const t1 = setTimeout(() => {
        setScanState('detecting');
        setShowCorners(true);
        setTimeout(() => setCornerScale(1), 50);
      }, 1000);

      // 1.3s-3s: features fade in sequentially, confidence ticks
      const t2 = setTimeout(() => setShowFeatures(f => ({ ...f, eyes: true })), 1300);
      const t3 = setTimeout(() => setShowFeatures(f => ({ ...f, nose: true })), 1600);
      const t4 = setTimeout(() => setShowFeatures(f => ({ ...f, mouth: true })), 1900);

      // Confidence counter during detecting
      const confIntervals: ReturnType<typeof setTimeout>[] = [];
      for (let i = 0; i <= 13; i++) {
        confIntervals.push(setTimeout(() => setConfidence(72 + i), 1000 + i * 150));
      }

      // 3.5s: recognized
      const t5 = setTimeout(() => {
        setScanState('recognized');
        setConfidence(96);
      }, 3500);

      // 6s: saved
      const t6 = setTimeout(() => {
        setScanState('saved');
        setConfidence(99);
      }, 6000);

      // 8.5s: fading
      const t7 = setTimeout(() => {
        setScanState('fading');
        setShowCorners(false);
        setShowFeatures({ eyes: false, nose: false, mouth: false });
      }, 8500);

      return [t1, t2, t3, t4, t5, t6, t7, ...confIntervals];
    };

    let timers = runCycle();
    const interval = setInterval(() => {
      timers.forEach(clearTimeout);
      startTimeRef.current = Date.now();
      timers = runCycle();
    }, 10000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  const config = stateConfig[scanState];
  const c = config.color;

  // Gender-neutral, friendly silhouette
  const FaceSilhouette = ({ size = 220 }: { size?: number }) => (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 220 264"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-700"
    >
      {/* Head outline — smooth oval */}
      <ellipse cx="110" cy="115" rx="72" ry="88" stroke={c} strokeWidth="1.2" opacity="0.3">
        <animate attributeName="opacity" values="0.25;0.4;0.25" dur="4s" repeatCount="indefinite" />
      </ellipse>

      {/* Hair hint — subtle arc on top */}
      <path d="M52 85 Q60 30 110 25 Q160 30 168 85" stroke={c} strokeWidth="0.6" opacity="0.15" fill="none" />

      {/* Left eye — friendly almond */}
      <ellipse cx="82" cy="108" rx="14" ry="8" stroke={c} strokeWidth="0.7" opacity="0.3" />
      <circle cx="82" cy="108" r="3.5" fill={c} opacity="0.35">
        <animate attributeName="opacity" values="0.25;0.45;0.25" dur="3s" repeatCount="indefinite" />
      </circle>
      {/* Pupil reflection */}
      <circle cx="84" cy="106.5" r="1" fill={c} opacity="0.5" />

      {/* Right eye */}
      <ellipse cx="138" cy="108" rx="14" ry="8" stroke={c} strokeWidth="0.7" opacity="0.3" />
      <circle cx="138" cy="108" r="3.5" fill={c} opacity="0.35">
        <animate attributeName="opacity" values="0.25;0.45;0.25" dur="3s" begin="0.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="140" cy="106.5" r="1" fill={c} opacity="0.5" />

      {/* Eyebrows — gentle arcs */}
      <path d="M65 94 Q82 87 100 94" stroke={c} strokeWidth="0.5" opacity="0.15" fill="none" />
      <path d="M120 94 Q138 87 155 94" stroke={c} strokeWidth="0.5" opacity="0.15" fill="none" />

      {/* Nose — minimal */}
      <path d="M110 120 L107 142 Q110 146 113 142 Z" stroke={c} strokeWidth="0.5" opacity="0.18" fill="none" />

      {/* Smile — warm, gentle */}
      <path d="M88 165 Q100 178 110 180 Q120 178 132 165" stroke={c} strokeWidth="0.8" opacity="0.25" fill="none">
        <animate attributeName="opacity" values="0.2;0.35;0.2" dur="4s" repeatCount="indefinite" />
      </path>
    </svg>
  );

  // cvzone-style corner brackets
  const CornerBrackets = ({ boxW, boxH, thickness = 3, len = 0.2 }: {
    boxW: number; boxH: number; thickness?: number; len?: number;
  }) => {
    const armW = Math.max(boxW * len, 12);
    const armH = Math.max(boxH * len, 12);

    const corners = [
      { x: 0, y: 0, bx: `${thickness}px`, by: `${thickness}px`, bxn: '0', byn: '0', w: armW, h: armH },
      { x: boxW - armW, y: 0, bx: '0', by: `${thickness}px`, bxn: `${thickness}px`, byn: '0', w: armW, h: armH },
      { x: 0, y: boxH - armH, bx: `${thickness}px`, by: '0', bxn: '0', byn: `${thickness}px`, w: armW, h: armH },
      { x: boxW - armW, y: boxH - armH, bx: '0', by: '0', bxn: `${thickness}px`, byn: `${thickness}px`, w: armW, h: armH },
    ];

    return (
      <>
        {corners.map((corner, i) => (
          <div
            key={i}
            className="absolute transition-all duration-500"
            style={{
              left: corner.x,
              top: corner.y,
              width: corner.w,
              height: corner.h,
              borderLeft: corner.bx !== '0' ? `${thickness}px solid ${c}` : 'none',
              borderRight: corner.bxn !== '0' ? `${thickness}px solid ${c}` : 'none',
              borderTop: corner.by !== '0' ? `${thickness}px solid ${c}` : 'none',
              borderBottom: corner.byn !== '0' ? `${thickness}px solid ${c}` : 'none',
              transform: `scale(${cornerScale})`,
              opacity: showCorners ? 0.8 : 0,
            }}
          />
        ))}
      </>
    );
  };

  // Feature detection boxes
  const FeatureBox = ({ label, x, y, w, h, visible, conf }: {
    label: string; x: string; y: string; w: string; h: string; visible: boolean; conf: number;
  }) => (
    <div
      className="absolute border rounded-sm transition-all duration-500 font-mono"
      style={{
        left: x, top: y, width: w, height: h,
        borderColor: visible ? `${c.replace(')', ' / 0.4)')}` : 'transparent',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
      }}
    >
      <div
        className="absolute -top-3 left-0 text-[8px] lg:text-[9px] whitespace-nowrap transition-all duration-500"
        style={{ color: `${c.replace(')', ' / 0.6)')}`, opacity: visible ? 1 : 0 }}
      >
        {label} {conf}%
      </div>
    </div>
  );

  // Status label that tracks face
  const StatusLabel = () => {
    if (scanState === 'entering' || scanState === 'fading') return null;
    return (
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 transition-all duration-700 whitespace-nowrap"
        style={{ opacity: scanState === 'fading' ? 0 : 1 }}
      >
        <div
          className="backdrop-blur-md px-3 py-1 rounded-md border transition-all duration-700"
          style={{
            backgroundColor: `${c.replace(')', ' / 0.12)')}`,
            borderColor: `${c.replace(')', ' / 0.3)')}`,
            boxShadow: `0 0 20px ${c.replace(')', ' / 0.1)')}`,
          }}
        >
          <span className="text-[9px] lg:text-[11px] font-mono tracking-wide transition-colors duration-700" style={{ color: c }}>
            {config.name ? `${config.name} — ` : 'Scanning... — '}
            {confidence}% — {config.label}
          </span>
        </div>
      </div>
    );
  };

  // Data stream particles flowing toward face
  const DataParticles = () => (
    <>
      {[...Array(8)].map((_, i) => {
        const startX = 70 + (i % 4) * 8;
        const startY = 10 + Math.floor(i / 4) * 80;
        const delay = i * 0.8;
        return (
          <div
            key={i}
            className="absolute rounded-full animate-data-stream"
            style={{
              left: `${startX}%`,
              top: `${startY}%`,
              width: '2px',
              height: '2px',
              backgroundColor: `${c.replace(')', ' / 0.3)')}`,
              animationDelay: `${delay}s`,
              animationDuration: `${3 + (i % 3)}s`,
              boxShadow: `0 0 4px ${c.replace(')', ' / 0.2)')}`,
            }}
          />
        );
      })}
    </>
  );

  // Desktop face frame dimensions
  const FRAME_W = 280;
  const FRAME_H = 340;

  // Mobile face frame dimensions
  const MOBILE_FRAME_W = 180;
  const MOBILE_FRAME_H = 220;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-bg))] via-[hsl(var(--section-dark))] to-[hsl(var(--section-darker))]" />

      {/* Radial glow — pulses with state color */}
      <div
        className="absolute top-1/2 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] -translate-y-1/2 rounded-full blur-[100px] md:blur-[140px] transition-all duration-1000"
        style={{ backgroundColor: `${c.replace(')', ' / 0.06)')}` }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] md:opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(190 90% 50%)" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Scan line — synced with state color */}
      <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2">
        <div
          className="scan-line-slow absolute w-[200px] md:w-[600px] h-[1px] left-1/2 -translate-x-1/2 opacity-10 md:opacity-20 transition-colors duration-700"
          style={{ background: `linear-gradient(to right, transparent, ${c}, transparent)` }}
        />
      </div>

      {/* ====== MOBILE / TABLET (below lg) ====== */}
      <div className="absolute inset-0 flex items-center justify-center lg:hidden pointer-events-none">
        <div
          className="relative opacity-20 sm:opacity-25 md:opacity-30 transition-all duration-700"
          style={{
            width: MOBILE_FRAME_W,
            height: MOBILE_FRAME_H,
            transform: `translate(${facePos.x * 0.5}px, ${facePos.y * 0.5}px)`,
          }}
        >
          {/* Corner brackets */}
          <CornerBrackets boxW={MOBILE_FRAME_W} boxH={MOBILE_FRAME_H} thickness={2} len={0.18} />

          {/* Face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FaceSilhouette size={140} />
          </div>

          {/* Feature boxes — no labels on mobile */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: showCorners ? 1 : 0 }}
          >
            <div className="absolute border rounded-sm transition-all duration-500"
              style={{ top: '32%', left: '18%', width: '22%', height: '10%', borderColor: showFeatures.eyes ? `${c.replace(')', ' / 0.3)')}` : 'transparent' }} />
            <div className="absolute border rounded-sm transition-all duration-500"
              style={{ top: '32%', right: '18%', width: '22%', height: '10%', borderColor: showFeatures.eyes ? `${c.replace(')', ' / 0.3)')}` : 'transparent' }} />
            <div className="absolute border rounded-sm transition-all duration-500"
              style={{ top: '45%', left: '35%', width: '30%', height: '12%', borderColor: showFeatures.nose ? `${c.replace(')', ' / 0.2)')}` : 'transparent' }} />
            <div className="absolute border rounded-sm transition-all duration-500"
              style={{ top: '60%', left: '28%', width: '44%', height: '10%', borderColor: showFeatures.mouth ? `${c.replace(')', ' / 0.2)')}` : 'transparent' }} />
          </div>
        </div>
      </div>

      {/* ====== DESKTOP (lg+) ====== */}
      <div className="absolute right-[10%] top-1/2 -translate-y-1/2 hidden lg:block">
        <div
          className="relative transition-all duration-300"
          style={{
            width: FRAME_W,
            height: FRAME_H,
            transform: `translate(${facePos.x}px, ${facePos.y}px)`,
          }}
        >
          {/* Status label */}
          <StatusLabel />

          {/* Corner brackets — cvzone style */}
          <CornerBrackets boxW={FRAME_W} boxH={FRAME_H} thickness={3} len={0.18} />

          {/* Face silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FaceSilhouette size={200} />
          </div>

          {/* Feature detection boxes */}
          <FeatureBox label="L_EYE" x="17%" y="33%" w="22%" h="9%" visible={showFeatures.eyes} conf={confidence} />
          <FeatureBox label="R_EYE" x="61%" y="33%" w="22%" h="9%" visible={showFeatures.eyes} conf={confidence} />
          <FeatureBox label="NOSE" x="35%" y="45%" w="30%" h="13%" visible={showFeatures.nose} conf={Math.max(confidence - 3, 0)} />
          <FeatureBox label="MOUTH" x="28%" y="62%" w="44%" h="10%" visible={showFeatures.mouth} conf={Math.max(confidence - 5, 0)} />

          {/* Mesh/landmark lines connecting features */}
          <svg
            className="absolute inset-0 w-full h-full transition-opacity duration-700"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ opacity: showCorners ? 0.08 : 0 }}
          >
            {[
              [28, 37, 72, 37],   // eye to eye
              [28, 37, 50, 52],   // left eye to nose
              [72, 37, 50, 52],   // right eye to nose
              [50, 52, 38, 67],   // nose to mouth left
              [50, 52, 62, 67],   // nose to mouth right
              [38, 67, 62, 67],   // mouth line
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth="0.3" />
            ))}
          </svg>

          {/* Saved state glow burst */}
          {scanState === 'saved' && (
            <div
              className="absolute inset-0 rounded-lg animate-pulse-soft pointer-events-none"
              style={{
                boxShadow: `0 0 40px ${c.replace(')', ' / 0.15)')}, inset 0 0 30px ${c.replace(')', ' / 0.05)')}`,
              }}
            />
          )}
        </div>

        {/* Data stream particles */}
        <DataParticles />

        {/* Orbiting dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="animate-orbit" style={{ animationDuration: '15s' }}>
            <div
              className="w-1.5 h-1.5 rounded-full transition-colors duration-700"
              style={{ backgroundColor: c, boxShadow: `0 0 8px ${c}` }}
            />
          </div>
        </div>
      </div>

      {/* Status timeline — desktop XL */}
      <div className="absolute top-1/2 right-[3%] -translate-y-1/2 hidden xl:block">
        <div className="relative space-y-5 text-xs font-inter">
          {/* Connecting line */}
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10">
            <div
              className="absolute top-0 left-0 w-full transition-all duration-1000 ease-out"
              style={{
                height: scanState === 'saved' || scanState === 'fading' ? '100%' :
                        scanState === 'recognized' ? '50%' :
                        scanState === 'detecting' ? '10%' : '0%',
                backgroundColor: c,
                opacity: 0.4,
              }}
            />
          </div>

          {[
            { label: 'Face Detected', activeOn: ['detecting', 'recognized', 'saved'] },
            { label: 'Identity Matched', activeOn: ['recognized', 'saved'] },
            { label: 'Record Saved', activeOn: ['saved'] },
          ].map((item) => {
            const isActive = item.activeOn.includes(scanState as string);
            const stepColor = item.activeOn[0] === 'detecting' ? 'hsl(190 90% 50%)'
              : item.activeOn[0] === 'recognized' ? 'hsl(45 100% 60%)'
              : 'hsl(142 70% 50%)';
            return (
              <div key={item.label} className="flex items-center gap-3 relative">
                <div
                  className="w-[11px] h-[11px] rounded-full border-2 transition-all duration-700 flex-shrink-0"
                  style={{
                    borderColor: isActive ? stepColor : 'hsl(210 15% 30%)',
                    backgroundColor: isActive ? stepColor : 'transparent',
                    boxShadow: isActive ? `0 0 10px ${stepColor.replace(')', ' / 0.4)')}` : 'none',
                  }}
                />
                <span
                  className="transition-all duration-700 whitespace-nowrap"
                  style={{
                    color: isActive ? 'hsl(210 20% 90%)' : 'hsl(210 15% 40%)',
                    fontSize: '11px',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ambient floating particles */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full animate-float"
          style={{
            left: `${20 + i * 18}%`,
            top: `${15 + (i % 3) * 30}%`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${10 + i * 2}s`,
            backgroundColor: `${c.replace(')', ' / 0.15)')}`,
          }}
        />
      ))}
    </div>
  );
};

export default FaceScanVisualization;
