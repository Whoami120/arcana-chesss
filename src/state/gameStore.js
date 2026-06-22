import { create } from "zustand";
import { Chess } from "chess.js";
import { CARD_LIST, getCard } from "../cards";
import { kingInCheck } from "../utils/chessRules";

const MOVE_TIME = 40;
const initialGame = new Chess();

function makeStartingCards() {
  return CARD_LIST.map((c) => ({ id: c.id, used: false }));
}

function markUsed(cards, color, cardId) {
  const updated = cards[color].map((c) =>
    c.id === cardId ? { ...c, used: true } : c
  );
  return { ...cards, [color]: updated };
}

function getResult(game) {
  if (!game.isGameOver()) return null;
  if (game.isCheckmate()) {
    const winner = game.turn() === "w" ? "Black" : "White";
    return { winner, reason: "checkmate" };
  }
  if (game.isStalemate()) return { winner: null, reason: "stalemate" };
  if (game.isInsufficientMaterial())
    return { winner: null, reason: "insufficient material" };
  if (game.isThreefoldRepetition())
    return { winner: null, reason: "repetition" };
  return { winner: null, reason: "draw" };
}

// chess.js has no "pass", so we flip whose move it is in the FEN.
function flipTurn(game) {
  const parts = game.fen().split(" ");
  parts[1] = parts[1] === "w" ? "b" : "w";
  parts[3] = "-"; // clear en passant
  game.load(parts.join(" "), { skipValidation: true });
}

export const useGameStore = create((set, get) => ({
  game: initialGame,
  fen: initialGame.fen(),
  seconds: MOVE_TIME,
  result: null,
  moveLog: [],

  cards: { w: makeStartingCards(), b: makeStartingCards() },
  cardsDisabled: false,
  classicTheme: false,

  sacrifice: { active: false, color: null, fromSquare: null, pieceType: null },
  cardMessage: "",

  // ---- SEER ----
  // active = card in play, color = who owns it, turnsLeft = visions remaining.
  seer: { active: false, color: null, turnsLeft: 0 },
  seerSuggestion: null, // a UCI move like "e2e4", or "unavailable", or null

  makeMove: (from, to, promotion = "q") => {
    const { game, result, sacrifice, moveLog, seer, seerSuggestion } = get();
    if (result) return false;
    if (sacrifice.active) return false;
    try {
      const mv = game.move({ from, to, promotion });

      // If the Seer's owner just moved, use up one vision.
      let nextSeer = seer;
      let nextSuggestion = seerSuggestion;
      if (seer.active && mv.color === seer.color) {
        const left = seer.turnsLeft - 1;
        if (left <= 0) {
          nextSeer = { active: false, color: null, turnsLeft: 0 };
          nextSuggestion = null;
        } else {
          nextSeer = { ...seer, turnsLeft: left };
          nextSuggestion = null; // clear so the next turn gets a fresh reading
        }
      }

      set({
        fen: game.fen(),
        seconds: MOVE_TIME,
        result: getResult(game),
        moveLog: [...moveLog, mv.san],
        seer: nextSeer,
        seerSuggestion: nextSuggestion,
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  tick: () => {
    const { seconds, result, game } = get();
    if (result) return;
    if (seconds <= 1) {
      const winner = game.turn() === "w" ? "Black" : "White";
      set({ seconds: 0, result: { winner, reason: "timeout" } });
    } else {
      set({ seconds: seconds - 1 });
    }
  },

  isFirstTurn: (color) => {
    const turnsPlayed = get().moveLog.length;
    if (color === "w") return turnsPlayed === 0;
    if (color === "b") return turnsPlayed === 1;
    return false;
  },

  playCard: (color, cardId) => {
    const { game, cards, cardsDisabled, result, isFirstTurn } = get();
    if (result) return;
    if (cardsDisabled) return;
    if (game.turn() !== color) return;

    const owned = cards[color].find((c) => c.id === cardId);
    if (!owned || owned.used) return;

    const def = getCard(cardId);
    if (!def) return;

    if (def.firstTurnOnly && !isFirstTurn(color)) return;

    if (def.interactive) {
      get().startSacrifice(color);
      return;
    }

    const api = {
      game,
      color,
      refreshBoard: () => set({ fen: game.fen() }),
      setClassicMode: () => set({ classicTheme: true, cardsDisabled: true }),
      activateSeer: () => get().activateSeer(color),
    };
    def.effect(api);

    set({ cards: markUsed(cards, color, cardId) });
  },

  // Turn the Seer on for this color, 4 visions, fresh reading.
  activateSeer: (color) => {
    set({
      seer: { active: true, color, turnsLeft: 4 },
      seerSuggestion: null,
    });
  },

  // The Seer panel calls this once Stockfish answers.
  setSeerSuggestion: (move) => {
    if (!get().seer.active) return; // ignore if it already expired
    set({ seerSuggestion: move });
  },

  startSacrifice: (color) => {
    const { game, cards, cardsDisabled, result, sacrifice } = get();
    if (result || cardsDisabled) return;
    if (game.turn() !== color) return;
    if (sacrifice.active) return;

    const card = cards[color].find((c) => c.id === "sacrifice");
    if (!card || card.used) return;

    set({
      sacrifice: { active: true, color, fromSquare: null, pieceType: null },
      cardMessage: "Sacrifice: click ONE OF YOUR pieces (not the king).",
    });
  },

  cancelSacrifice: () => {
    set({
      sacrifice: { active: false, color: null, fromSquare: null, pieceType: null },
      cardMessage: "",
    });
  },

  sacrificeClick: (square) => {
    const { game, cards, sacrifice, moveLog } = get();
    if (!sacrifice.active) return;
    const piece = game.get(square);
    if (!piece) return;

    if (sacrifice.fromSquare === null) {
      if (piece.color !== sacrifice.color) {
        set({ cardMessage: "That's not your piece. Click YOUR piece." });
        return;
      }
      if (piece.type === "k") {
        set({ cardMessage: "You can't sacrifice your king. Pick another." });
        return;
      }
      set({
        sacrifice: { ...sacrifice, fromSquare: square, pieceType: piece.type },
        cardMessage: "Good. Now click an ENEMY piece of the SAME type.",
      });
      return;
    }

    if (square === sacrifice.fromSquare) {
      set({
        sacrifice: { ...sacrifice, fromSquare: null, pieceType: null },
        cardMessage: "Pick one of YOUR pieces (not the king).",
      });
      return;
    }

    const enemyColor = sacrifice.color === "w" ? "b" : "w";
    if (piece.color !== enemyColor) {
      set({ cardMessage: "Pick an ENEMY piece of the same type." });
      return;
    }
    if (piece.type !== sacrifice.pieceType) {
      set({ cardMessage: "Must be the SAME type as your piece." });
      return;
    }

    const trial = new Chess(game.fen());
    trial.remove(sacrifice.fromSquare);
    trial.remove(square);
    if (kingInCheck(trial, sacrifice.color)) {
      set({
        sacrifice: { ...sacrifice, fromSquare: null, pieceType: null },
        cardMessage:
          "That would leave YOUR king in check — not allowed. Pick another piece.",
      });
      return;
    }

    game.remove(sacrifice.fromSquare);
    game.remove(square);
    flipTurn(game);

    set({
      fen: game.fen(),
      seconds: MOVE_TIME,
      result: getResult(game),
      moveLog: [...moveLog, "Sacrifice"],
      cards: markUsed(cards, sacrifice.color, "sacrifice"),
      sacrifice: { active: false, color: null, fromSquare: null, pieceType: null },
      cardMessage: "",
    });
  },
}));