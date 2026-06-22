export default {
  id: "seer",
  name: "Seer",
  description:
    "For your next 4 turns, reveals the strongest move. It only advises — you still choose. Single use.",
  firstTurnOnly: false,
  interactive: false,
  effect: (api) => {
    api.activateSeer();
  },
};