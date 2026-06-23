import { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { useGameStore } from "./state/gameStore";
import { getCard } from "./cards";
import { getBestMove, getMoveAtLevel, getEvaluation } from "./engine/stockfish";
import { chooseAiCard } from "./ai/cardBrain";
import CardBar from "./components/CardBar";
import PlayerBar from "./components/PlayerBar";
import TopBar from "./components/TopBar";
import MoveRating from "./components/MoveRating";
import MoveHistory from "./components/MoveHistory";
import CardActivation from "./components/CardActivation";
import BoardSigil from "./components/BoardSigil";
import { Corner, Panel } from "./components/Ornaments";
import SeerProphecy from "./components/SeerProphecy";
import GameOverModal from "./components/GameOverModal";
import SilenceStatus from "./components/SilenceStatus";
import LevelSelect from "./components/LevelSelect";

export default function App() {
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const result = useGameStore((s) => s.result);
  const makeMove = useGameStore((s) => s.makeMove);
  const tick = useGameStore((s) => s.tick);
  const oppCount = useGameStore((s) => s.cards.b.length);
  const classicTheme = useGameStore((s) => s.classicTheme);
  const lastMove = useGameStore((s) => s.lastMove);

  const myCards = useGameStore((s) => s.cards.w);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const playCard = useGameStore((s) => s.playCard);
  const isFirstTurn = useGameStore((s) => s.isFirstTurn);

  const blackCards = useGameStore((s) => s.cards.b);
  const whiteCards = useGameStore((s) => s.cards.w);
  const aiPlayCard = useGameStore((s) => s.playCard);

  const sacrifice = useGameStore((s) => s.sacrifice);
  const cardMessage = useGameStore((s) => s.cardMessage);
  const sacrificeClick = useGameStore((s) => s.sacrificeClick);
  const cancelSacrifice = useGameStore((s) => s.cancelSacrifice);

  // ---- AI OPPONENT ----
  const aiLevel = useGameStore((s) => s.aiLevel);
  const gameStarted = useGameStore((s) => s.gameStarted);

  // ---- SEER ----
  const seer = useGameStore((s) => s.seer);
  const seerSuggestion = useGameStore((s) => s.seerSuggestion);
  const setSeerSuggestion = useGameStore((s) => s.setSeerSuggestion);
  const askedFor = useRef(null);

  const seerMyTurn = seer.active && game.turn() === seer.color && !result;

  // When it's the Seer owner's turn, ask Stockfish for the best move once.
  useEffect(() => {
    if (!seerMyTurn) return;
    if (seerSuggestion !== null) return;
    if (askedFor.current === fen) return;
    askedFor.current = fen;
    getBestMove(fen, { movetime: 600 })
      .then((move) => setSeerSuggestion(move || "unavailable"))
      .catch(() => setSeerSuggestion("unavailable"));
  }, [seerMyTurn, fen, seerSuggestion, setSeerSuggestion]);

  // AI opponent: when it's Black's turn, maybe play a card, then move.
  const aiThinking = useRef(false);
  useEffect(() => {
    if (!gameStarted || !aiLevel || result || sacrifice.active || game.turn() !== "b") {
      aiThinking.current = false;
      return;
    }
    if (aiThinking.current) return;
    aiThinking.current = true;

    let cancelled = false;

    const run = async () => {
      // 1) Decide on a card, using the current eval (Black's point of view).
      try {
        const evalWhite = await getEvaluation(fen, { movetime: 250 });
        const evalForBlack = evalWhite === null ? null : -evalWhite;
        const choice = chooseAiCard({
          myCards: blackCards,
          oppCards: whiteCards,
          evalForBlack,
          moveNumber: game.history().length,
        });
        if (!cancelled && choice) {
          aiPlayCard("b", choice);
          // small pause so the card visibly happens before the move
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        // ignore — never let a card error block the move
      }

      if (cancelled) return;

      // 2) Make the chess move (use the latest fen after any card effect).
      const liveFen = useGameStore.getState().fen;
      const stillBlack = useGameStore.getState().game.turn() === "b";
      if (!stillBlack) {
        aiThinking.current = false;
        return;
      }
      const uci = await getMoveAtLevel(liveFen, {
        elo: aiLevel.elo,
        movetime: aiLevel.movetime,
        weakness: aiLevel.weakness,
      });
      if (!cancelled && uci && uci.length >= 4) {
        makeMove(uci.slice(0, 2), uci.slice(2, 4), uci.slice(4, 5) || "q");
      }
      aiThinking.current = false;
    };

    const t = setTimeout(run, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
      aiThinking.current = false;
    };
  }, [gameStarted, aiLevel, result, fen, game, sacrifice.active, makeMove, blackCards, whiteCards, aiPlayCard]);

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
    // Only let the human move White pieces.
    if (game.turn() !== "w") return false;
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
  // Last-move trace (like chess.com) — soft gold on both squares.
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: "rgba(212, 175, 90, 0.45)" };
    squareStyles[lastMove.to] = { backgroundColor: "rgba(212, 175, 90, 0.65)" };
  }
  if (sacrifice.fromSquare) {
    squareStyles[sacrifice.fromSquare] = { boxShadow: "inset 0 0 0 4px rgba(190, 45, 60, 0.95)" };
  }
  // Seer board glow: gold on the from-square, green on the to-square.
  if (seerMyTurn && seerSuggestion && seerSuggestion !== "unavailable") {
    const fromSq = seerSuggestion.slice(0, 2);
    const toSq = seerSuggestion.slice(2, 4);
    squareStyles[fromSq] = { animation: "seerPulseFrom 1.2s ease-in-out infinite" };
    squareStyles[toSq] = { animation: "seerPulseTo 1.2s ease-in-out infinite" };
  }

  const chessboardOptions = {
    position: fen,
    onPieceDrop,
    onSquareClick,
    squareStyles,
    showAnimations: false,
    darkSquareStyle: { backgroundColor: classicTheme ? "#b58863" : "#6e1622" },
    lightSquareStyle: { backgroundColor: classicTheme ? "#f0d9b5" : "#f0e6e8" },
    boardStyle: { borderRadius: "2px" },
  };

  const frameStyle = {
    position: "relative",
    width: "min(100%, calc(100vh - 350px))",
    padding: classicTheme ? "8px" : "10px",
    background: classicTheme ? "#2a241c" : "#150708",
    border: classicTheme ? "2px solid #6b5640" : "2px solid var(--gold)",
    borderRadius: classicTheme ? "4px" : "6px",
    boxShadow: classicTheme ? "none" : "0 0 40px rgba(150, 20, 35, 0.32)",
    transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
  };

  const promotionChoices = [
    { type: "q", name: "Queen", glyph: "♛" },
    { type: "r", name: "Rook", glyph: "♜" },
    { type: "b", name: "Bishop", glyph: "♝" },
    { type: "n", name: "Knight", glyph: "♞" },
  ];

  const cell = { minWidth: 0, minHeight: 0 };

  if (!gameStarted) return <LevelSelect />;

  return (
    <div style={{ height: "100vh", overflow: "hidden", padding: "12px", display: "grid", gridTemplateColumns: "220px 1fr 240px", gridTemplateRows: "auto 1fr auto", gridTemplateAreas: '"tl tc tr" "ml mc mr" "bl bc br"', gap: "12px" }}>
      <div style={{ ...cell, gridArea: "tl", display: "flex", alignItems: "center" }}>
        <PlayerBar color="b" name={aiLevel ? aiLevel.name : "Opponent"} rating={aiLevel && aiLevel.elo ? aiLevel.elo : 0} />
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
        <MoveRating />
      </div>

      <div style={{ ...cell, gridArea: "mc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
        {(result || sacrifice.active) && (
          <div style={{ minHeight: "20px", textAlign: "center" }}>
            {sacrifice.active ? (
              <span style={{ color: "#c0414f", fontWeight: "bold", fontSize: "13px" }}>
                {cardMessage}{" "}
                <button onClick={cancelSacrifice} style={{ padding: "3px 8px", cursor: "pointer", color: "var(--ash)", background: "var(--panel-2)", border: "1px solid #5a2030", borderRadius: "5px", fontSize: "12px" }}>
                  Cancel
                </button>
              </span>
            ) : (
              <span style={{ color: "#c0414f", fontWeight: "bold", fontSize: "16px", fontFamily: '"Cinzel", serif' }}>
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
        <SilenceStatus />
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

      <GameOverModal />
    </div>
  );
}
