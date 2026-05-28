/* src/app/login/page.tsx */
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    // Simulated async login – replace with real API later
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Left side – info panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-12 bg-white bg-opacity-20 backdrop-blur-lg">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
          AI Customer Request Routing System
        </h1>
        <p className="text-lg text-gray-700 mb-6 max-w-md">
          Seamlessly route customer requests, classify them with AI, and keep teams informed in real time.
        </p>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-indigo-500 rounded-full"></span>
            AI request classification
          </li>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-indigo-500 rounded-full"></span>
            Realtime updates
          </li>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-indigo-500 rounded-full"></span>
            Async queue processing
          </li>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-indigo-500 rounded-full"></span>
            Internal notes & collaboration
          </li>
          <li className="flex items-center">
            <span className="inline-block w-2 h-2 mr-2 bg-indigo-500 rounded-full"></span>
            Dashboard analytics
          </li>
        </ul>
      </div>

      {/* Right side – login card */}
        <div className="flex flex-1 items-center justify-center p-6 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
          <div className="w-full max-w-md bg-white bg-opacity-40 backdrop-blur-2xl rounded-3xl shadow-xl p-10 sm:p-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">AI Customer Request Routing System</h1>
          
            <h2 className="text-2xl font-medium text-gray-800 mb-6 text-center">Welcome back</h2>

          {error && (
            <div className="mb-4 text-sm text-red-600" role="alert">
              {error}
            </div>
          )}

            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white bg-opacity-70 backdrop-blur-sm px-5 py-3 text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white bg-opacity-70 backdrop-blur-sm px-5 py-3 text-base text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <div>
              <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 shadow-md">{loading ? "Signing in..." : "Login"}</Button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-700">
            Don’t have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
