export default function TopBar() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <span style={{ color: "var(--purple-bright)", fontSize: "16px" }}>✦</span>
        <span style={{ fontFamily: '"Cinzel", serif', fontWeight: 700, fontSize: "26px", letterSpacing: "6px", color: "var(--gold-bright)" }}>
          ARCANA CHESS
        </span>
        <span style={{ color: "var(--purple-bright)", fontSize: "16px" }}>✦</span>
      </div>
      <div style={{ width: "190px", height: "1px", margin: "6px auto 0", background: "var(--gold)", opacity: 0.5 }} />
    </div>
  );
}