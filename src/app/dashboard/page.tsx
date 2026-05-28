"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Placeholder stats – replace with real data fetching.
const stats = [
  { label: 'Total Requests', value: 128 },
  { label: 'Open', value: 42 },
  { label: 'In Progress', value: 15 },
  { label: 'Resolved', value: 68 },
];

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={() => router.push('/login')}
            className="btn btn-primary"
          >
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card p-4 text-center animate-fade-in"
            >
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gray-800">
                {s.value}
              </p>
            </div>
          ))}
        </section>

        {/* Recent Requests */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Requests
          </h2>
          <div className="card p-4">
            {/* Placeholder – actual list will be fetched client‑side */}
            <p className="text-gray-500">Loading recent requests...</p>
            <Link
              href="/dashboard/requests"
              className="mt-2 inline-block text-sm text-indigo-600 hover:underline"
            >
              View all requests
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
