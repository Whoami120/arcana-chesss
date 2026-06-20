import { create } from "zustand";
import { Chess } from "chess.js";
import { CARD_LIST, getCard } from "../cards";

const MOVE_TIME = 40;
const initialGame = new Chess();

// Build a starting hand from the card registry.
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

export const useGameStore = create((set, get) => ({
  game: initialGame,
  fen: initialGame.fen(),
  seconds: MOVE_TIME,
  result: null,

  cards: { w: makeStartingCards(), b: makeStartingCards() },
  cardsDisabled: false,
  classicTheme: false,

  sacrifice: { active: false, color: null, fromSquare: null, pieceType: null },
  cardMessage: "",

  makeMove: (from, to, promotion = "q") => {
    const { game, result, sacrifice } = get();
    if (result) return false;
    if (sacrifice.active) return false;
    try {
      game.move({ from, to, promotion });
      set({ fen: game.fen(), seconds: MOVE_TIME, result: getResult(game) });
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
    const movesPlayed = get().game.history().length;
    if (color === "w") return movesPlayed === 0;
    if (color === "b") return movesPlayed === 1;
    return false;
  },

  // Generic: look the card up in the registry and run it.
  playCard: (color, cardId) => {
    const { game, cards, cardsDisabled, result, isFirstTurn } = get();
    if (result) return;
    if (cardsDisabled) return;
    if (game.turn() !== color) return;

    const owned = cards[color].find((c) => c.id === cardId);
    if (!owned || owned.used) return;

    const def = getCard(cardId);
    if (!def) return;

    // First-turn-only cards (Origin).
    if (def.firstTurnOnly && !isFirstTurn(color)) return;

    // Interactive cards (Sacrifice) start a board selection instead of firing now.
    if (def.interactive) {
      get().startSacrifice(color);
      return;
    }

    // Instant cards run their effect with this small helper API.
    const api = {
      game,
      color,
      refreshBoard: () => set({ fen: game.fen() }),
      setClassicMode: () => set({ classicTheme: true, cardsDisabled: true }),
    };
    def.effect(api);

    set({ cards: markUsed(cards, color, cardId) });
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
    const { game, cards, sacrifice } = get();
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

    game.remove(sacrifice.fromSquare);
    game.remove(square);

    set({
      fen: game.fen(),
      cards: markUsed(cards, sacrifice.color, "sacrifice"),
      sacrifice: { active: false, color: null, fromSquare: null, pieceType: null },
      cardMessage: "",
    });
  },
}));