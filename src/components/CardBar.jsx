import { useGameStore } from "../state/gameStore";
import { getCard } from "../cards";

export default function CardBar({ color, label }) {
  const cards = useGameStore((s) => s.cards[color]);
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const result = useGameStore((s) => s.result);
  const playCard = useGameStore((s) => s.playCard);
  const isFirstTurn = useGameStore((s) => s.isFirstTurn);
  const sacrificeActive = useGameStore((s) => s.sacrifice.active);

  const isMyTurn = game.turn() === color;
  const canPlay = isMyTurn && !cardsDisabled && !result && !sacrificeActive;

  return (
    <div style={{ margin: "10px 0" }}>
      <strong>{label} cards</strong>
      <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
        {cards.map((card) => {
          const def = getCard(card.id);
          const firstTurnBlocked = def.firstTurnOnly && !isFirstTurn(color);
          const disabled = card.used || !canPlay || firstTurnBlocked;

          return (
            <button
              key={card.id}
              onClick={() => playCard(color, card.id)}
              disabled={disabled}
              title={def.description}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #888",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: card.used ? 0.4 : 1,
                background: card.used ? "#eee" : "#fff",
                color: "#222",
                fontWeight: "bold",
              }}
            >
              {def.name}
              {card.used ? " (used)" : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}