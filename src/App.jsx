import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "./state/gameStore";
import { getCard } from "./cards";
import CardBar from "./components/CardBar";
import PlayerBar from "./components/PlayerBar";
import TopBar from "./components/TopBar";
import CapturedPieces from "./components/CapturedPieces";
import MoveHistory from "./components/MoveHistory";
import CardActivation from "./components/CardActivation";
import BoardSigil from "./components/BoardSigil";
import { Corner, Panel } from "./components/Ornaments";
import SeerProphecy from "./components/SeerProphecy";

export default function App() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const result = useGameStore((s) => s.result);
  const makeMove = useGameStore((s) => s.makeMove);
  const tick = useGameStore((s) => s.tick);
  const oppCount = useGameStore((s) => s.cards.b.length);
  const classicTheme = useGameStore((s) => s.classicTheme);

  const myCards = useGameStore((s) => s.cards.w);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const playCard = useGameStore((s) => s.playCard);
  const isFirstTurn = useGameStore((s) => s.isFirstTurn);

  const sacrifice = useGameStore((s) => s.sacrifice);
  const cardMessage = useGameStore((s) => s.cardMessage);
  const sacrificeClick = useGameStore((s) => s.sacrificeClick);
  const cancelSacrifice = useGameStore((s) => s.cancelSacrifice);

  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    if (result) return;
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, [result, tick]);

  useEffect(() => {
    setSelectedCardId(null);
  }, [fen]);

  const selectedCard = myCards.find((c) => c.id === selectedCardId) || null;
  const selectedDef = selectedCard ? getCard(selectedCard.id) : null;
  const canActivate =
    !!selectedCard &&
    !selectedCard.used &&
    game.turn() === "w" &&
    !cardsDisabled &&
    !result &&
    !sacrifice.active &&
    !(selectedDef.firstTurnOnly && !isFirstTurn("w"));

  function toggleSelect(id) {
    setSelectedCardId((prev) => (prev === id ? null : id));
  }
  function activateSelected() {
    if (!selectedCardId) return;
    playCard("w", selectedCardId);
    setSelectedCardId(null);
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
    squareStyles[sacrifice.fromSquare] = { boxShadow: "inset 0 0 0 4px rgba(155, 111, 240, 0.9)" };
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    showAnimations: false,
    darkSquareStyle: { backgroundColor: classicTheme ? "#b58863" : "#241f2e" },
    lightSquareStyle: { backgroundColor: classicTheme ? "#f0d9b5" : "#c9c2d6" },
    boardStyle: { borderRadius: "2px" },
  };

  const frameStyle = {
    position: "relative",
    width: "min(100%, calc(100vh - 350px))",
    padding: classicTheme ? "8px" : "10px",
    background: classicTheme ? "#2a241c" : "#0d0a16",
    border: classicTheme ? "2px solid #6b5640" : "2px solid var(--gold)",
    borderRadius: classicTheme ? "4px" : "6px",
    boxShadow: classicTheme ? "none" : "0 0 40px rgba(122,79,240,0.28)",
    transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
  };

  const promotionChoices = [
    { type: "q", name: "Queen", glyph: "♛" },
    { type: "r", name: "Rook", glyph: "♜" },
    { type: "b", name: "Bishop", glyph: "♝" },
    { type: "n", name: "Knight", glyph: "♞" },
  ];

  const cell = { minWidth: 0, minHeight: 0 };

  return (
    <div style={{ height: "100vh", overflow: "hidden", padding: "12px", display: "grid", gridTemplateColumns: "220px 1fr 240px", gridTemplateRows: "auto 1fr auto", gridTemplateAreas: '"tl tc tr" "ml mc mr" "bl bc br"', gap: "12px" }}>
      <div style={{ ...cell, gridArea: "tl", display: "flex", alignItems: "center" }}>
        <PlayerBar color="b" name="Opponent" rating={1897} />
      </div>

      <div style={{ ...cell, gridArea: "tc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TopBar />
      </div>

      <div style={{ ...cell, gridArea: "tr" }}>
        <Panel style={{ alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <div style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "1px", fontFamily: '"Cinzel", serif' }}>Opponent Cards</div>
          <CardBar color="b" compact />
          <div style={{ color: "var(--gold-bright)", fontSize: "12px" }}>▮ {oppCount}</div>
        </Panel>
      </div>

      <div style={{ ...cell, gridArea: "ml" }}>
        <CapturedPieces />
      </div>

      <div style={{ ...cell, gridArea: "mc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {(result || sacrifice.active) && (
          <div style={{ minHeight: "20px", textAlign: "center" }}>
            {sacrifice.active ? (
              <span style={{ color: "var(--purple-bright)", fontWeight: "bold", fontSize: "13px" }}>
                {cardMessage}{" "}
                <button onClick={cancelSacrifice} style={{ padding: "3px 8px", cursor: "pointer", color: "var(--ash)", background: "var(--panel-2)", border: "1px solid var(--purple-deep)", borderRadius: "5px", fontSize: "12px" }}>
                  Cancel
                </button>
              </span>
            ) : (
              <span style={{ color: "var(--purple-bright)", fontWeight: "bold", fontSize: "16px", fontFamily: '"Cinzel", serif' }}>
                {result.winner ? `${result.winner} wins by ${result.reason}` : `Draw — ${result.reason}`}
              </span>
            )}
          </div>
        )}

        <div style={frameStyle}>
          {!classicTheme && (
            <>
              <Corner pos="tl" size={18} />
              <Corner pos="tr" size={18} />
              <Corner pos="bl" size={18} />
              <Corner pos="br" size={18} />
            </>
          )}
          <div style={{ position: "relative" }}>
            <Chessboard key={fen} options={chessboardOptions} />
            {!classicTheme && <BoardSigil />}
          </div>
        </div>
      </div>

      <div style={{ ...cell, gridArea: "mr" }}>
        <MoveHistory />
        <SeerProphecy />
      </div>

      <div style={{ ...cell, gridArea: "bl", display: "flex", alignItems: "center" }}>
        <PlayerBar color="w" name="You" rating={1923} />
      </div>

      <div style={{ ...cell, gridArea: "bc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        <div style={{ color: "var(--muted)", fontSize: "11px", letterSpacing: "1px", fontFamily: '"Cinzel", serif' }}>
          {classicTheme ? "Cards Sealed" : "Your Cards"}
        </div>
        <CardBar color="w" onSelect={toggleSelect} selectedId={selectedCardId} />
      </div>

      <div style={{ ...cell, gridArea: "br" }}>
        <CardActivation def={selectedDef} canActivate={canActivate} onActivate={activateSelected} onCancel={() => setSelectedCardId(null)} classic={classicTheme} />
      </div>

      {pendingPromotion && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          <div style={{ background: "var(--panel-2)", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px solid var(--gold)" }}>
            <p style={{ color: "var(--ash)", margin: "0 0 12px", fontWeight: "bold", fontFamily: '"Cinzel", serif' }}>Choose a piece</p>
            <div style={{ display: "flex", gap: "8px" }}>
              {promotionChoices.map((p) => {
                const isWhite = pendingPromotion.color === "w";
                return (
                  <button key={p.type} onClick={() => choosePromotion(p.type)} title={p.name} style={{ width: "64px", height: "64px", cursor: "pointer", borderRadius: "8px", border: "1px solid var(--gold)", background: "#cabfb4", fontSize: "40px", lineHeight: 1, color: isWhite ? "#fff" : "#000", textShadow: isWhite ? "0 0 1px #000, 0 0 2px #000" : "none" }}>
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