export function Corner({ pos = "tl", size = 14, color = "#b89455" }) {
  const map = {
    tl: { top: 4, left: 4 },
    tr: { top: 4, right: 4, transform: "scaleX(-1)" },
    bl: { bottom: 4, left: 4, transform: "scaleY(-1)" },
    br: { bottom: 4, right: 4, transform: "scale(-1,-1)" },
  };
  const p = map[pos];
  return (
    <svg viewBox="0 0 14 14" style={{ position: "absolute", width: size, height: size, pointerEvents: "none", ...p }}>
      <path d="M1 7 L1 1 L7 1" fill="none" stroke={color} strokeWidth="1" />
      <path d="M2.5 2.5 L5 5" stroke={color} strokeWidth="0.8" />
      <circle cx="1.5" cy="1.5" r="1.1" fill={color} />
    </svg>
  );
}

export function Panel({ children, style }) {
  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: "var(--panel)", border: "1px solid var(--gold)", borderRadius: "8px", boxShadow: "inset 0 0 18px rgba(58,37,102,0.35)", padding: "14px", ...style }}>
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />
      {children}
    </div>
  );
}