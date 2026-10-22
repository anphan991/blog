export default function Loading() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#D8D8D1] font-mono flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-[#A9A9A2]">
        <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-ping" />
        <span>LOADING...</span>
      </div>
    </div>
  );
}
