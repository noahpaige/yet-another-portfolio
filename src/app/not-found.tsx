import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-100 mb-4">404</h1>
        <p className="text-zinc-400 text-lg mb-8">Page not found</p>
        <Link
          href="/"
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
