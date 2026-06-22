import { useGameStore } from "../state/gameStore";

export default function PlayerBar({ color, name, rating }) {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const seconds = useGameStore((s) => s.seconds);
  const result = useGameStore((s) => s.result);

  const isActive = !result && game.turn() === color;
  const clock = `0:${String(seconds).padStart(2, "0")}`;
  const clockColor = seconds <= 10 ? "var(--purple-bright)" : "var(--ash)";
  const accent = isActive ? "var(--purple)" : "var(--gold)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "11px", width: "100%", padding: "9px 13px", borderRadius: "10px", background: "var(--panel)", border: `1px solid ${accent}`, boxShadow: isActive ? "0 0 14px rgba(122,79,240,0.3)" : "inset 0 0 14px rgba(58,37,102,0.25)" }}>
      <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "var(--panel-2)", border: `2px solid ${accent}`, boxShadow: "inset 0 0 0 1px var(--purple-deep)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold-bright)", fontFamily: '"Cinzel", serif', fontSize: "15px", flexShrink: 0 }}>
        {name.charAt(0)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "var(--ash)", fontFamily: '"Cinzel", serif', fontSize: "14px", lineHeight: 1.1, whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ color: "var(--gold)", fontSize: "11px" }}>★ {rating}</div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ minWidth: "56px", textAlign: "center", padding: "6px 9px", borderRadius: "6px", background: isActive ? "#1c1430" : "var(--panel-2)", border: `1px solid ${isActive ? "var(--purple)" : "var(--border)"}`, color: isActive ? clockColor : "var(--muted)", fontFamily: '"Cinzel", serif', fontSize: "15px" }}>
        {isActive ? clock : "—"}
      </div>
    </div>
  );
}