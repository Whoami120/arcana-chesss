// elo: target rating. null = full Stockfish. weakness: extra blundering for
// the very low levels (Stockfish can't go below ~1320 on its own).
export const LEVELS = [
  { id: "easy",        name: "Novice",       elo: 300,  movetime: 300,  weakness: 0.7 },
  { id: "medium",      name: "Apprentice",   elo: 800,  movetime: 300,  weakness: 0.45 },
  { id: "hard",        name: "Adept",        elo: 1300, movetime: 400,  weakness: 0.15 },
  { id: "expert",      name: "Expert",       elo: 1600, movetime: 500,  weakness: 0 },
  { id: "master",      name: "Master",       elo: 2200, movetime: 700,  weakness: 0 },
  { id: "grandmaster", name: "Grandmaster",  elo: 2800, movetime: 1000, weakness: 0 },
  { id: "god",         name: "God",          elo: null, movetime: 1500, weakness: 0 },
];