export default function Stat({ label, value, accent }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">{label}</p>
      <p className={`mt-3 text-3xl font-light tracking-tight ${accent ? "text-[#C4A45C]" : ""}`}>{value}</p>
    </div>
  );
}
