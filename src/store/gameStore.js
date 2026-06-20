import { create } from "zustand";
import { Chess } from "chess.js";

const MOVE_TIME = 40;

const initialGame = new Chess();

function makeStartingCards() {
  return [
    { id: "origin", name: "Origin", used: false },
    { id: "fool", name: "Fool", used: false },
    { id: "sacrifice", name: "Sacrifice", used: false },
  ];
}

export const useGameStore = create((set, get) => ({
  game: initialGame,
  fen: initialGame.fen(),
  seconds: MOVE_TIME,
  timeoutWinner: null,

  cards: { w: makeStartingCards(), b: makeStartingCards() },
  cardsDisabled: false,
  classicTheme: false,

  makeMove: (from, to) => {
    const { game, timeoutWinner } = get();
    if (timeoutWinner) return false;
    try {
      game.move({ from, to, promotion: "q" });
      set({ fen: game.fen(), seconds: MOVE_TIME });
      return true;
    } catch (error) {
      return false;
    }
  },

  tick: () => {
    const { seconds, timeoutWinner, game } = get();
    if (timeoutWinner) return;
    if (seconds <= 1) {
      const winner = game.turn() === "w" ? "Black" : "White";
      set({ seconds: 0, timeoutWinner: winner });
    } else {
      set({ seconds: seconds - 1 });
    }
  },

  // Origin window: open ONLY for White's 1st move (0 moves played)
  // or Black's 1st move (exactly 1 move played). After that, closed forever.
  isFirstTurn: (color) => {
    const movesPlayed = get().game.history().length;
    if (color === "w") return movesPlayed === 0;
    if (color === "b") return movesPlayed === 1;
    return false;
  },

  playCard: (color, cardId) => {
    const { game, cards, cardsDisabled, timeoutWinner, isFirstTurn } = get();

    if (timeoutWinner) return;
    if (cardsDisabled) return;
    if (game.turn() !== color) return;

    const playerCards = cards[color];
    const card = playerCards.find((c) => c.id === cardId);
    if (!card || card.used) return;

    if (cardId === "origin") {
      // HARD STOP: if the opening window has passed, Origin does nothing.
      if (!isFirstTurn(color)) return;
      set({ classicTheme: true, cardsDisabled: true });
    }

    // (Fool and Sacrifice effects come next.)

    const updatedCards = playerCards.map((c) =>
      c.id === cardId ? { ...c, used: true } : c
    );
    set({ cards: { ...cards, [color]: updatedCards } });
  },
}));