const NUMERALS = { origin: "XXI", fool: "0", sacrifice: "XIII" };

function Emblem({ id }) {
  if (id === "origin") {
    return (
      <svg width="26" height="26" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="13" fill="none" stroke="#b01e22" strokeWidth="1" />
        <circle cx="17" cy="17" r="9" fill="none" stroke="#6e1014" strokeWidth="0.8" />
        <circle cx="17" cy="13" r="2.5" fill="#e0cac6" />
        <path d="M14.5 16 L19.5 16 L21 23 L13 23 Z" fill="#e0cac6" />
        <rect x="12.5" y="23" width="9" height="2.5" rx="1" fill="#e0cac6" />
      </svg>
    );
  }
  if (id === "fool") {
    return (
      <svg width="26" height="26" viewBox="0 0 34 34">
        <circle cx="17" cy="14" r="10" fill="#d8c4c0" stroke="#8a6a6a" strokeWidth="0.5" />
        <rect x="11" y="22" width="12" height="7" rx="2" fill="#d8c4c0" />
        <circle cx="13" cy="14" r="3" fill="#2a0e10" />
        <circle cx="21" cy="14" r="3" fill="#2a0e10" />
        <circle cx="13" cy="14" r="1.2" fill="#c0282d" />
        <circle cx="21" cy="14" r="1.2" fill="#c0282d" />
        <path d="M17 16 L15 21 L19 21 Z" fill="#2a0e10" />
      </svg>
    );
  }
  if (id === "sacrifice") {
    return (
      <svg width="26" height="26" viewBox="0 0 34 34">
        <polygon points="17,30 20,10 14,10" fill="#d8c4c0" stroke="#8a6a6a" strokeWidth="0.5" />
        <rect x="9" y="7" width="16" height="3.5" rx="1" fill="#8b2024" />
        <rect x="15" y="3" width="4" height="5" fill="#5a2a2a" />
        <circle cx="17" cy="2.5" r="2.5" fill="#8b2024" />
        <ellipse cx="15.5" cy="24" rx="1.4" ry="2" fill="#c0282d" />
      </svg>
    );
  }
  return null;
}

function BackSigil() {
  return (
    <svg width="24" height="24" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="13" fill="none" stroke="#8b2024" strokeWidth="0.8" />
      <circle cx="17" cy="17" r="9" fill="none" stroke="#6e1014" strokeWidth="0.6" />
      <polygon points="17,9 22,17 17,25 12,17" fill="none" stroke="#c0282d" strokeWidth="0.8" />
      <circle cx="17" cy="17" r="2" fill="#c0282d" />
    </svg>
  );
}

export default function Card({ def, used, disabled, faceDown, onClick }) {
  const size = { width: "52px", height: "76px" };

  if (faceDown) {
    return (
      <div
        style={{
          ...size,
          borderRadius: "6px",
          background: "#160a0c",
          border: "1px solid #6e1418",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: used ? 0.4 : 1,
        }}
      >
        <BackSigil />
      </div>
    );
  }

  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={def.description}
      style={{
        ...size,
        borderRadius: "6px",
        background: "var(--panel-2)",
        border: `1px solid ${used ? "var(--border)" : "var(--crimson-deep)"}`,
        cursor: disabled ? "default" : "pointer",
        opacity: used ? 0.4 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 3px",
        boxShadow: !disabled && !used ? "0 0 8px rgba(176,30,34,0.3)" : "none",
      }}
    >
      <div style={{ color: "#b01e22", fontFamily: '"Cinzel", serif', fontSize: "8px", letterSpacing: "1px" }}>
        {NUMERALS[def.id] || ""}
      </div>
      <Emblem id={def.id} />
      <div
        style={{
          color: used ? "var(--muted)" : "var(--ash)",
          fontFamily: '"Cinzel", serif',
          fontSize: "9px",
          textAlign: "center",
          lineHeight: 1,
          textDecoration: used ? "line-through" : "none",
        }}
      >
        {def.name}
      </div>
    </div>
  );
}