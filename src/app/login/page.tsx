/* src/app/login/page.tsx */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setUserRole } from '@/lib/role';
import { CURRENT_AGENT_KEY } from '@/lib/agents';
import { setCurrentUser } from '@/lib/current-user';
import { AlertCircle, Zap, Brain, BarChart3, Shield, MessageSquare, Eye, EyeOff, ChevronDown } from "lucide-react";
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
type RoleHint = '' | 'ADMIN' | 'AGENT' | 'USER';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("admin@example.com");
  const [password, setPassword] = useState<string>("");
  const [roleHint, setRoleHint] = useState<RoleHint>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        setError(responseData.error?.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      const user = responseData.data.user;

      // Validate role hint matches actual role (optional guard)
      if (roleHint && user.role !== roleHint) {
        setError(`This account is not a${roleHint === 'ADMIN' ? 'n Admin' : roleHint === 'AGENT' ? 'n Agent' : ' User'} account. Please select the correct role.`);
        setLoading(false);
        return;
      }

      setUserRole(user.role);
      setCurrentUser(user);

      if (user.role === 'AGENT') {
        localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_AGENT_KEY);
      }

      let routePath = '/user/dashboard';
      if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        routePath = '/admin/dashboard';
      } else if (user.role === 'AGENT') {
        routePath = '/agent/dashboard';
      }
      await new Promise((res) => setTimeout(res, 800));
      setLoading(false);
      router.push(routePath);

    } catch (e) {
      console.error('Login error:', e);
      setError('An error occurred during login. Please try again.');
      setLoading(false);
    }
  };

  const roleLabels: Record<RoleHint, string> = {
    '': 'Select your role...',
    'ADMIN': 'Admin',
    'AGENT': 'Agent',
    'USER': 'Customer / User',
  };

  const features = [
    { icon: <Brain className="h-5 w-5" />, label: "AI-powered request classification" },
    { icon: <Zap className="h-5 w-5" />, label: "Real-time status updates" },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard analytics & insights" },
    { icon: <Shield className="h-5 w-5" />, label: "Role-based access control" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Internal notes & collaboration" },
  ];

  return (
    <section className={`${inter.className} min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100`}>
      {/* Left side – info panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start px-16 py-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AI Router</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Smart Customer Request Routing
          </h1>
          <p className="text-lg text-indigo-100 mb-10 leading-relaxed">
            Seamlessly route, classify, and resolve customer requests with the power of AI.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm">
                  {f.icon}
                </div>
                <span className="text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side – login card */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">AI Router</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl" role="alert">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

            {/* Role selector */}
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium text-slate-700 mb-1.5">
                I am logging in as
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={roleHint}
                  onChange={(e) => setRoleHint(e.target.value as RoleHint)}
                  disabled={loading}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm disabled:opacity-50 transition-all duration-200"
                >
                  <option value="">Select your role...</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AGENT">Agent</option>
                  <option value="USER">Customer / User</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
              {roleHint === 'AGENT' && (
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  Agents must be invited by an admin to access the system.
                </p>
              )}
            </div>

            <div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm disabled:opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 shadow-md shadow-teal-200/50 hover:shadow-lg hover:shadow-teal-300/50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

    </section>
  );
}
