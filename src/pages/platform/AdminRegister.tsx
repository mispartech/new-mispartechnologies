import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    inviteCode: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Email address is required.');
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
    // Backend integration needed
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: 'Registration submitted',
        description: 'Platform admin registration requires backend integration. Contact engineering.',
      });
    }, 1000);
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
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
                placeholder="you@mispartechnologies.com"
              />
              <p className="text-white/30 text-xs mt-1">Must be a @mispartechnologies.com email</p>
            </div>

            <div>
              <Label className="text-white/70 text-sm">Invite Code</Label>
              <Input
                name="inviteCode"
                value={formData.inviteCode}
                onChange={handleChange}
                required
                className="mt-1 bg-white/5 border-white/10 text-white"
                placeholder="Enter your invite code"
              />
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
