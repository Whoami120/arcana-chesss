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

export async function getBestMove(fen, { movetime = 500 } = {}) {
  try {
    await init();
  } catch (e) {
    return null;
  }
  return new Promise((resolve) => {
    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      worker.removeEventListener("message", onMsg);
      worker.removeEventListener("error", onErr);
      clearTimeout(timer);
    };
    const onMsg = (e) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (line.startsWith("bestmove")) {
        const move = line.split(/\s+/)[1];
        cleanup();
        resolve(move && move !== "(none)" ? move : null);
      }
    };
    const onErr = () => {
      cleanup();
      resolve(null);
    };
    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, movetime + 3000);

    worker.addEventListener("message", onMsg);
    worker.addEventListener("error", onErr);
    worker.postMessage("position fen " + fen);
    worker.postMessage("go movetime " + movetime);
  });
}