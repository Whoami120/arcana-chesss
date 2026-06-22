import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";
import { getBestMove } from "../engine/stockfish";

export default function SeerProphecy() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const result = useGameStore((s) => s.result);
  const seer = useGameStore((s) => s.seer);
  const seerSuggestion = useGameStore((s) => s.seerSuggestion);
  const setSeerSuggestion = useGameStore((s) => s.setSeerSuggestion);

  // Only show a move on the owner's own turn (opponent never sees it).
  const myTurn = seer.active && game.turn() === seer.color && !result;

  // Remember which position we already asked Stockfish about.
  const askedFor = useRef(null);

  useEffect(() => {
    if (!myTurn) return;
    if (seerSuggestion !== null) return; // already have a reading
    if (askedFor.current === fen) return; // already asked for this position
    askedFor.current = fen;

    let cancelled = false;
    getBestMove(fen, { movetime: 600 })
      .then((move) => {
        if (!cancelled) setSeerSuggestion(move || "unavailable");
      })
      .catch(() => {
        if (!cancelled) setSeerSuggestion("unavailable");
      });

    return () => {
      cancelled = true;
    };
  }, [myTurn, fen, seerSuggestion, setSeerSuggestion]);

  if (!seer.active) return null;

  let body;
  if (!myTurn) {
    body = "The Seer waits for your turn…";
  } else if (seerSuggestion === null) {
    body = "Consulting the Seer…";
  } else if (seerSuggestion === "unavailable") {
    body = "Prophecy unavailable.";
  } else {
    const from = seerSuggestion.slice(0, 2);
    const to = seerSuggestion.slice(2, 4);
    body = `${from} → ${to}`;
  }

  return (
    <div
      style={{
        margin: "10px 0",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid var(--gold, #b89455)",
        background: "var(--panel-2, #181426)",
        color: "var(--ash, #e0d8ec)",
        fontFamily: "serif",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          letterSpacing: "1px",
          color: "var(--gold-bright, #d9b87a)",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        The Seer · {seer.turnsLeft} {seer.turnsLeft === 1 ? "vision" : "visions"} left
      </div>
      <div style={{ fontSize: "20px", fontWeight: "bold" }}>{body}</div>
    </div>
  );
}