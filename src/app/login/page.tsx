/* src/app/login/page.tsx */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setUserRole, UserRole } from '@/lib/role';
import { findAgentByCredentials, CURRENT_AGENT_KEY } from '@/lib/agents';
import { setCurrentUser, clearCurrentUser } from '@/lib/current-user';
import { AlertCircle, Zap, Brain, BarChart3, Shield, MessageSquare, Eye, EyeOff } from "lucide-react";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    let role: UserRole | null = null;
    let routePath = '';

    try {
      // 1. Check admin credentials
      if (normalizedEmail === 'admin@gmail.com' && password === 'admin123') {
        role = 'ADMIN';
        routePath = '/dashboard/admin';
        setCurrentUser({
          id: 'admin-1',
          name: 'Administrator',
          email: 'admin@gmail.com',
          role: 'ADMIN',
        });
      } else {
        // 2. Check agents from localStorage
        const agent = findAgentByCredentials(normalizedEmail, password);
        if (agent) {
          role = 'AGENT';
          routePath = '/dashboard';
          localStorage.setItem(CURRENT_AGENT_KEY, JSON.stringify(agent));
          setCurrentUser({
            id: agent.id,
            name: agent.name,
            email: agent.email,
            role: 'AGENT',
          });
        }

        // 3. If not agent, check registered users
        if (!role) {
          const storedUsers = localStorage.getItem('users');
          if (storedUsers) {
            const users: StoredUser[] = JSON.parse(storedUsers);
            const user = users.find(
              (u) => u.email === normalizedEmail && u.password === password
            );
            if (user) {
              role = 'CUSTOMER';
              routePath = '/dashboard';
              setCurrentUser({
                id: user.id,
                name: user.name,
                email: user.email,
                role: 'CUSTOMER',
              });
            }
          }
        }
      }

      // If no matching account found
      if (!role) {
        setError('Invalid email or password. Please check your credentials or register if you don\'t have an account.');
        setLoading(false);
        return;
      }

      // Set role and navigate
      setUserRole(role);
      if (role !== 'AGENT') {
        localStorage.removeItem(CURRENT_AGENT_KEY);
      }
      if (role === 'ADMIN') {
        localStorage.removeItem(CURRENT_AGENT_KEY);
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

  const features = [
    { icon: <Brain className="h-5 w-5" />, label: "AI-powered request classification" },
    { icon: <Zap className="h-5 w-5" />, label: "Real-time status updates" },
    { icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard analytics & insights" },
    { icon: <Shield className="h-5 w-5" />, label: "Role-based access control" },
    { icon: <MessageSquare className="h-5 w-5" />, label: "Internal notes & collaboration" },
  ];

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-slate-50">
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
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
              <Zap className="h-4.5 w-4.5 text-white" />
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
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 disabled:opacity-50 shadow-sm"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all duration-200 disabled:opacity-50 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-60 shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50"
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
