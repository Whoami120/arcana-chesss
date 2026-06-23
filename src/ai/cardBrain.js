// Decides whether the AI (Black) should play a card this turn, and which one.
// Returns a card id to play, or null to play none. Pure logic, no store access.
//
// ctx = {
//   myCards: [{id, used}],     Black's hand
//   oppCards: [{id, used}],    White's hand
//   evalForBlack: number|null, centipawns from Black's POV (+ = Black better)
//   moveNumber: number,        how many half-moves played so far
// }
export function chooseAiCard(ctx) {
  const { myCards, oppCards, evalForBlack, moveNumber } = ctx;

  const has = (id) => myCards.some((c) => c.id === id && !c.used);
  const oppHasUnused = oppCards.some((c) => !c.used);

  // FOOL: play when clearly behind — a desperate equalizer.
  if (has("fool") && evalForBlack !== null && evalForBlack <= -150) {
    return "fool";
  }

  // SILENCE: trap White when they still have cards worth blocking,
  // and we're past the opening (no point wasting it move 1).
  if (has("silence") && oppHasUnused && moveNumber >= 6) {
    // don't always do it instantly — a little human hesitation
    if (Math.random() < 0.5) return "silence";
  }

  // ORIGIN: first turn only, and only rarely (usually bad for the AI).
  if (has("origin") && moveNumber <= 1 && Math.random() < 0.1) {
    return "origin";
  }

  // SEER and SACRIFICE: the AI skips these.
  return null;
}