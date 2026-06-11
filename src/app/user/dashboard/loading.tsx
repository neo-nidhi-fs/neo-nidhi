export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-gray-200 shadow-lg backdrop-blur">
        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
        Loading...
      </div>
    </div>
  );
}
