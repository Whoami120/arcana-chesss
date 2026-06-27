// Decides whether the AI (Black) should play a card this turn, and which one.
// Returns a card id to play, or null. Pure logic, no store access.
//
// ctx = {
//   myCards: [{id, used}],     Black's hand
//   oppCards: [{id, used}],    White's hand
//   evalForBlack: number|null, centipawns from Black's POV (+ = Black better)
//   moveNumber: number,        half-moves played so far
// }
export function chooseAiCard(ctx) {
  const { myCards, oppCards, evalForBlack, moveNumber } = ctx;

  const has = (id) => myCards.some((c) => c.id === id && !c.used);
  const oppHasUnused = oppCards.some((c) => !c.used);

  // FOOL: play when not winning comfortably — grab a free enemy piece.
  // (Loosened: fires whenever Black isn't clearly ahead.)
  if (has("fool") && evalForBlack !== null && evalForBlack <= 50) {
    if (moveNumber >= 2 && Math.random() < 0.6) return "fool";
  }

  // SILENCE: trap White whenever they still hold a card worth blocking.
  if (has("silence") && oppHasUnused && moveNumber >= 3) {
    if (Math.random() < 0.6) return "silence";
  }

  // SEER and SACRIFICE: the AI skips these (no benefit / needs targeting).
  // ORIGIN: the AI never plays it — it would seal the whole card game.

  return null;
}