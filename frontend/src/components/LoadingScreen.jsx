export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-3 text-zinc-500">
        <span className="h-3 w-3 rounded-full bg-[#C4A45C] animate-pulse" />
        Loading portal…
      </div>
    </div>
  );
}
