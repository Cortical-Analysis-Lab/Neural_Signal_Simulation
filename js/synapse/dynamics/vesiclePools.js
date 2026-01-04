console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (NOT MOTION)
// =====================================================
//
// Responsibilities:
// ✔ Reserve pool bounds
// ✔ Loaded pool bounds
// ✔ Pool confinement
// ✔ EMPTY / LOADED_TRAVEL → LOADED handoff
//
// Must NOT:
// ✘ Apply Brownian motion
// ✘ Integrate velocity
// ✘ Reference membrane or fusion planes
// ✘ Touch release logic directly
//
// =====================================================


// -----------------------------------------------------
// POOL RECTANGLES (PRESYNAPTIC LOCAL SPACE)
// -----------------------------------------------------

const RESERVE_POOL = {
  xMin: -120,
  xMax: -40,
  yMin: -36,
  yMax:  36
};

const LOADED_POOL = {
  xMin: -40,
  xMax: window.SYNAPSE_VESICLE_STOP_X, // ← ONLY PLANE ALLOWED
  yMin: -26,
  yMax:  26
};


// -----------------------------------------------------
// Utility
// -----------------------------------------------------
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


// -----------------------------------------------------
// APPLY POOL CONFINEMENT (POSITION ONLY)
// -----------------------------------------------------
function applyPoolConstraints(v) {

  // Pool ignores vesicles owned by release
  if (v.releaseBias === true) return;

  const pool =
    v.state === "LOADED"
      ? LOADED_POOL
      : RESERVE_POOL;

  const oldX = v.x;
  const oldY = v.y;

  v.x = clamp(v.x, pool.xMin + v.radius, pool.xMax - v.radius);
  v.y = clamp(v.y, pool.yMin + v.radius, pool.yMax - v.radius);

  // Kill momentum ONLY if boundary was violated
  if (v.x !== oldX) v.vx *= 0.3;
  if (v.y !== oldY) v.vy *= 0.3;
}


// -----------------------------------------------------
// POOL STATE TRANSITIONS (NO MOTION)
// -----------------------------------------------------
function updatePoolState(v) {

  // -----------------------------------------------
  // EMPTY → RESERVE (implicit, visual only)
  // -----------------------------------------------
  if (v.state === "EMPTY") {
    v.state = "RESERVE";
  }

  // -----------------------------------------------
  // LOADED_TRAVEL → LOADED
  // (chemistry finished, pool owns docking)
  // -----------------------------------------------
  if (
    v.state === "LOADED_TRAVEL" &&
    v.releaseBias !== true
  ) {
    v.state = "LOADED";
  }
}


// -----------------------------------------------------
// MAIN UPDATE — POOL AUTHORITY ONLY
// -----------------------------------------------------
function updateVesiclePools() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  for (const v of vesicles) {

    // Pool owns only pool-owned vesicles
    if (v.owner && v.owner !== "POOL") continue;

    applyPoolConstraints(v);
    updatePoolState(v);
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT (GLOBAL HOOK)
// -----------------------------------------------------
window.updateVesiclePools = updateVesiclePools;
