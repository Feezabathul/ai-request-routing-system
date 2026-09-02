'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DEPARTMENTS, type Department } from '@/lib/departments';

function AgentSetupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department: '' as Department | '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      const timer = setTimeout(() => {
        setError('No invitation token provided');
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;

    fetch(`/api/agents/setup?token=${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (!isMounted) return;
        if (status !== 200) {
          setError(data.error || 'Invalid or expired invitation');
        } else {
          setEmail(data.email);
          setFormData((current) => ({ ...current, name: data.name || current.name }));
        }
      })
      .catch(() => {
        if (isMounted) setError('Network error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      const res = await fetch('/api/agents/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          name: formData.name.trim(),
          department: formData.department,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to complete setup');
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch {
      setError('Network error during setup');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <Zap className="h-8 w-8 text-indigo-500 animate-pulse mb-4" />
          <p className="text-sm text-slate-500">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-indigo-100/20 p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invitation Invalid</h1>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-indigo-100/20 p-8 text-center border border-slate-100">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Setup Complete!</h1>
          <p className="text-slate-500 mb-8">Your agent account has been successfully created. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-100/40 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">AI Router</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/20 p-8 border border-slate-100">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Agent Setup</h1>
            <p className="text-sm text-slate-500 mt-2">Complete your profile to join the team.</p>
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <p className="text-xs text-slate-500 uppercase font-semibold">Email Address</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors ${
                  formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="John Doe"
              />
              {formErrors.name && <p className="text-xs text-red-500 mt-1.5">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors bg-white ${
                  formErrors.department ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
              >
                <option value="">Select a department</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {formErrors.department && <p className="text-xs text-red-500 mt-1.5">{formErrors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors ${
                  formErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="••••••••"
              />
              {formErrors.password && <p className="text-xs text-red-500 mt-1.5">{formErrors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-colors ${
                  formErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="••••••••"
              />
              {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{formErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium rounded-xl shadow-md shadow-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-2"
            >
              {isSubmitting ? 'Creating account...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AgentSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Zap className="h-8 w-8 text-indigo-500 animate-pulse mb-4" />
            <p className="text-sm text-slate-500">Loading setup page...</p>
          </div>
        </div>
      }
    >
      <AgentSetupForm />
    </Suspense>
  );
}
