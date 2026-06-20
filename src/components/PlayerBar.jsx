import { useGameStore } from "../state/gameStore";

export default function PlayerBar({ color, name, subtitle }) {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const seconds = useGameStore((s) => s.seconds);
  const result = useGameStore((s) => s.result);

  const isActive = !result && game.turn() === color;
  const clock = `0:${String(seconds).padStart(2, "0")}`;
  const clockColor = seconds <= 10 ? "var(--crimson-bright)" : "var(--ash)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "6px 10px",
        borderRadius: "8px",
        background: "var(--panel)",
        border: `1px solid ${isActive ? "var(--crimson)" : "var(--border)"}`,
        boxShadow: isActive ? "0 0 12px rgba(176,30,34,0.35)" : "none",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "var(--panel-2)",
          border: "1px solid var(--crimson-deep)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ash)",
          fontFamily: '"Cinzel", serif',
          fontSize: "12px",
          flexShrink: 0,
        }}
      >
        {name.charAt(0)}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: "var(--ash)",
            fontFamily: '"Cinzel", serif',
            fontSize: "13px",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <div style={{ color: "var(--muted)", fontSize: "10px", whiteSpace: "nowrap" }}>
          {subtitle}
        </div>
      </div>
      <div
        style={{
          marginLeft: "4px",
          minWidth: "46px",
          textAlign: "center",
          padding: "3px 6px",
          borderRadius: "6px",
          background: isActive ? "#2a0e10" : "var(--panel-2)",
          border: `1px solid ${isActive ? "var(--crimson)" : "var(--border)"}`,
          color: isActive ? clockColor : "var(--muted)",
          fontFamily: '"Cinzel", serif',
          fontSize: "13px",
        }}
      >
        {isActive ? clock : "—"}
      </div>
    </div>
  );
}