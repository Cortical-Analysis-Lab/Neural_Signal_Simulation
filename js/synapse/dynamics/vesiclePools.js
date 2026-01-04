console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (NOT MOTION)
// =====================================================
//
// ✔ Reserve pool bounds
// ✔ Loaded pool bounds
// ✔ Vesicle spawning
// ✔ Pool confinement
// ✔ Loaded travel → loaded
//
// ✘ No Brownian motion
// ✘ No collision handling
// ✘ No fusion logic
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
  xMax: window.SYNAPSE_VESICLE_STOP_X, // ONLY allowed plane
  yMin: -26,
  yMax:  26
};


// -----------------------------------------------------
// UTIL
// -----------------------------------------------------

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


// -----------------------------------------------------
// 🔑 AUTHORITATIVE VESICLE CREATION
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  const x = random(
    RESERVE_POOL.xMin + r,
    RESERVE_POOL.xMax - r
  );

  const y = random(
    RESERVE_POOL.yMin + r,
    RESERVE_POOL.yMax - r
  );

  window.synapseVesicles.push({
    // ------------------------------
    // POSITION (CRITICAL)
    // ------------------------------
    x,
    y,

    // ------------------------------
    // VELOCITY
    // ------------------------------
    vx: random(-0.05, 0.05),
    vy: random(-0.04, 0.04),

    // ------------------------------
    // GEOMETRY
    // ------------------------------
    radius: r,

    // ------------------------------
    // STATE
    // ------------------------------
    state: "EMPTY",

    primedH: false,
    primedATP: false,
    nts: [],

    // ------------------------------
    // OWNERSHIP FLAGS
    // ------------------------------
    releaseBias: false,
    recycleBias: false
  });
};


// -----------------------------------------------------
// POOL CONFINEMENT
// -----------------------------------------------------
function applyPoolConstraints(v) {

  const pool =
    v.state === "LOADED" ||
    v.state === "LOADED_TRAVEL"
      ? LOADED_POOL
      : RESERVE_POOL;

  const oldX = v.x;
  const oldY = v.y;

  v.x = clamp(v.x, pool.xMin + v.radius, pool.xMax - v.radius);
  v.y = clamp(v.y, pool.yMin + v.radius, pool.yMax - v.radius);

  if (v.x !== oldX) v.vx *= 0.3;
  if (v.y !== oldY) v.vy *= 0.3;
}


// -----------------------------------------------------
// STATE TRANSITIONS
// -----------------------------------------------------
function updatePoolState(v) {
  if (v.state === "LOADED_TRAVEL") {
    v.state = "LOADED";
  }
}


// -----------------------------------------------------
// MAIN POOL UPDATE
// -----------------------------------------------------
function updateVesiclePools() {

  const vesicles = window.synapseVesicles || [];

  for (const v of vesicles) {

    if (v.releaseBias) continue;

    applyPoolConstraints(v);
    updatePoolState(v);
  }
}


// -----------------------------------------------------
window.updateVesiclePools = updateVesiclePools;
