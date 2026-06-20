import { Chess } from "chess.js";
import { someKingInCheck } from "../utils/chessRules";

export default {
  id: "fool",
  name: "Fool",
  description: "Remove one random non-king piece from anywhere on the board.",
  firstTurnOnly: false,
  interactive: false,
  effect: (api) => {
    const { game } = api;

    // Every non-king piece on the board.
    const squares = [];
    for (const row of game.board()) {
      for (const cell of row) {
        if (cell && cell.type !== "k") squares.push(cell.square);
      }
    }

    // Keep only pieces whose removal would NOT leave a king in check.
    const safe = squares.filter((sq) => {
      const trial = new Chess(game.fen());
      trial.remove(sq);
      return !someKingInCheck(trial);
    });

    if (safe.length === 0) return; // nothing safe to remove; Fool does nothing

    const target = safe[Math.floor(Math.random() * safe.length)];
    game.remove(target);
    api.refreshBoard();
  },
};