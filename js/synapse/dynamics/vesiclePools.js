console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (NOT MOTION)
// =====================================================
//
// ✔ Reserve pool bounds (deep cytosol)
// ✔ Loaded pool bounds (pre-fusion staging)
// ✔ Vesicle spawning
// ✔ Pool confinement
// ✔ Loaded_travel → loaded transition
//
// ✘ No Brownian motion
// ✘ No collisions
// ✘ No fusion logic
//
// =====================================================


// -----------------------------------------------------
// DERIVED POOL GEOMETRY (AUTHORITATIVE)
// -----------------------------------------------------

let _reservePool = null;
let _loadedPool  = null;


// -----------------------------------------------------
// RESERVE POOL — DEEP CYTOSOL
// -----------------------------------------------------
function getReservePoolRect() {

  if (_reservePool) return _reservePool;

  const cy     = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R      = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX  = window.SYNAPSE_VESICLE_STOP_X;
  const back   = window.SYNAPSE_BACK_OFFSET_X;

  const WIDTH  = 75;
  const HEIGHT = R * 0.8;

  const xMin = stopX + back;
  const xMax = xMin + WIDTH;

  _reservePool = {
    xMin,
    xMax,
    yMin: cy - HEIGHT,
    yMax: cy + HEIGHT
  };

  return _reservePool;
}


// -----------------------------------------------------
// LOADED POOL — PRE-FUSION STAGING ZONE
// -----------------------------------------------------
function getLoadedPoolRect() {

  if (_loadedPool) return _loadedPool;

  const reserve = getReservePoolRect();

  const WIDTH_SCALE  = 0.75;
  const HEIGHT_SCALE = 0.85;

  const width  = (reserve.xMax - reserve.xMin) * WIDTH_SCALE;
  const height = (reserve.yMax - reserve.yMin) * HEIGHT_SCALE;

  const xMax = reserve.xMin;
  const xMin = xMax - width;

  const yMid = (reserve.yMin + reserve.yMax) * 0.5;

  _loadedPool = {
    xMin,
    xMax,
    yMin: yMid - height * 0.5,
    yMax: yMid + height * 0.5
  };

  return _loadedPool;
}


// -----------------------------------------------------
// UTIL
// -----------------------------------------------------
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


// -----------------------------------------------------
// 🔑 AUTHORITATIVE VESICLE CREATION (RESERVE ONLY)
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;
  if (vesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const r = window.SYNAPSE_VESICLE_RADIUS;
  const pool = getReservePoolRect();

  vesicles.push({
    x: random(pool.xMin + r, pool.xMax - r),
    y: random(pool.yMin + r, pool.yMax - r),

    vx: random(-0.01, 0.01),
    vy: random(-0.004, 0.004),

    radius: r,

    state: "EMPTY",
    primedH: false,
    primedATP: false,
    nts: [],

    releaseBias: false,
    recycleBias: false
  });
};


// -----------------------------------------------------
// LOADED ZONE ATTRACTION (DOMAIN OWNERSHIP)
// -----------------------------------------------------
function applyLoadedAttraction(v) {

  const r = getLoadedPoolRect();
  const Rv = v.radius;

  const tx = (r.xMin + r.xMax) * 0.5;
  const ty = (r.yMin + r.yMax) * 0.5;

  const dx = tx - v.x;
  const dy = ty - v.y;

  v.vx += dx * 0.004;
  v.vy += dy * 0.004;

  v.vx *= 0.77;
  v.vy *= 0.77;

  v.x += v.vx;
  v.y += v.vy;

  // Promote ONLY when fully inside
  if (
    v.x - Rv >= r.xMin &&
    v.x + Rv <= r.xMax &&
    v.y - Rv >= r.yMin &&
    v.y + Rv <= r.yMax
  ) {
    v.state = "LOADED";
    v.vx *= 0.3;
    v.vy *= 0.3;
  }
}


// -----------------------------------------------------
// RECT CONFINEMENT (RADIUS-AWARE)
// -----------------------------------------------------
function confineToRect(v, r) {

  const Rv = v.radius;

  if (v.x - Rv < r.xMin) {
    v.x = r.xMin + Rv;
    v.vx = Math.abs(v.vx) * 0.25;
  }
  else if (v.x + Rv > r.xMax) {
    v.x = r.xMax - Rv;
    v.vx = -Math.abs(v.vx) * 0.25;
  }

  if (v.y - Rv < r.yMin) {
    v.y = r.yMin + Rv;
    v.vy = Math.abs(v.vy) * 0.18;
  }
  else if (v.y + Rv > r.yMax) {
    v.y = r.yMax - Rv;
    v.vy = -Math.abs(v.vy) * 0.18;
  }
}


// -----------------------------------------------------
// MAIN POOL UPDATE
// -----------------------------------------------------
function updateVesiclePools() {

  const vesicles = window.synapseVesicles || [];
  const reserve  = getReservePoolRect();
  const loaded   = getLoadedPoolRect();

  for (const v of vesicles) {

    // Pool is blind during release
    if (v.releaseBias) continue;

    if (v.state === "LOADED_TRAVEL") {
      applyLoadedAttraction(v);
    }
    else if (v.state === "LOADED") {
      // Allow membrane-side contact (no clamp on stop plane)
      confineToRect(v, {
        xMin: loaded.xMin,
        xMax: Infinity,
        yMin: loaded.yMin,
        yMax: loaded.yMax
      });
    }
    else {
      confineToRect(v, reserve);
    }
  }
}


// -----------------------------------------------------
window.updateVesiclePools = updateVesiclePools;
