import { useGameStore } from "../state/gameStore";

export default function SeerProphecy() {
  const game = useGameStore((s) => s.game);
  const result = useGameStore((s) => s.result);
  const seer = useGameStore((s) => s.seer);
  const seerSuggestion = useGameStore((s) => s.seerSuggestion);

  if (!seer.active) return null;

  const myTurn = game.turn() === seer.color && !result;

  let body;
  if (!myTurn) body = "Waits for your turn…";
  else if (seerSuggestion === null) body = "Consulting the Seer…";
  else if (seerSuggestion === "unavailable") body = "Prophecy unavailable.";
  else body = `${seerSuggestion.slice(0, 2)} → ${seerSuggestion.slice(2, 4)}`;

  return (
    <div style={{ marginTop: "10px", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--gold)", background: "var(--panel-2)", color: "var(--ash)", fontFamily: "serif" }}>
      <div style={{ fontSize: "11px", letterSpacing: "1px", color: "var(--gold-bright)", textTransform: "uppercase", marginBottom: "4px" }}>
        The Seer · {seer.turnsLeft} {seer.turnsLeft === 1 ? "vision" : "visions"} left
      </div>
      <div style={{ fontSize: "18px", fontWeight: "bold" }}>{body}</div>
    </div>
  );
}