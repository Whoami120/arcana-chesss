// Returns true if EITHER king is in check (used by Fool).
export function someKingInCheck(chess) {
  let wk = null;
  let bk = null;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === "k") {
        if (cell.color === "w") wk = cell.square;
        else bk = cell.square;
      }
    }
  }
  const whiteInCheck = wk ? chess.isAttacked(wk, "b") : false;
  const blackInCheck = bk ? chess.isAttacked(bk, "w") : false;
  return whiteInCheck || blackInCheck;
}

// Returns true if the given color's OWN king is in check.
export function kingInCheck(chess, color) {
  let ks = null;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === "k" && cell.color === color) ks = cell.square;
    }
  }
  if (!ks) return false;
  return chess.isAttacked(ks, color === "w" ? "b" : "w");
}