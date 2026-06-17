// src/app/page.tsx
// Landing page for AI Customer Request Routing System
// Built with Next.js App Router, TypeScript, and Tailwind CSS

import { Zap, Brain, RefreshCw, MessageSquare, BarChart3, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-violet-50/30 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-200">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">AI Router</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/login"
            className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg transition-colors duration-200"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl shadow-md shadow-indigo-200/50 hover:shadow-lg hover:shadow-indigo-300/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
          Powered by AI
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
          Smart Customer Request
          <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
            Routing System
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Streamline customer support with AI‑powered classification, real‑time updates, and intelligent agent routing — all in one beautiful dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200/60 hover:shadow-xl hover:shadow-indigo-300/60 hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In to Dashboard
          </a>
          <a
            href="/login"
            className="px-8 py-3.5 text-base font-semibold text-indigo-600 bg-white border-2 border-indigo-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore Dashboard
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            Everything you need
          </h2>
          <p className="text-slate-500 text-lg">Powerful features to supercharge your support workflow</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            icon={<Brain className="h-6 w-6" />}
            title="AI Classification"
            description="Instantly categorize incoming requests with high-accuracy AI models for faster resolution."
            color="indigo"
          />
          <Feature
            icon={<Zap className="h-6 w-6" />}
            title="Realtime Updates"
            description="Live status changes and notifications appear instantly across your entire team."
            color="violet"
          />
          <Feature
            icon={<RefreshCw className="h-6 w-6" />}
            title="Async Processing"
            description="Background workers handle heavy tasks without blocking the user experience."
            color="blue"
          />
          <Feature
            icon={<MessageSquare className="h-6 w-6" />}
            title="Internal Notes"
            description="Collaborate with agents by adding private notes and context to each request."
            color="emerald"
          />
          <Feature
            icon={<BarChart3 className="h-6 w-6" />}
            title="Dashboard Analytics"
            description="Visualize request trends, priorities, and team performance at a glance."
            color="amber"
          />
          <Feature
            icon={<Shield className="h-6 w-6" />}
            title="Role-Based Access"
            description="Secure access control with Admin, Agent, and Customer role management."
            color="rose"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 py-6 text-center text-sm text-slate-400">
        © 2026 AI Request Router. Built with Next.js & AI.
      </footer>
    </main>
  );
}

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  indigo: { bg: "bg-indigo-50", iconBg: "bg-indigo-100", text: "text-indigo-600" },
  violet: { bg: "bg-violet-50", iconBg: "bg-violet-100", text: "text-violet-600" },
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", text: "text-blue-600" },
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", text: "text-amber-600" },
  rose: { bg: "bg-rose-50", iconBg: "bg-rose-100", text: "text-rose-600" },
};

function Feature({
  icon,
  title,
  description,
  color = "indigo",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: string;
}) {
  const colors = colorMap[color] || colorMap.indigo;
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.iconBg} ${colors.text} mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
