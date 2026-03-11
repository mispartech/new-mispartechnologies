import React from 'react';

const FaceScanVisualization = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep navy gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy to-navy-light" />
      
      {/* Subtle radial glow - reduced on mobile */}
      <div className="absolute top-1/2 right-1/4 w-[300px] md:w-[600px] h-[300px] md:h-[600px] -translate-y-1/2 rounded-full bg-cyan/5 blur-[60px] md:blur-[100px]" />
      <div className="absolute bottom-0 left-1/4 w-[200px] md:w-[400px] h-[200px] md:h-[400px] rounded-full bg-cyan/3 blur-[50px] md:blur-[80px]" />

      {/* Animated grid lines - lighter on mobile */}
      <div className="absolute inset-0 opacity-[0.04] md:opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="hsl(190 90% 50%)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanning line animation */}
      <div className="absolute left-1/2 top-0 w-px h-full -translate-x-1/2">
        <div className="scan-line absolute w-[200px] md:w-[600px] h-[2px] left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan to-transparent opacity-20 md:opacity-40" />
      </div>

      {/* Face detection frame with face silhouette - desktop only */}
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-[320px] h-[400px] hidden lg:block">
        {/* Corner brackets with glow — cvzone style */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-cyan/60 animate-pulse" />
        <div className="absolute top-0 right-0 w-12 h-12 border-r-2 border-t-2 border-cyan/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l-2 border-b-2 border-cyan/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-cyan/60 animate-pulse" style={{ animationDelay: '0.6s' }} />

        {/* Face silhouette SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head outline */}
          <ellipse cx="160" cy="160" rx="85" ry="105" stroke="hsl(190 90% 50%)" strokeWidth="1" opacity="0.25" className="animate-pulse" />
          {/* Jaw / chin */}
          <path d="M75 180 Q90 290 160 310 Q230 290 245 180" stroke="hsl(190 90% 50%)" strokeWidth="0.8" opacity="0.2" className="animate-pulse" />
          {/* Left eye region */}
          <ellipse cx="125" cy="150" rx="22" ry="12" stroke="hsl(190 90% 50%)" strokeWidth="0.8" opacity="0.3" />
          {/* Right eye region */}
          <ellipse cx="195" cy="150" rx="22" ry="12" stroke="hsl(190 90% 50%)" strokeWidth="0.8" opacity="0.3" />
          {/* Nose line */}
          <path d="M160 165 L155 200 Q160 208 165 200 L160 165" stroke="hsl(190 90% 50%)" strokeWidth="0.6" opacity="0.2" />
          {/* Mouth */}
          <path d="M135 235 Q160 250 185 235" stroke="hsl(190 90% 50%)" strokeWidth="0.7" opacity="0.25" />
          {/* Neck */}
          <line x1="140" y1="310" x2="135" y2="370" stroke="hsl(190 90% 50%)" strokeWidth="0.5" opacity="0.15" />
          <line x1="180" y1="310" x2="185" y2="370" stroke="hsl(190 90% 50%)" strokeWidth="0.5" opacity="0.15" />
        </svg>

        {/* cvzone-style inner detection rectangles */}
        {/* Eye region boxes */}
        <div className="absolute border border-cyan/40 rounded-sm" style={{ top: '32%', left: '24%', width: '22%', height: '10%' }}>
          <div className="absolute -top-4 left-0 text-[9px] font-mono text-cyan/50">L_EYE 0.97</div>
        </div>
        <div className="absolute border border-cyan/40 rounded-sm" style={{ top: '32%', right: '24%', width: '22%', height: '10%' }}>
          <div className="absolute -top-4 right-0 text-[9px] font-mono text-cyan/50">R_EYE 0.96</div>
        </div>
        {/* Nose region box */}
        <div className="absolute border border-mint/30 rounded-sm" style={{ top: '42%', left: '40%', width: '20%', height: '15%' }}>
          <div className="absolute -top-4 left-0 text-[9px] font-mono text-mint/50">NOSE 0.98</div>
        </div>
        {/* Mouth region box */}
        <div className="absolute border border-cyan-light/30 rounded-sm" style={{ top: '54%', left: '33%', width: '34%', height: '10%' }}>
          <div className="absolute -bottom-4 left-0 text-[9px] font-mono text-cyan-light/50">MOUTH 0.95</div>
        </div>

        {/* Face landmark dots */}
        <div className="absolute inset-0">
          <div className="absolute top-[35%] left-[30%] w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_hsl(190,90%,50%)] animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute top-[35%] right-[30%] w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_hsl(190,90%,50%)] animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-mint shadow-[0_0_8px_hsl(160,60%,60%)] animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          <div className="absolute top-[65%] left-[35%] w-1.5 h-1.5 rounded-full bg-cyan-light shadow-[0_0_8px_hsl(190,80%,65%)] animate-ping" style={{ animationDuration: '2s', animationDelay: '0.7s' }} />
          <div className="absolute top-[65%] right-[35%] w-1.5 h-1.5 rounded-full bg-cyan-light shadow-[0_0_8px_hsl(190,80%,65%)] animate-ping" style={{ animationDuration: '2s', animationDelay: '0.9s' }} />
        </div>

        {/* Connecting mesh lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="30" y1="35" x2="70" y2="35" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
          <line x1="30" y1="35" x2="50" y2="50" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
          <line x1="70" y1="35" x2="50" y2="50" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
          <line x1="50" y1="50" x2="35" y2="65" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
          <line x1="50" y1="50" x2="65" y2="65" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
          <line x1="35" y1="65" x2="65" y2="65" stroke="hsl(190 90% 50%)" strokeWidth="0.3" className="animate-pulse" />
        </svg>

        {/* Main bounding box label — cvzone style top bar */}
        <div className="absolute -top-7 left-0 right-0 flex items-center">
          <div className="bg-cyan/20 backdrop-blur-sm px-2 py-0.5 rounded-t-sm border border-cyan/30 border-b-0">
            <span className="text-[10px] font-mono text-cyan">FACE_0 conf:0.99</span>
          </div>
        </div>

        {/* Orbiting particle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-orbit">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_hsl(190,90%,50%)]" />
          </div>
        </div>
      </div>

      {/* Status indicator - desktop only */}
      <div className="absolute top-1/2 right-[5%] -translate-y-1/2 hidden xl:block">
        <div className="space-y-3 text-xs font-inter text-white/50">
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            <span>Face Detected</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span>Mapping Features</span>
          </div>
          <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '1.1s' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse" />
            <span>Identity Verified</span>
          </div>
        </div>
      </div>

      {/* Floating particles - fewer on mobile for performance */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-cyan/30 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FaceScanVisualization;
