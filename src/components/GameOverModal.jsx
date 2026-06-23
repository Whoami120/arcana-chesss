import { useGameStore } from "../state/gameStore";

// Which tiers to show as the three summary stats, like chess.com.
const STATS = [
  { key: "Best", label: "best moves", color: "#7be0a0", glyph: "★" },
  { key: "Excellent", label: "excellent moves", color: "#9bd17a", glyph: "✓" },
  { key: "Blunder", label: "blunders", color: "#e0574f", glyph: "??" },
];

export default function GameOverModal() {
  const result = useGameStore((s) => s.result);
  const tally = useGameStore((s) => s.ratingTally);
  const resetGame = useGameStore((s) => s.resetGame);
  const backToMenu = useGameStore((s) => s.backToMenu);

  if (!result) return null;

  const youWon = result.winner === "White";
  const title = result.winner ? `${result.winner} wins` : "Draw";

  const line = youWon
    ? "Well played. Let's review your game and keep the momentum."
    : result.winner
    ? "This one didn't go your way — but don't be discouraged. Let's review together to help you improve."
    : "A hard-fought draw. Let's review the game together.";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "360px",
          background: "var(--panel)",
          border: "1px solid var(--gold)",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 0 50px rgba(0,0,0,0.6)",
          fontFamily: "serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            padding: "20px 20px 14px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: "var(--ash)",
              fontFamily: '"Cinzel", serif',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
            by {result.reason}
          </div>
        </div>

        {/* Encouraging line */}
        <div
          style={{
            padding: "16px 20px",
            color: "var(--ash)",
            fontSize: "14px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {line}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            padding: "8px 16px 18px",
          }}
        >
          {STATS.map((s) => (
            <div key={s.key} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "22px", color: s.color, lineHeight: 1 }}>
                {s.glyph}
              </div>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "var(--ash)",
                  marginTop: "4px",
                }}
              >
                {tally[s.key] || 0}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={backToMenu}
            style={{
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(180deg, var(--purple-bright), var(--purple))",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "15px",
              fontFamily: '"Cinzel", serif',
              letterSpacing: "1px",
            }}
          >
            New Game
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: "11px",
              borderRadius: "8px",
              border: "1px solid var(--purple-deep)",
              cursor: "pointer",
              background: "var(--panel-2)",
              color: "var(--ash)",
              fontWeight: "bold",
              fontSize: "14px",
              fontFamily: '"Cinzel", serif',
            }}
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}