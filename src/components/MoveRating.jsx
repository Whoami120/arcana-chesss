import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { useGameStore } from "../state/gameStore";
import { getEvaluation, getTopMoves } from "../engine/stockfish";

const PV = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

// A tiny opening book (main lines). If the game so far matches the start of
// any line, the move is still "Theory."
const BOOK = [
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6",
  "e4 e5 Nf3 Nc6 Bc4 Bc5",
  "e4 e5 Nf3 Nc6 Bc4 Nf6",
  "e4 e5 Nf3 Nf6",
  "e4 e5 Nf3 d6",
  "e4 e5 Nc3",
  "e4 e5 Bc4",
  "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6",
  "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4",
  "e4 c5 Nc3",
  "e4 c5 c3",
  "e4 e6 d4 d5 Nc3",
  "e4 e6 d4 d5 Nd2",
  "e4 c6 d4 d5 Nc3",
  "e4 c6 d4 d5 e5",
  "e4 d5 exd5 Qxd5 Nc3",
  "e4 d6 d4 Nf6 Nc3",
  "e4 g6 d4 Bg7",
  "d4 d5 c4 e6 Nc3 Nf6",
  "d4 d5 c4 c6 Nf3 Nf6",
  "d4 d5 c4 dxc4",
  "d4 Nf6 c4 e6 Nc3 Bb4",
  "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6",
  "d4 Nf6 c4 e6 Nf3 b6",
  "d4 Nf6 Nf3 g6",
  "d4 f5",
  "c4 e5",
  "c4 Nf6",
  "c4 c5",
  "Nf3 d5",
  "Nf3 Nf6",
].map((l) => l.split(" "));

function inBook(moveLog) {
  if (moveLog.length === 0) return false;
  return BOOK.some(
    (line) =>
      moveLog.length <= line.length &&
      line.slice(0, moveLog.length).join(" ") === moveLog.join(" ")
  );
}

// Can the opponent immediately win material after your move? (light SEE)
function opponentCaptureGain(afterFen, moverColor) {
  const c = new Chess(afterFen);
  const caps = c
    .moves({ verbose: true })
    .filter((m) => m.flags.includes("c") || m.flags.includes("e"));
  let best = 0;
  for (const m of caps) {
    const capVal = PV[m.captured] || 0;
    const defended = c.isAttacked(m.to, moverColor); // can you recapture?
    const gain = defended ? capVal - (PV[m.piece] || 0) : capVal;
    if (gain > best) best = gain;
  }
  return best;
}

const TIERS = {
  Theory:     { color: "#b89455", glyph: "📖" },
  Brilliant:  { color: "#26c2c2", glyph: "!!" },
  Great:      { color: "#5b8def", glyph: "!" },
  Best:       { color: "#7be0a0", glyph: "★" },
  Excellent:  { color: "#9bd17a", glyph: "✓" },
  Good:       { color: "#b9c46a", glyph: "✓" },
  Miss:       { color: "#e89bb0", glyph: "✗" },
  Inaccuracy: { color: "#e6c84f", glyph: "?!" },
  Mistake:    { color: "#e09a4f", glyph: "?" },
  Blunder:    { color: "#e0574f", glyph: "??" },
};

export default function MoveRating() {
  const fen = useGameStore((s) => s.fen);
  const moveLog = useGameStore((s) => s.moveLog);
  const recordRating = useGameStore((s) => s.recordRating);

  const [rating, setRating] = useState(null);
  const [thinking, setThinking] = useState(false);
  const prevFenRef = useRef(fen);
  const lastJudgedRef = useRef(0);

  useEffect(() => {
    const before = prevFenRef.current;
    const after = fen;
    prevFenRef.current = after;

    if (moveLog.length === lastJudgedRef.current) return;
    lastJudgedRef.current = moveLog.length;

    // Only rate White's moves.
    const whiteJustMoved = after.split(" ")[1] === "b";
    if (!whiteJustMoved) return;

    const lastSan = moveLog[moveLog.length - 1];
    if (lastSan === "Sacrifice") return;

    // Theory is instant — no engine needed.
    if (inBook(moveLog)) {
      setThinking(false);
      setRating({ text: "Theory", ...TIERS.Theory });
      recordRating("Theory");
      return;
    }

    let cancelled = false;
    setThinking(true);
    setRating(null);

    (async () => {
      const top = await getTopMoves(before, { movetime: 250, multipv: 2 });
      const actualAfter = await getEvaluation(after, { movetime: 250 });
      if (cancelled) return;

      if (!top || top.length === 0 || actualAfter === null) {
        setThinking(false);
        setRating({ text: "—", color: "var(--muted)", glyph: "" });
        return;
      }

      const best = top[0].score;
      const second = top.length >= 2 ? top[1].score : null;
      const bestBefore = best; // best score available to you before moving (White view)
      const loss = Math.max(0, (best - actualAfter) / 100); // pawns lost vs best
      const onlyGoodMove = second !== null && (best - second) / 100 >= 1.5;
      const sacrifice =
        opponentCaptureGain(after, "w") >= 2 && actualAfter >= -50;

      // MISS: a winning chance was on the table (best move wins a lot) but the
      // move you played let a big chunk of it slip. Not a bad move by itself —
      // a missed gift.
      const missed =
        bestBefore / 100 >= 2 && loss >= 1.5;

      let text;
      if (sacrifice && loss < 0.3) text = "Brilliant";
      else if (onlyGoodMove && loss < 0.2) text = "Great";
      else if (loss < 0.1) text = "Best";
      else if (loss < 0.35) text = "Excellent";
      else if (loss < 0.7) text = "Good";
      else if (loss < 1.2) text = "Inaccuracy";
      else if (missed) text = "Miss";
      else if (loss < 2.5) text = "Mistake";
      else text = "Blunder";

      setThinking(false);
      setRating({ text, ...TIERS[text] });
      recordRating(text);
    })();

    return () => {
      cancelled = true;
    };
  }, [fen, moveLog]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "14px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--panel)",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          letterSpacing: "1px",
          color: "var(--muted)",
          textTransform: "uppercase",
          fontFamily: '"Cinzel", serif',
        }}
      >
        Your Move
      </div>

      {thinking ? (
        <div style={{ color: "var(--muted)", fontSize: "14px" }}>Judging…</div>
      ) : rating ? (
        <>
          <div style={{ fontSize: "38px", lineHeight: 1, color: rating.color }}>
            {rating.glyph}
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: rating.color,
              fontFamily: '"Cinzel", serif',
              textAlign: "center",
            }}
          >
            {rating.text}
          </div>
        </>
      ) : (
        <div style={{ color: "var(--muted)", fontSize: "13px", textAlign: "center" }}>
          Make a move to see its rating.
        </div>
      )}
    </div>
  );
}
