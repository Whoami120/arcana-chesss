export default {
  id: "fool",
  name: "Fool",
  description: "Remove one random non-king piece from anywhere on the board.",
  firstTurnOnly: false,
  interactive: false,
  effect: (api) => {
    const { game } = api;

    // Collect every square that holds a non-king piece.
    const squares = [];
    for (const row of game.board()) {
      for (const cell of row) {
        if (cell && cell.type !== "k") squares.push(cell.square);
      }
    }
    if (squares.length === 0) return;

    const target = squares[Math.floor(Math.random() * squares.length)];
    game.remove(target);
    api.refreshBoard();
  },
};