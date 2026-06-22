import { Panel } from "./Ornaments";

export default function CardActivation({ def, canActivate, onActivate, onCancel, classic }) {
  if (!def) {
    return (
      <Panel style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--muted)", fontFamily: '"Cinzel", serif', letterSpacing: "1px", textAlign: "center", lineHeight: 1.7 }}>
          {classic ? "The cards are sealed" : <>Select a card<br />to activate</>}
        </div>
      </Panel>
    );
  }

  return (
    <Panel style={{ justifyContent: "space-between" }}>
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', color: "var(--gold-bright)", fontSize: "15px", letterSpacing: "1px" }}>{def.name}</div>
        <div style={{ color: "var(--ash)", fontSize: "13px", lineHeight: 1.4, marginTop: "10px" }}>{def.description}</div>
      </div>
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button
          onClick={onActivate}
          disabled={!canActivate}
          style={{ flex: 1, padding: "9px", borderRadius: "8px", cursor: canActivate ? "pointer" : "not-allowed", fontFamily: '"Cinzel", serif', letterSpacing: "1px", color: canActivate ? "#0d0a16" : "var(--muted)", background: canActivate ? "var(--gold)" : "var(--panel-2)", border: `1px solid ${canActivate ? "var(--gold)" : "var(--border)"}` }}
        >
          Activate
        </button>
        <button
          onClick={onCancel}
          style={{ padding: "9px 12px", borderRadius: "8px", cursor: "pointer", color: "var(--muted)", background: "var(--panel-2)", border: "1px solid var(--border)" }}
        >
          ✕
        </button>
      </div>
    </Panel>
  );
}