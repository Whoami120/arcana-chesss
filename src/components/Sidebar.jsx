import { useGameStore } from "../state/gameStore";

const TOP = ["A", "R", "C", "A", "N", "A"];
const BOT = ["C", "H", "E", "S", "S"];

export default function Sidebar() {
  const classicTheme = useGameStore((s) => s.classicTheme);

  const letter = (c, i, color) => (
    <span key={color + i} style={{ fontFamily: '"Cinzel", serif', fontSize: "16px", color, lineHeight: 1.15 }}>
      {c}
    </span>
  );

  return (
    <div style={{ width: "86px", flexShrink: 0, height: "100%", background: "var(--panel)", border: "1px solid var(--gold)", borderRadius: "10px", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0" }}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="15" fill="none" stroke="#b89455" strokeWidth="1.2" />
        <path d="M20 7 L28 20 L20 33 L12 20 Z" fill="none" stroke="#b01e22" strokeWidth="1.2" />
        <circle cx="20" cy="20" r="3" fill="#b01e22" />
      </svg>

      <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {TOP.map((c, i) => letter(c, i, "var(--gold-bright)"))}
        <span style={{ height: "8px" }} />
        {BOT.map((c, i) => letter(c, i, "#9a7a4a"))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ textAlign: "center", marginBottom: "14px" }}>
        <div style={{ color: "var(--muted)", fontSize: "9px", letterSpacing: "2px", fontFamily: '"Cinzel", serif' }}>MODE</div>
        <div style={{ color: "var(--gold-bright)", fontSize: "12px", fontFamily: '"Cinzel", serif', marginTop: "2px" }}>
          {classicTheme ? "Classic" : "Arcana"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M5 3 L14 9 L5 15 Z" fill="#b01e22" /></svg>
        <svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="4" width="12" height="10" rx="2" fill="none" stroke="#8a6a6a" strokeWidth="1.2" /></svg>
        <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6" fill="none" stroke="#8a6a6a" strokeWidth="1.2" /><path d="M9 5 V9 L12 11" stroke="#8a6a6a" strokeWidth="1.2" fill="none" /></svg>
      </div>
    </div>
  );
}