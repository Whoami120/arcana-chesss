import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "./state/gameStore";
import CardBar from "./components/CardBar";
import PlayerBar from "./components/PlayerBar";

export default function App() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
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
    if (result) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [result, tick]);

  const moves = moveLog;
  const movePairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({ number: i / 2 + 1, white: moves[i], black: moves[i + 1] });
  }

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare) return false;
    if (sacrifice.active) return false;
    const legalMoves = game.moves({ square: sourceSquare, verbose: true });
    const isPromotion = legalMoves.some((m) => m.to === targetSquare && m.promotion);
    if (isPromotion) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare, color: game.turn() });
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
      boxShadow: "inset 0 0 0 4px rgba(224, 50, 44, 0.9)",
    };
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    showAnimations: false,
    darkSquareStyle: { backgroundColor: "#261819" },
    lightSquareStyle: { backgroundColor: "#53413f" },
    boardStyle: {
      borderRadius: "3px",
      boxShadow: "0 0 0 2px #8b2024, 0 0 30px rgba(139,20,24,0.45)",
    },
  };

  const promotionChoices = [
    { type: "q", name: "Queen", glyph: "♛" },
    { type: "r", name: "Rook", glyph: "♜" },
    { type: "b", name: "Bishop", glyph: "♝" },
    { type: "n", name: "Knight", glyph: "♞" },
  ];

  const stripStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", padding: "10px 18px", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h1 style={{ color: "var(--crimson)", margin: 0, fontSize: "26px" }}>Arcana Chess</h1>
        <div style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "2px" }}>
          Mode: {classicTheme ? "Classic (cards disabled)" : "Arcana"}
          {result && (
            <span style={{ color: "var(--crimson-bright)", fontWeight: "bold", marginLeft: "10px", letterSpacing: 0 }}>
              · {result.winner ? `${result.winner} wins by ${result.reason}` : `Draw — ${result.reason}`}
            </span>
          )}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: "18px", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "min(62vh, 580px)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={stripStyle}>
            <PlayerBar color="b" name="Mortlake" subtitle="the crimson choir" />
            <CardBar color="b" />
          </div>

          {sacrifice.active && (
            <div style={{ textAlign: "center", fontSize: "13px" }}>
              <span style={{ color: "var(--crimson-bright)", fontWeight: "bold" }}>{cardMessage}</span>{" "}
              <button
                onClick={cancelSacrifice}
                style={{
                  padding: "3px 8px",
                  cursor: "pointer",
                  color: "var(--ash)",
                  background: "var(--panel-2)",
                  border: "1px solid var(--crimson-deep)",
                  borderRadius: "5px",
                  fontSize: "12px",
                }}
              >
                Cancel
              </button>
            </div>
          )}

          <div style={{ width: "100%" }}>
            <Chessboard key={fen} options={chessboardOptions} />
          </div>

          <div style={stripStyle}>
            <PlayerBar color="w" name="Ashcroft" subtitle="the seeker (you)" />
            <CardBar color="w" />
          </div>
        </div>

        <div
          style={{
            width: "168px",
            alignSelf: "stretch",
            overflowY: "auto",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "10px",
            background: "var(--panel)",
            color: "var(--ash)",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          <strong style={{ fontFamily: '"Cinzel", serif', color: "var(--crimson)", letterSpacing: "1px", fontSize: "12px" }}>
            Chronicle
          </strong>
          {movePairs.length === 0 && <p style={{ color: "var(--muted)" }}>No moves yet</p>}
          {movePairs.map((pair) => (
            <div key={pair.number} style={{ marginTop: "3px" }}>
              {pair.number}. {pair.white} {pair.black || ""}
            </div>
          ))}
        </div>
      </div>

      {pendingPromotion && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <div style={{ background: "var(--panel-2)", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--crimson-deep)" }}>
            <p style={{ color: "var(--ash)", margin: "0 0 12px", fontWeight: "bold", fontFamily: '"Cinzel", serif' }}>
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
                      border: "1px solid var(--crimson-deep)",
                      background: "#cabfb4",
                      fontSize: "40px",
                      lineHeight: 1,
                      color: isWhite ? "#fff" : "#000",
                      textShadow: isWhite ? "0 0 1px #000, 0 0 2px #000" : "none",
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