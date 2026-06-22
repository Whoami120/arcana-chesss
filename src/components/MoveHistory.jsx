import { useGameStore } from "../state/gameStore";
import { Panel } from "./Ornaments";

export default function MoveHistory() {
  const moveLog = useGameStore((s) => s.moveLog);
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const result = useGameStore((s) => s.result);
  const classicTheme = useGameStore((s) => s.classicTheme);

  const pairs = [];
  for (let i = 0; i < moveLog.length; i += 2) {
    pairs.push({ n: i / 2 + 1, w: moveLog[i], b: moveLog[i + 1] });
  }

  const turnText = result ? "Game over" : game.turn() === "w" ? "Your turn" : "Opponent's turn";

  return (
    <Panel>
      <div style={{ fontFamily: '"Cinzel", serif', color: "var(--gold-bright)", letterSpacing: "1px", fontSize: "13px" }}>Move History</div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", marginTop: "8px", fontFamily: "monospace", fontSize: "13px", color: "var(--ash)" }}>
        {pairs.length === 0 && <div style={{ color: "var(--muted)" }}>No moves yet</div>}
        {pairs.map((p) => (
          <div key={p.n} style={{ display: "flex", gap: "10px", marginTop: "3px" }}>
            <span style={{ color: "var(--muted)", width: "18px" }}>{p.n}.</span>
            <span style={{ width: "48px" }}>{p.w}</span>
            <span>{p.b || ""}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid var(--border)", marginTop: "8px", paddingTop: "8px" }}>
        <div style={{ fontFamily: '"Cinzel", serif', color: "var(--gold-bright)", fontSize: "12px", letterSpacing: "1px", marginBottom: "5px" }}>Game Status</div>
        <div style={{ color: "var(--purple-bright)", fontSize: "13px" }}>{classicTheme ? "✦ Classic Mode" : "✦ Arcana Mode"}</div>
        <div style={{ color: "var(--ash)", fontSize: "13px", marginTop: "3px" }}>{turnText}</div>
        {result && (
          <div style={{ color: "var(--purple-bright)", fontSize: "13px", marginTop: "3px" }}>
            {result.winner ? `${result.winner} wins by ${result.reason}` : `Draw — ${result.reason}`}
          </div>
        )}
      </div>
    </Panel>
  );
}