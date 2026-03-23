import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Scan, ArrowRight, Sparkles } from 'lucide-react';

const EmailVerified = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    // Auto-redirect after 8 seconds
    const redirect = setTimeout(() => navigate('/auth', { replace: true }), 8000);
    return () => { clearTimeout(timer); clearTimeout(redirect); };
  }, [navigate]);

  return (
    <div className="min-h-[100svh] flex items-center justify-center p-4 bg-[hsl(var(--deep-navy))]">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-[hsl(var(--electric-cyan)/0.05)] blur-[80px]" />

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="glass-card rounded-2xl p-10 border border-emerald-500/20 text-center">
          {/* Success icon with animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>

          {/* Brand */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Scan className="w-5 h-5 text-[hsl(var(--electric-cyan))]" />
            <span className="text-sm font-semibold text-foreground tracking-wide">Mispar Technologies</span>
          </div>

          {/* Welcome message */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Email Verified Successfully!
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Welcome to Mispar Technologies</span>
          </div>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Your email has been confirmed. You're all set to sign in and start using 
            intelligent facial recognition for seamless attendance management.
          </p>

          {/* CTA */}
          <Button 
            onClick={() => navigate('/auth', { replace: true })}
            className="w-full button-glow h-12 font-medium text-base group"
          >
            Continue to Sign In
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            You'll be redirected automatically in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
