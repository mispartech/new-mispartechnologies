import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DJANGO_BASE_URL =
  import.meta.env.VITE_DJANGO_API_URL || 'https://api.mispartechnologies.com';

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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
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
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Registration failed');
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
      setError(err.message || 'Registration failed. Please try again.');
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    emailStatus === 'taken' ? 'border-red-500' : emailStatus === 'available' ? 'border-green-500' : ''
                  }`}
                  placeholder="you@example.com"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5">
                  {emailStatus === 'checking' && <Loader2 className="w-4 h-4 text-white/50 animate-spin" />}
                  {emailStatus === 'available' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                  {emailStatus === 'taken' && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              {emailStatus === 'taken' && (
                <p className="text-red-400 text-xs mt-1">This email is already registered.</p>
              )}
            </div>


            <div>
              <Label className="text-white/70 text-sm">Password</Label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
                placeholder="Min. 8 characters"
              />
            </div>

            <div>
              <Label className="text-white/70 text-sm">Confirm Password</Label>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full button-glow bg-cyan text-navy-dark font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
              {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
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
