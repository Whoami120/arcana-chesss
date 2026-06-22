const NUMERALS = { origin: "XXI", fool: "0", sacrifice: "XIII" };

function Emblem({ id, size = 42 }) {
  if (id === "origin") {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="13" fill="none" stroke="#9b6ff0" strokeWidth="1" />
        <circle cx="17" cy="17" r="9" fill="none" stroke="#5a3aa0" strokeWidth="0.8" />
        <circle cx="17" cy="13" r="2.5" fill="#e0d8ec" />
        <path d="M14.5 16 L19.5 16 L21 23 L13 23 Z" fill="#e0d8ec" />
        <rect x="12.5" y="23" width="9" height="2.5" rx="1" fill="#e0d8ec" />
      </svg>
    );
  }
  if (id === "fool") {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34">
        <circle cx="17" cy="14" r="10" fill="#d8d0e6" stroke="#8a7fa6" strokeWidth="0.5" />
        <rect x="11" y="22" width="12" height="7" rx="2" fill="#d8d0e6" />
        <circle cx="13" cy="14" r="3" fill="#1a1226" />
        <circle cx="21" cy="14" r="3" fill="#1a1226" />
        <circle cx="13" cy="14" r="1.2" fill="#9b6ff0" />
        <circle cx="21" cy="14" r="1.2" fill="#9b6ff0" />
        <path d="M17 16 L15 21 L19 21 Z" fill="#1a1226" />
      </svg>
    );
  }
  if (id === "sacrifice") {
    return (
      <svg width={size} height={size} viewBox="0 0 34 34">
        <polygon points="17,30 20,10 14,10" fill="#d8d0e6" stroke="#8a7fa6" strokeWidth="0.5" />
        <rect x="9" y="7" width="16" height="3.5" rx="1" fill="#7a4fd0" />
        <rect x="15" y="3" width="4" height="5" fill="#3a2566" />
        <circle cx="17" cy="2.5" r="2.5" fill="#7a4fd0" />
        <ellipse cx="15.5" cy="24" rx="1.4" ry="2" fill="#9b6ff0" />
      </svg>
    );
  }
  return null;
}

function BackSigil({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="13" fill="none" stroke="#5a3aa0" strokeWidth="0.8" />
      <circle cx="17" cy="17" r="9" fill="none" stroke="#3a2566" strokeWidth="0.6" />
      <polygon points="17,9 22,17 17,25 12,17" fill="none" stroke="#9b6ff0" strokeWidth="0.8" />
      <circle cx="17" cy="17" r="2" fill="#9b6ff0" />
    </svg>
  );
}

export default function Card({ def, used, disabled, faceDown, onClick, compact, selected }) {
  if (compact) {
    return (
      <div style={{ width: 46, height: 66, borderRadius: "7px", background: "#0e0a18", border: "1.5px solid var(--purple-deep)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px var(--purple-deep)" }}>
        <BackSigil size={22} />
      </div>
    );
  }

  if (faceDown) {
    return (
      <div style={{ width: 100, height: 150, borderRadius: "8px", background: "#0e0a18", border: "1.5px solid var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 1px var(--purple-deep)" }}>
        <BackSigil size={48} />
      </div>
    );
  }

  const className = "arcana-card" + (!disabled && !used ? " playable" : "") + (selected ? " selected" : "");

  return (
    <div
      onClick={disabled ? undefined : onClick}
      title={def.description}
      className={className}
      style={{
        width: 100,
        height: 150,
        borderRadius: "8px",
        overflow: "hidden",
        background: "var(--panel-2)",
        border: `1.5px solid ${used ? "var(--border)" : selected ? "var(--purple-bright)" : "var(--gold)"}`,
        opacity: used ? 0.45 : 1,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "8px 7px",
        gap: "4px",
      }}
    >
      <div style={{ fontFamily: '"Cinzel", serif', fontSize: "10px", color: "var(--gold-bright)", letterSpacing: "1px" }}>
        {NUMERALS[def.id]}
      </div>
      <Emblem id={def.id} size={42} />
      <div style={{ fontFamily: '"Cinzel", serif', fontSize: "12px", color: used ? "var(--muted)" : "var(--gold-bright)", textDecoration: used ? "line-through" : "none", letterSpacing: "0.5px" }}>
        {def.name}
      </div>
      <div style={{ fontSize: "8px", color: "var(--muted)", textAlign: "center", lineHeight: 1.25 }}>
        {def.description}
      </div>
    </div>
  );
}