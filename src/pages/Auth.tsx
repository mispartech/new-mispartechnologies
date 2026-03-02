import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Scan, ArrowLeft, Mail, Lock, User, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const AuthLeftPanel = () => {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex md:w-2/5 lg:w-1/2 relative overflow-hidden bg-[hsl(var(--deep-navy))] items-center justify-center">
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--electric-cyan)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--electric-cyan)/0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(var(--electric-cyan)/0.08)] blur-[80px] animate-[glow-pulse_4s_ease-in-out_infinite]" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[hsl(var(--primary)/0.1)] blur-[60px] animate-[glow-pulse_6s_ease-in-out_infinite_1s]" />

      {/* Face mesh visualization */}
      <div className="relative z-10 w-72 h-72">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer ring */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--electric-cyan))" strokeWidth="0.5" opacity="0.3" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(var(--electric-cyan))" strokeWidth="0.3" opacity="0.2" strokeDasharray="4 4">
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite" />
          </circle>

          {/* Face outline */}
          <ellipse cx="100" cy="95" rx="45" ry="55" fill="none" stroke="hsl(var(--electric-cyan))" strokeWidth="1" opacity="0.6" />

          {/* Eye markers */}
          {[[78, 80], [122, 80]].map(([cx, cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="8" fill="none" stroke="hsl(var(--electric-cyan))" strokeWidth="0.8" opacity="0.5" />
              <circle cx={cx} cy={cy} r="3" fill="hsl(var(--electric-cyan))" opacity="0.8">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          {/* Nose */}
          <line x1="100" y1="85" x2="100" y2="105" stroke="hsl(var(--electric-cyan))" strokeWidth="0.8" opacity="0.4" />

          {/* Mouth */}
          <path d="M 85 115 Q 100 125 115 115" fill="none" stroke="hsl(var(--electric-cyan))" strokeWidth="0.8" opacity="0.4" />

          {/* Mapping points */}
          {[
            [100,40],[70,55],[130,55],[60,80],[140,80],[65,105],[135,105],[75,125],[125,125],[100,135],[85,60],[115,60],
            [75,90],[125,90],[90,110],[110,110],[100,75],[88,95],[112,95],[95,120],[105,120]
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.5" fill="hsl(var(--electric-cyan))" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.9;0.2" dur={`${1.5 + (i % 5) * 0.3}s`} begin={`${i * 0.1}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="1;2;1" dur={`${2 + (i % 3) * 0.5}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Connecting lines */}
          {[
            [70,55,60,80],[130,55,140,80],[60,80,65,105],[140,80,135,105],
            [65,105,75,125],[135,105,125,125],[75,125,100,135],[125,125,100,135],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--electric-cyan))" strokeWidth="0.5" opacity="0.2" />
          ))}

          {/* Scan line */}
          <line x1="50" y1={40 + scanProgress * 1.2} x2="150" y2={40 + scanProgress * 1.2} stroke="hsl(var(--electric-cyan))" strokeWidth="1.5" opacity={scanProgress > 95 ? 0 : 0.6}>
          </line>
        </svg>

        {/* Status text */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center space-y-2">
          <div className="flex items-center gap-2 text-[hsl(var(--electric-cyan))]">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wider uppercase">Biometric Security Active</span>
          </div>
          <div className="h-1 w-48 bg-[hsl(var(--electric-cyan)/0.1)] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(var(--electric-cyan)/0.6)] rounded-full transition-all duration-100" style={{ width: `${scanProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="flex items-center gap-2 mb-3">
          <Scan className="w-6 h-6 text-[hsl(var(--electric-cyan))]" />
          <span className="text-lg font-bold text-foreground">Mispar Technologies</span>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Enterprise-grade facial recognition for secure, seamless attendance management.
        </p>
      </div>
    </div>
  );
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [shakeField, setShakeField] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, isLoading: authLoading, login, register } = useDjangoAuth();

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      const isOnboarded = user.is_onboarded === true;
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  // Live inline validation
  useEffect(() => {
    if (!touched.email) return;
    try { emailSchema.parse(email); setErrors(p => ({ ...p, email: undefined })); }
    catch (e) { if (e instanceof z.ZodError) setErrors(p => ({ ...p, email: e.errors[0].message })); }
  }, [email, touched.email]);

  useEffect(() => {
    if (!touched.password) return;
    try { passwordSchema.parse(password); setErrors(p => ({ ...p, password: undefined })); }
    catch (e) { if (e instanceof z.ZodError) setErrors(p => ({ ...p, password: e.errors[0].message })); }
  }, [password, touched.password]);

  const triggerShake = (field: string) => {
    setShakeField(field);
    setTimeout(() => setShakeField(null), 500);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) { newErrors.email = e.errors[0].message; triggerShake('email'); }
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) { newErrors.password = e.errors[0].message; triggerShake('password'); }
    }
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.error) {
          let description = result.error;
          if (result.error.includes('Invalid login credentials')) {
            description = 'Invalid email or password. Please try again.';
          } else if (result.error.includes('Email not confirmed')) {
            description = 'Please verify your email before signing in.';
          }
          toast({ title: 'Login failed', description, variant: 'destructive' });
          return;
        }
        toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
      } else {
        const result = await register({ email, password, first_name: firstName, last_name: lastName });
        if (result.error) {
          toast({ title: 'Sign up failed', description: result.error, variant: 'destructive' });
          return;
        }
        toast({ title: 'Check your email', description: 'A verification link has been sent. Please confirm before signing in.' });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const emailValid = touched.email && !errors.email && email.length > 0;
  const passwordValid = touched.password && !errors.password && password.length > 0;

  return (
    <div className="min-h-[100svh] flex flex-col md:flex-row bg-[hsl(var(--deep-navy))]">
      <AuthLeftPanel />

      {/* Right side — Form */}
      <div className="w-full md:w-3/5 lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-10 lg:p-12 relative">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[hsl(var(--electric-cyan)/0.04)] blur-[100px]" />

        <div className="w-full max-w-md relative z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>

          {/* Glass card */}
          <div className="glass-card rounded-2xl p-8 border border-[hsl(var(--electric-cyan)/0.1)]">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="md:hidden flex items-center justify-center gap-2 mb-4">
                <Scan className="w-7 h-7 text-[hsl(var(--electric-cyan))]" />
                <span className="text-xl font-bold text-foreground">Mispar Technologies</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                {isLogin ? 'Sign in to your secure dashboard' : 'Start your face recognition journey'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5" noValidate>
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-muted-foreground">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)}
                        placeholder="John" required={!isLogin}
                        className="pl-10 bg-background/50 border-border/50 focus:border-[hsl(var(--electric-cyan)/0.5)] transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)}
                        placeholder="Doe" required={!isLogin}
                        className="pl-10 bg-background/50 border-border/50 focus:border-[hsl(var(--electric-cyan)/0.5)] transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className={cn("relative transition-transform", shakeField === 'email' && 'animate-[shake_0.4s_ease-in-out]')}>
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, email: true }))}
                    placeholder="you@example.com" required
                    className={cn(
                      "pl-10 pr-10 bg-background/50 border-border/50 transition-colors",
                      errors.email && touched.email && "border-destructive focus:border-destructive",
                      emailValid && "border-green-500/50 focus:border-green-500"
                    )} />
                  {touched.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : errors.email ? <AlertCircle className="w-4 h-4 text-destructive" /> : null}
                    </div>
                  )}
                </div>
                {errors.email && touched.email && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className={cn("relative transition-transform", shakeField === 'password' && 'animate-[shake_0.4s_ease-in-out]')}>
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, password: true }))}
                    placeholder="••••••••" required
                    className={cn(
                      "pl-10 pr-20 bg-background/50 border-border/50 transition-colors",
                      errors.password && touched.password && "border-destructive focus:border-destructive",
                      passwordValid && "border-green-500/50 focus:border-green-500"
                    )} />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {touched.password && (
                      passwordValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : errors.password ? <AlertCircle className="w-4 h-4 text-destructive" /> : null
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {errors.password && touched.password && (
                  <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>
                )}
                {touched.password && password.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors",
                        password.length >= i * 3 ? (password.length >= 12 ? 'bg-green-500' : password.length >= 8 ? 'bg-yellow-500' : 'bg-destructive') : 'bg-border/30'
                      )} />
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full button-glow h-11 font-medium" disabled={isLoading}>
                {isLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); setTouched({}); }}
                className="text-sm text-muted-foreground hover:text-[hsl(var(--electric-cyan))] transition-colors">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="font-medium text-[hsl(var(--electric-cyan))]">{isLogin ? 'Sign up' : 'Sign in'}</span>
              </button>
            </div>
          </div>

          {/* Trust badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3.5 h-3.5 text-[hsl(var(--electric-cyan)/0.6)]" />
            <span>256-bit encrypted · SOC 2 compliant · GDPR ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
