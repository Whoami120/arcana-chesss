import { useGameStore } from "../state/gameStore";
import { getCard } from "../cards";
import Card from "./Card";

export default function CardBar({ color }) {
  const cards = useGameStore((s) => s.cards[color]);
  const game = useGameStore((s) => s.game);
  const fen = useGameStore((s) => s.fen);
  const cardsDisabled = useGameStore((s) => s.cardsDisabled);
  const result = useGameStore((s) => s.result);
  const playCard = useGameStore((s) => s.playCard);
  const isFirstTurn = useGameStore((s) => s.isFirstTurn);
  const sacrificeActive = useGameStore((s) => s.sacrifice.active);

  const isMyTurn = game.turn() === color;
  const faceDown = !isMyTurn && !result;
  const canPlay = isMyTurn && !cardsDisabled && !result && !sacrificeActive;

  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {cards.map((card) => {
        const def = getCard(card.id);
        const firstTurnBlocked = def.firstTurnOnly && !isFirstTurn(color);
        const disabled = card.used || !canPlay || firstTurnBlocked;
        return (
          <Card
            key={card.id}
            def={def}
            used={card.used}
            disabled={disabled}
            faceDown={faceDown}
            onClick={() => playCard(color, card.id)}
          />
        );
      })}
    </div>
  );
}