import { useGameStore } from "../state/gameStore";
import { LEVELS } from "../ai/levels";

export default function LevelSelect() {
  const startWithLevel = useGameStore((s) => s.startWithLevel);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "18px", background: "var(--bg)", fontFamily: "serif" }}>
      <div style={{ fontSize: "34px", fontWeight: "bold", color: "var(--gold-bright)", fontFamily: '"Cinzel", serif', letterSpacing: "3px" }}>
        ARCANA CHESS
      </div>
      <div style={{ color: "var(--muted)", fontSize: "13px", letterSpacing: "1px", marginBottom: "6px" }}>
        Choose your opponent
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "440px" }}>
        {LEVELS.map((lv) => (
          <button
            key={lv.id}
            onClick={() => startWithLevel(lv)}
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid var(--gold)",
              background: "var(--panel-2)",
              color: "var(--ash)",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: '"Cinzel", serif',
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: "bold", color: "var(--gold-bright)" }}>
              {lv.name}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "3px" }}>
              {lv.elo ? `~${lv.elo} Elo` : "Full strength"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}