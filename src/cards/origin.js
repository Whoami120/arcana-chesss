export default {
  id: "origin",
  name: "Origin",
  description:
    "Turn the game into classic chess and disable ALL cards forever. First turn only.",
  firstTurnOnly: true,
  interactive: false,
  effect: (api) => {
    api.setClassicMode();
  },
};