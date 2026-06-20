import { useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "./store/gameStore";
import CardBar from "./components/CardBar";

export default function App() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const seconds = useGameStore((s) => s.seconds);
  const timeoutWinner = useGameStore((s) => s.timeoutWinner);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const classicTheme = useGameStore((s) => s.classicTheme);
  const makeMove = useGameStore((s) => s.makeMove);
  const tick = useGameStore((s) => s.tick);

  useEffect(() => {
    if (timeoutWinner) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [timeoutWinner, tick]);

  const turn = game.turn() === "w" ? "White" : "Black";
  const moves = game.history();

  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare) return false;
    return makeMove(sourceSquare, targetSquare);
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop: onPieceDrop,
  };

  const timerColor = seconds <= 10 ? "#c0392b" : "#222";

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center", fontFamily: "serif" }}>
        Arcana Chess
      </h1>

      {/* Banner showing the current mode */}
      <p style={{ textAlign: "center", color: "#555" }}>
        Mode: {classicTheme ? "Classic (cards disabled)" : "Arcana"}
      </p>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 0", maxWidth: "500px" }}>
          <CardBar color="b" label="Black" />

          {timeoutWinner ? (
            <p
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#c0392b",
              }}
            >
              Time's up! {timeoutWinner} wins.
            </p>
          ) : (
            <p style={{ textAlign: "center", fontSize: "18px" }}>
              Turn: <strong>{turn}</strong> &nbsp;|&nbsp; Time:{" "}
              <strong style={{ color: timerColor }}>{seconds}s</strong>
            </p>
          )}

          <Chessboard options={chessboardOptions} />

          <CardBar color="w" label="White" />
        </div>

        <div
          style={{
            width: "180px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            fontFamily: "monospace",
            fontSize: "14px",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <strong>Moves</strong>
          {movePairs.length === 0 && (
            <p style={{ color: "#888" }}>No moves yet</p>
          )}
          {movePairs.map((pair) => (
            <div key={pair.number} style={{ marginTop: "4px" }}>
              {pair.number}. {pair.white} {pair.black || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}