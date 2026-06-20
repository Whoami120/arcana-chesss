import { useGameStore } from "../store/gameStore";

export default function CardBar({ color, label }) {
  const cards = useGameStore((s) => s.cards[color]);
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const timeoutWinner = useGameStore((s) => s.timeoutWinner);
  const playCard = useGameStore((s) => s.playCard);
  const isFirstTurn = useGameStore((s) => s.isFirstTurn);

  const isMyTurn = game.turn() === color;
  const canPlay = isMyTurn && !cardsDisabled && !timeoutWinner;
  const originPlayable = isFirstTurn(color);

  return (
    <div style={{ margin: "10px 0" }}>
      <strong>{label} cards</strong>
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {cards.map((card) => {
          const originBlocked = card.id === "origin" && !originPlayable;
          const disabled = card.used || !canPlay || originBlocked;

          return (
            <button
              key={card.id}
              onClick={() => playCard(color, card.id)}
              disabled={disabled}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #888",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: card.used ? 0.4 : 1,
                background: card.used ? "#eee" : "#fff",
                color: "#222", // <-- makes the card name readable
                fontWeight: "bold",
              }}
            >
              {card.name}
              {card.used ? " (used)" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}