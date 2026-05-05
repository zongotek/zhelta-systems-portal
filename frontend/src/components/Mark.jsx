export default function Mark({ className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="ZHELTA">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#0A0A0A" />
      <rect x="4.5" y="4.5" width="55" height="55" rx="11.5" fill="none" stroke="#C4A45C" strokeOpacity="0.35" />
      <path d="M19 20 H45 L25.5 44 H45" fill="none" stroke="#C4A45C" strokeWidth="3.6" strokeLinecap="square" />
      <circle cx="48" cy="46" r="1.6" fill="#C4A45C" />
    </svg>
  );
}
