import origin from "./origin";
import fool from "./fool";
import sacrifice from "./sacrifice";

// The full list of cards in the game.
export const CARD_LIST = [origin, fool, sacrifice];

// Look up one card's info by its id.
export function getCard(id) {
  return CARD_LIST.find((c) => c.id === id);
}