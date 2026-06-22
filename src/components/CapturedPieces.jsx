import { useGameStore } from "../state/gameStore";
import { Panel } from "./Ornaments";

const START = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const GLYPH = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛" };

export default function CapturedPieces() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);

  const counts = { w: {}, b: {} };
  game.board().forEach((row) =>
    row.forEach((sq) => {
      if (sq) counts[sq.color][sq.type] = (counts[sq.color][sq.type] || 0) + 1;
    })
  );

  const missing = (clr) => {
    const out = [];
    Object.keys(START).forEach((t) => {
      const n = START[t] - (counts[clr][t] || 0);
      for (let i = 0; i < n; i++) out.push(GLYPH[t]);
    });
    return out;
  };

  const Row = ({ label, glyphs }) => (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ color: "var(--muted)", fontSize: "10px", letterSpacing: "1px", marginBottom: "5px" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", minHeight: "24px" }}>
        {glyphs.length === 0 ? (
          <span style={{ color: "var(--muted)", fontSize: "13px" }}>—</span>
        ) : (
          glyphs.map((g, i) => <span key={i} style={{ fontSize: "20px", color: "var(--ash)" }}>{g}</span>)
        )}
      </div>
    </div>
  );

  return (
    <Panel>
      <div style={{ fontFamily: '"Cinzel", serif', color: "var(--gold-bright)", letterSpacing: "1px", fontSize: "13px", marginBottom: "14px" }}>
        Captured Pieces
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <Row label="You captured" glyphs={missing("b")} />
        <Row label="Lost" glyphs={missing("w")} />
      </div>
    </Panel>
  );
}