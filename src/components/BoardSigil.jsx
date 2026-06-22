export default function BoardSigil() {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.15 }}>
      <circle cx="50" cy="50" r="38" fill="none" stroke="#9b6ff0" strokeWidth="0.7" />
      <polygon points="50,12 72.3,80.7 13.9,38.3 86.1,38.3 27.7,80.7" fill="none" stroke="#9b6ff0" strokeWidth="0.7" />
    </svg>
  );
}