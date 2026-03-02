import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery type
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!touched) return;
    try {
      passwordSchema.parse(password);
      setError(undefined);
    } catch (e) {
      if (e instanceof z.ZodError) setError(e.errors[0].message);
    }
  }, [password, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    try {
      passwordSchema.parse(password);
    } catch {
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
        navigate('/auth', { replace: true });
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValid = touched && !error && password.length > 0;

  return (
    <div className="min-h-[100svh] flex items-center justify-center p-4 bg-[hsl(var(--deep-navy))]">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[hsl(var(--electric-cyan)/0.04)] blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <Button
          variant="ghost"
          onClick={() => navigate('/auth')}
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Button>

        <div className="glass-card rounded-2xl p-8 border border-[hsl(var(--electric-cyan)/0.1)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Scan className="w-7 h-7 text-[hsl(var(--electric-cyan))]" />
              <span className="text-xl font-bold text-foreground">Mispar Technologies</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Enter your new password below
            </p>
          </div>

          {!isRecovery ? (
            <div className="text-center text-muted-foreground text-sm">
              <p>This page is for resetting your password via the email link.</p>
              <p className="mt-2">If you need to reset your password, go to the <button onClick={() => navigate('/auth')} className="text-[hsl(var(--electric-cyan))] underline">sign in page</button> and click "Forgot password?"</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => setTouched(true)}
                    placeholder="••••••••"
                    required
                    className={cn(
                      "pl-10 pr-20 bg-background/50 border-border/50 transition-colors",
                      error && touched && "border-destructive focus:border-destructive",
                      passwordValid && "border-green-500/50 focus:border-green-500"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {touched && (
                      passwordValid ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : error ? <AlertCircle className="w-4 h-4 text-destructive" /> : null
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && touched && <p className="text-xs text-destructive">{error}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 bg-background/50 border-border/50 transition-colors"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full button-glow h-11 font-medium" disabled={isLoading}>
                {isLoading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Updating...</span>
                  : 'Update Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
