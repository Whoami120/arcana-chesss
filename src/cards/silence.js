export default {
  id: "silence",
  name: "Silence",
  description:
    "A hidden trap. The opponent's NEXT card is cancelled and wasted. They don't know until it triggers. Single use.",
  firstTurnOnly: false,
  interactive: false,
  effect: (api) => {
    // Arm the trap on the OTHER player.
    const enemy = api.color === "w" ? "b" : "w";
    api.armSilence(enemy);
  },
};