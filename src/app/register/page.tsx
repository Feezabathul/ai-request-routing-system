// src/app/register/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER';
  createdAt: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form validation
  const validateForm = (): boolean => {
    // Check all fields are filled
    if (!name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!confirmPassword) {
      setError("Please confirm your password");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    // Check if email already exists (check users)
    try {
      const existingUsers = localStorage.getItem("users");
      if (existingUsers) {
        const users: User[] = JSON.parse(existingUsers);
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          setError("This email is already registered");
          return false;
        }
      }
    } catch (e) {
      console.error("Error checking existing users:", e);
    }

    // Check if email is already used by an agent
    try {
      const existingAgents = localStorage.getItem("agents");
      if (existingAgents) {
        const agents: any[] = JSON.parse(existingAgents);
        if (agents.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
          setError("This email is already in use by an agent account");
          return false;
        }
      }
    } catch (e) {
      console.error("Error checking existing agents:", e);
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Create new user
    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString(),
    };

    try {
      // Get existing users
      let users: User[] = [];
      const existingUsers = localStorage.getItem("users");
      if (existingUsers) {
        users = JSON.parse(existingUsers);
      }

      // Add new user
      users.push(newUser);

      // Save to localStorage
      localStorage.setItem("users", JSON.stringify(users));

      // Show success message
      setShowSuccess(true);

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Redirect after 1.5 seconds
      await new Promise((res) => setTimeout(res, 1500));
      setLoading(false);
      router.push("/login");
    } catch (e) {
      console.error("Registration error:", e);
      setError("An error occurred during registration. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md bg-white bg-opacity-30 backdrop-blur-lg rounded-xl shadow-xl p-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-800">Registration successful! Redirecting to login...</p>
          </div>
        )}

        <h1 className="text-2xl font-semibold text-gray-800 mb-2 text-center">AI Customer Request Routing System</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-6 text-center">Create your account</h2>

        {error && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg" role="alert">
            <X className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white bg-opacity-60 backdrop-blur-sm px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white bg-opacity-60 backdrop-blur-sm px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white bg-opacity-60 backdrop-blur-sm px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              disabled={loading}
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border border-gray-300 bg-white bg-opacity-60 backdrop-blur-sm px-3 py-2 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading || showSuccess}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition-colors disabled:opacity-60"
            >
              {loading ? "Creating account..." : showSuccess ? "Registered!" : "Register"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </section>
  );
}
