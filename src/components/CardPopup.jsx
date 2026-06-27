import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";

export default function CardPopup() {
  const cardPopup = useGameStore((s) => s.cardPopup);
  const clearCardPopup = useGameStore((s) => s.clearCardPopup);

  useEffect(() => {
    if (!cardPopup) return;
    const t = setTimeout(() => clearCardPopup(), 1800);
    return () => clearTimeout(t);
  }, [cardPopup, clearCardPopup]);

  if (!cardPopup) return null;

  const blocked = cardPopup.blocked;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: "16px 26px",
          borderRadius: "12px",
          border: `2px solid ${blocked ? "#c0414f" : "var(--gold)"}`,
          background: "rgba(10, 8, 16, 0.92)",
          textAlign: "center",
          fontFamily: '"Cinzel", serif',
          boxShadow: "0 0 30px rgba(0,0,0,0.7)",
          animation: "cardPopupFade 1.8s ease-in-out forwards",
        }}
      >
        <div style={{ fontSize: "12px", letterSpacing: "2px", color: blocked ? "#c0414f" : "var(--gold-bright)", textTransform: "uppercase" }}>
          {blocked ? "Silenced" : "Card Played"}
        </div>
        <div style={{ fontSize: "26px", fontWeight: "bold", color: "var(--ash)", marginTop: "4px" }}>
          {cardPopup.name}
        </div>
      </div>
    </div>
  );
}