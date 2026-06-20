import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "./state/gameStore";
import CardBar from "./components/CardBar";

export default function App() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const seconds = useGameStore((s) => s.seconds);
  const result = useGameStore((s) => s.result);
  const classicTheme = useGameStore((s) => s.classicTheme);
  const makeMove = useGameStore((s) => s.makeMove);
  const tick = useGameStore((s) => s.tick);

  const sacrifice = useGameStore((s) => s.sacrifice);
  const cardMessage = useGameStore((s) => s.cardMessage);
  const sacrificeClick = useGameStore((s) => s.sacrificeClick);
  const cancelSacrifice = useGameStore((s) => s.cancelSacrifice);
  const moveLog = useGameStore((s) => s.moveLog);

  const [pendingPromotion, setPendingPromotion] = useState(null);

  useEffect(() => {
    if (result) return; // game over -> stop the timer
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [result, tick]);

  const turn = game.turn() === "w" ? "White" : "Black";
  const moves = moveLog;

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
    if (sacrifice.active) return false;

    const legalMoves = game.moves({ square: sourceSquare, verbose: true });
    const isPromotion = legalMoves.some(
      (m) => m.to === targetSquare && m.promotion
    );

    if (isPromotion) {
      setPendingPromotion({
        from: sourceSquare,
        to: targetSquare,
        color: game.turn(),
      });
      return false;
    }

    return makeMove(sourceSquare, targetSquare);
  }

  function choosePromotion(pieceType) {
    if (!pendingPromotion) return;
    makeMove(pendingPromotion.from, pendingPromotion.to, pieceType);
    setPendingPromotion(null);
  }

  function onSquareClick(arg) {
    const square = typeof arg === "string" ? arg : arg && arg.square;
    if (!square) return;
    sacrificeClick(square);
  }

  const squareStyles = {};
  if (sacrifice.fromSquare) {
    squareStyles[sacrifice.fromSquare] = {
      boxShadow: "inset 0 0 0 4px rgba(200, 50, 50, 0.9)",
    };
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop: onPieceDrop,
    onSquareClick: onSquareClick,
    squareStyles: squareStyles,
    showAnimations: false,
  };

  const timerColor = seconds <= 10 ? "#c0392b" : "#222";

  const promotionChoices = [
    { type: "q", name: "Queen", glyph: "♛" },
    { type: "r", name: "Rook", glyph: "♜" },
    { type: "b", name: "Bishop", glyph: "♝" },
    { type: "n", name: "Knight", glyph: "♞" },
  ];

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h1 style={{ textAlign: "center", fontFamily: "serif" }}>
        Arcana Chess
      </h1>

      <p style={{ textAlign: "center", color: "#555" }}>
        Mode: {classicTheme ? "Classic (cards disabled)" : "Arcana"}
      </p>

      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 0", maxWidth: "500px" }}>
          <CardBar color="b" label="Black" />

          {result ? (
            <p
              style={{
                textAlign: "center",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#c0392b",
              }}
            >
              {result.winner
                ? `${result.winner} wins by ${result.reason}!`
                : `Draw — ${result.reason}.`}
            </p>
          ) : (
            <p style={{ textAlign: "center", fontSize: "18px" }}>
              Turn: <strong>{turn}</strong> &nbsp;|&nbsp; Time:{" "}
              <strong style={{ color: timerColor }}>{seconds}s</strong>
            </p>
          )}

          {sacrifice.active && (
            <div style={{ textAlign: "center", margin: "8px 0" }}>
              <p style={{ color: "#c0392b", fontWeight: "bold", margin: "4px 0" }}>
                {cardMessage}
              </p>
              <button
                onClick={cancelSacrifice}
                style={{ padding: "6px 12px", cursor: "pointer", color: "#222" }}
              >
                Cancel Sacrifice
              </button>
            </div>
          )}

          <Chessboard key={fen} options={chessboardOptions} />

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

      {pendingPromotion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#f4f4f4",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#222", margin: "0 0 12px", fontWeight: "bold" }}>
              Choose a piece
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {promotionChoices.map((p) => {
                const isWhite = pendingPromotion.color === "w";
                return (
                  <button
                    key={p.type}
                    onClick={() => choosePromotion(p.type)}
                    title={p.name}
                    style={{
                      width: "64px",
                      height: "64px",
                      cursor: "pointer",
                      borderRadius: "8px",
                      border: "1px solid #888",
                      background: "#fff",
                      fontSize: "40px",
                      lineHeight: 1,
                      color: isWhite ? "#fff" : "#000",
                      textShadow: isWhite
                        ? "0 0 1px #000, 0 0 2px #000, 0 0 3px #000"
                        : "none",
                    }}
                  >
                    {p.glyph}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}