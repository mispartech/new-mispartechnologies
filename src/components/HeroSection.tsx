import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FaceScanVisualization from './FaceScanVisualization';
import { useCountUp } from '@/hooks/useCountUp';

interface HeroSectionProps {
  onRequestDemo?: () => void;
}

const rotatingWords = [
  'recognizes you.',
  'knows you.',
  'verifies you.',
  'protects you.',
];

const HeroSection = ({ onRequestDemo }: HeroSectionProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showScrollCue, setShowScrollCue] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);

  const { count: accuracyCount, ref: accuracyRef } = useCountUp(99, 2000);
  const { count: speedCount, ref: speedRef } = useCountUp(1, 1500);
  const { count: usersCount, ref: usersRef } = useCountUp(10000, 2500);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    const scrollTimer = setTimeout(() => setShowScrollCue(true), 1500);
    return () => { clearTimeout(timer); clearTimeout(scrollTimer); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <FaceScanVisualization />

      <div className="container-custom relative z-20 pt-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div>
            {/* Badge */}
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan/10 backdrop-blur-sm border border-cyan/20 mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan" />
              <span className="text-sm font-medium text-cyan-light">AI-Powered Recognition</span>
            </div>

            {/* Headline with rotating text */}
            <h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-[1.1] text-white transition-all duration-700 delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              Attendance that{' '}
              <span className="block h-[1.2em] overflow-hidden relative">
                {rotatingWords.map((word, index) => (
                  <span
                    key={word}
                    className={`block text-transparent bg-clip-text bg-gradient-to-r from-cyan to-cyan-light transition-all duration-500 absolute w-full ${
                      index === currentWord 
                        ? 'translate-y-0 opacity-100' 
                        : index < currentWord || (currentWord === 0 && index === rotatingWords.length - 1)
                          ? '-translate-y-full opacity-0'
                          : 'translate-y-full opacity-0'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </h1>

            {/* Subheadline */}
            <p 
              className={`text-lg md:text-xl mb-10 text-white/60 font-light max-w-lg transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              No cards. No clocks. No queues. Just instant, secure facial recognition that works everywhere.
            </p>

            {/* CTA Buttons */}
            <div 
              className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <Button 
                size="lg" 
                className="button-glow bg-gradient-to-r from-cyan to-cyan-dark text-navy-dark text-base font-semibold px-8 h-13 group"
                onClick={() => {
                  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Experience Live AI
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/20 text-white hover:bg-white/5 hover:border-cyan/40 text-base px-8 h-13 group transition-all duration-300"
                onClick={scrollToHowItWorks}
              >
                See Enterprise Solutions
              </Button>
            </div>

            {/* Animated Stats Cards */}
            <div 
              className={`mt-14 grid grid-cols-3 gap-4 transition-all duration-700 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <div ref={accuracyRef} className="glass-card p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-cyan count-up">{accuracyCount}%</div>
                <div className="text-xs text-white/50 mt-1">Accuracy</div>
              </div>
              <div ref={speedRef} className="glass-card p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-cyan count-up">&lt;{speedCount}s</div>
                <div className="text-xs text-white/50 mt-1">Recognition</div>
              </div>
              <div ref={usersRef} className="glass-card p-4 text-center">
                <div className="text-2xl md:text-3xl font-black text-cyan count-up">{usersCount.toLocaleString()}+</div>
                <div className="text-xs text-white/50 mt-1">Users</div>
              </div>
            </div>
          </div>

          {/* Right side - 3D Face Mesh Visualization (handled by FaceScanVisualization) */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Scroll cue */}
      <div 
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 transition-all duration-700 ${showScrollCue ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <button 
          onClick={scrollToHowItWorks}
          className="group flex flex-col items-center text-white/40 hover:text-cyan transition-colors cursor-pointer"
          aria-label="Scroll to learn more"
        >
          <span className="text-xs mb-3 font-medium tracking-widest uppercase">Explore</span>
          <div className="w-5 h-8 rounded-full border border-current p-1">
            <div className="w-1 h-2 rounded-full bg-current mx-auto animate-bounce" />
          </div>
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
