import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$%^&*)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const AdminRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordStrength = useMemo(() => {
    return PASSWORD_RULES.map((rule) => ({
      ...rule,
      passed: rule.test(formData.password),
    }));
  }, [formData.password]);

  const allRulesPassed = passwordStrength.every((r) => r.passed);

  const checkEmail = useCallback(async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailStatus('idle');
      return;
    }
    setEmailStatus('checking');
    try {
      const res = await fetch(`${DJANGO_BASE_URL}/api/platform/check-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setEmailStatus(data.available ? 'available' : 'taken');
    } catch {
      setEmailStatus('idle');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'password' && !passwordTouched) setPasswordTouched(true);
  };

  const handleEmailBlur = () => {
    checkEmail(formData.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Email address is required.');
      return;
    }
    if (emailStatus === 'taken') {
      setError('This email is already registered.');
      return;
    }
    if (!allRulesPassed) {
      setError('Password does not meet strength requirements.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${DJANGO_BASE_URL}/api/platform/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          password: formData.password,
          password2: formData.confirmPassword,
        }),
      });

      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { detail: text || `Server error (${res.status})` };
      }

      if (!res.ok) {
        // Handle Django REST Framework field-level errors
        if (typeof data === 'object' && !data.detail && !data.error) {
          const fieldErrors = Object.entries(data)
            .map(([key, val]) => {
              const msg = Array.isArray(val) ? val.join(', ') : String(val);
              return `${key}: ${msg}`;
            })
            .join('; ');
          throw new Error(fieldErrors || 'Registration failed');
        }
        throw new Error(data.detail || data.error || data.message || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('platform_admin_token', data.token);
      }

      toast({
        title: 'Registration successful',
        description: 'Your platform admin account has been created.',
      });
      navigate('/admin-login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center section-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan/10 border border-cyan/20 mb-4">
            <Shield className="w-7 h-7 text-cyan" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Platform Admin Registration</h1>
          <p className="text-white/50 text-sm">Mispar Technologies internal admin access</p>
        </div>

        <div className="glass-card p-6 md:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white/70 text-sm">First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="First"
                />
              </div>
              <div>
                <Label className="text-white/70 text-sm">Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white"
                  placeholder="Last"
                />
              </div>
            </div>

            {/* Email with availability check */}
            <div>
              <Label className="text-white/70 text-sm">Email Address</Label>
              <div className="relative">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  required
                  className={`mt-1 bg-white/5 border-white/10 text-white pr-10 ${
                    emailStatus === 'taken'
                      ? 'border-destructive'
                      : emailStatus === 'available'
                        ? 'border-green-500'
                        : ''
                  }`}
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
                  {emailStatus === 'checking' && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                  {emailStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {emailStatus === 'taken' && <AlertCircle className="w-4 h-4 text-destructive" />}
                </div>
              </div>
              {emailStatus === 'taken' && (
                <p className="text-destructive text-xs mt-1">This email is already registered.</p>
              )}
            </div>

            {/* Password with eye toggle */}
            <div>
              <Label className="text-white/70 text-sm">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white pr-10"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Dynamic password strength checklist */}
              {passwordTouched && formData.password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {passwordStrength.map((rule) => (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        rule.passed ? 'text-green-400' : 'text-white/40'
                      }`}
                    >
                      {rule.passed ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-white/20 shrink-0" />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm password with eye toggle */}
            <div>
              <Label className="text-white/70 text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-white/5 border-white/10 text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-destructive text-xs mt-1">Passwords do not match.</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full button-glow bg-cyan text-navy-dark font-semibold"
              disabled={isSubmitting || emailStatus === 'taken' || (!allRulesPassed && passwordTouched)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/admin-login')}
              className="text-cyan text-sm hover:underline"
            >
              Already have access? Sign in
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate('/')} className="text-white/30 text-sm hover:text-white/50">
            ← Back to main site
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
