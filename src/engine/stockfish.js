const ENGINE_URL = "/stockfish-18-lite-single.js";

let worker = null;
let initPromise = null;

function init() {
  if (initPromise) return initPromise;
  initPromise = new Promise((resolve, reject) => {
    let w;
    try {
      w = new Worker(ENGINE_URL);
    } catch (e) {
      reject(e);
      return;
    }
    const onMsg = (e) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (line.includes("uciok")) w.postMessage("isready");
      if (line.includes("readyok")) {
        w.removeEventListener("message", onMsg);
        worker = w;
        resolve(true);
      }
    };
    w.addEventListener("message", onMsg);
    w.addEventListener("error", (err) => reject(err));
    w.postMessage("uci");
  });
  return initPromise;
}

// ---- COMMAND QUEUE ----
// Only ONE engine request runs at a time. Everyone else waits in line, so
// commands can never overlap (which was freezing the engine).
let chain = Promise.resolve();
function runExclusive(task) {
  const next = chain.then(() => task());
  // keep the chain alive even if a task throws
  chain = next.catch(() => {});
  return next;
}

// Send a search and resolve with the raw "bestmove" line's move + the last score.
function searchOnce(fen, { movetime = 500, multipv = 1 } = {}) {
  return new Promise((resolve) => {
    let finished = false;
    const whiteToMove = fen.split(" ")[1] === "w";
    const lines = {};
    let lastScore = null;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      worker.removeEventListener("message", onMsg);
      worker.removeEventListener("error", onErr);
      clearTimeout(timer);
    };
    const onMsg = (e) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (line.startsWith("info") && line.includes(" pv ")) {
        const mpv = line.match(/multipv (\d+)/);
        const cp = line.match(/score cp (-?\d+)/);
        const mate = line.match(/score mate (-?\d+)/);
        const pv = line.match(/ pv (\S+)/);
        let score = null;
        if (mate) score = parseInt(mate[1], 10) > 0 ? 100000 : -100000;
        else if (cp) score = parseInt(cp[1], 10);
        if (score !== null) lastScore = score;
        if (mpv && pv && score !== null) {
          lines[parseInt(mpv[1], 10)] = { score, move: pv[1] };
        } else if (pv && score !== null) {
          lines[1] = { score, move: pv[1] };
        }
      }
      if (line.startsWith("bestmove")) {
        const bm = line.split(/\s+/)[1];
        cleanup();
        const arr = Object.keys(lines)
          .sort((a, b) => a - b)
          .map((k) => ({
            move: lines[k].move,
            score: whiteToMove ? lines[k].score : -lines[k].score,
          }));
        resolve({
          best: bm && bm !== "(none)" ? bm : null,
          score: lastScore === null ? null : whiteToMove ? lastScore : -lastScore,
          lines: arr,
        });
      }
    };
    const onErr = () => {
      cleanup();
      resolve({ best: null, score: null, lines: [] });
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve({ best: null, score: null, lines: [] });
    }, movetime + 3000);

    worker.addEventListener("message", onMsg);
    worker.addEventListener("error", onErr);
    worker.postMessage("setoption name MultiPV value " + multipv);
    worker.postMessage("position fen " + fen);
    worker.postMessage("go movetime " + movetime);
  });
}

// Set the engine's playing strength. elo=null means full strength.
function applyStrength(elo) {
  if (elo === null) {
    worker.postMessage("setoption name UCI_LimitStrength value false");
  } else {
    const clamped = Math.max(1320, elo);
    worker.postMessage("setoption name UCI_LimitStrength value true");
    worker.postMessage("setoption name UCI_Elo value " + clamped);
  }
}

// ---- PUBLIC API (same names as before) ----

export async function getBestMove(fen, { movetime = 500 } = {}) {
  try {
    await init();
  } catch (e) {
    return null;
  }
  return runExclusive(async () => {
    const r = await searchOnce(fen, { movetime, multipv: 1 });
    return r.best;
  });
}

export async function getEvaluation(fen, { movetime = 400 } = {}) {
  try {
    await init();
  } catch (e) {
    return null;
  }
  return runExclusive(async () => {
    const r = await searchOnce(fen, { movetime, multipv: 1 });
    return r.score;
  });
}

export async function getTopMoves(fen, { movetime = 400, multipv = 2 } = {}) {
  try {
    await init();
  } catch (e) {
    return null;
  }
  return runExclusive(async () => {
    const r = await searchOnce(fen, { movetime, multipv });
    return r.lines.length ? r.lines : null;
  });
}

export async function setStrength(elo) {
  try {
    await init();
  } catch (e) {
    return;
  }
  return runExclusive(async () => {
    applyStrength(elo);
  });
}

export async function getMoveAtLevel(fen, { elo, movetime = 500, weakness = 0 }) {
  try {
    await init();
  } catch (e) {
    return null;
  }
  return runExclusive(async () => {
    applyStrength(elo);
    // Sometimes pick a sloppier move on low levels.
    if (weakness > 0 && Math.random() < weakness) {
      const r = await searchOnce(fen, { movetime, multipv: 5 });
      applyStrength(elo); // re-assert after MultiPV
      if (r.lines && r.lines.length > 1) {
        return r.lines[1 + Math.floor(Math.random() * (r.lines.length - 1))].move;
      }
      return r.best;
    }
    const r = await searchOnce(fen, { movetime, multipv: 1 });
    return r.best;
  });
}