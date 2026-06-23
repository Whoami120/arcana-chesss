import { useGameStore } from "../state/gameStore";

export default function SilenceStatus() {
  const silence = useGameStore((s) => s.silence);
  const silenceMessage = useGameStore((s) => s.silenceMessage);

  // You (White) trap Black, so a trap waiting on Black is "yours".
  const youTrappedOpponent = silence.b;

  if (!youTrappedOpponent && !silenceMessage) return null;

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #5a2030",
        background: "var(--panel-2)",
        color: "var(--ash)",
        fontFamily: "serif",
        textAlign: "center",
      }}
    >
      {youTrappedOpponent && (
        <div style={{ color: "#c0414f", fontWeight: "bold", letterSpacing: "1px", fontSize: "13px" }}>
          🤫 Silence Active
        </div>
      )}
      {silenceMessage && (
        <div style={{ color: "var(--gold-bright)", fontSize: "12px", marginTop: youTrappedOpponent ? "4px" : 0 }}>
          {silenceMessage}
        </div>
      )}
    </div>
  );
}