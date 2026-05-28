// src/app/page.tsx
// Landing page for AI Customer Request Routing System
// Built with Next.js App Router, TypeScript, and Tailwind CSS

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center justify-center p-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl space-y-6">
        <h1 className="text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
          AI Customer Request Routing System
        </h1>
        <p className="text-lg text-gray-700">
          Streamline incoming customer requests with AI‑powered classification, realtime updates, and robust dashboard analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <a
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
          >
            Login
          </a>
          <a
            href="/dashboard"
            className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg shadow-md hover:bg-indigo-50 transition-colors duration-200"
          >
            Open Dashboard
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-16 w-full max-w-5xl">
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature title="AI Request Classification" description="Instantly categorise incoming requests with high‑accuracy AI models." />
          <Feature title="Realtime Updates" description="Live status changes and notes appear instantly via Supabase Realtime." />
          <Feature title="Async Queue Processing" description="Background workers handle heavy tasks without blocking the UI." />
          <Feature title="Internal Notes" description="Collaborate with agents by adding private notes to each request." />
          <Feature title="Dashboard Analytics" description="Visualise request trends, priorities, and agent performance." />
        </div>
      </section>
    </main>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-xl font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
