console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (AUTHORITATIVE)
// =====================================================
//
// ✔ Reserve pool (deep cytosol)
// ✔ Loaded pool (membrane-adjacent, NOT docked)
// ✔ Explicit biological gap before docking plane
// ✔ Smooth reserve → loaded travel
// ✔ HARD confinement for LOADED vesicles
//
// ✘ No motion noise
// ✘ No collisions
// ✘ No fusion logic
//
// =====================================================


// -----------------------------------------------------
// 🔧 TUNING KNOBS — ADJUST THESE FIRST
// -----------------------------------------------------

// Distance between LOADED pool and docking / fusion plane
const MEMBRANE_GAP_FACTOR = -5; // × vesicle radius

// Loaded pool geometry
const LOADED_POOL_WIDTH_FACTOR  = 3.0;  // × vesicle radius
const LOADED_POOL_HEIGHT_FACTOR = 2;  // × terminal radius

// Reserve pool geometry
const RESERVE_POOL_WIDTH  = 75;
const RESERVE_POOL_HEIGHT_FACTOR = 0.9;


// -----------------------------------------------------
// INTERNAL CACHE (SAFE, SEPARATE)
// -----------------------------------------------------
let _reserveCacheKey = null;
let _loadedCacheKey  = null;
let _reservePool = null;
let _loadedPool  = null;

function getReserveCacheKey() {
  return [
    window.SYNAPSE_VESICLE_STOP_X,
    window.SYNAPSE_BACK_OFFSET_X,
    window.SYNAPSE_TERMINAL_RADIUS
  ].join("|");
}

function getLoadedCacheKey() {
  return [
    window.SYNAPSE_VESICLE_STOP_X,
    window.SYNAPSE_VESICLE_RADIUS,
    window.SYNAPSE_TERMINAL_RADIUS
  ].join("|");
}


// -----------------------------------------------------
// RESERVE POOL — DEEP CYTOSOL
// -----------------------------------------------------
function getReservePoolRect() {

  const key = getReserveCacheKey();
  if (_reservePool && _reserveCacheKey === key) return _reservePool;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R     = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;
  const back  = window.SYNAPSE_BACK_OFFSET_X;

  const HEIGHT = R * RESERVE_POOL_HEIGHT_FACTOR;

  const xMin = stopX + back;
  const xMax = xMin + RESERVE_POOL_WIDTH;

  _reserveCacheKey = key;
  _reservePool = {
    xMin,
    xMax,
    yMin: cy - HEIGHT,
    yMax: cy + HEIGHT
  };

  return _reservePool;
}


// -----------------------------------------------------
// LOADED POOL — PRE-FUSION STAGING (BIOLOGICALLY CORRECT)
// -----------------------------------------------------
function getLoadedPoolRect() {

  const key = getLoadedCacheKey();
  if (_loadedPool && _loadedCacheKey === key) return _loadedPool;

  const cy     = window.SYNAPSE_TERMINAL_CENTER_Y;
  const stopX  = window.SYNAPSE_VESICLE_STOP_X;
  const rVes   = window.SYNAPSE_VESICLE_RADIUS;
  const rTerm  = window.SYNAPSE_TERMINAL_RADIUS;

  // 🔑 Biological separation from docking plane
  const MEMBRANE_GAP = rVes * MEMBRANE_GAP_FACTOR;

  const WIDTH  = rVes * LOADED_POOL_WIDTH_FACTOR;
  const HEIGHT = rTerm * LOADED_POOL_HEIGHT_FACTOR;

  const xMax = stopX - MEMBRANE_GAP;  // ❗ NOT the docking plane
  const xMin = xMax - WIDTH;

  _loadedCacheKey = key;
  _loadedPool = {
    xMin,
    xMax,
    yMin: cy - HEIGHT * 0.5,
    yMax: cy + HEIGHT * 0.5
  };

  return _loadedPool;
}


// -----------------------------------------------------
// 🔑 AUTHORITATIVE VESICLE CREATION (RESERVE ONLY)
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;
  if (vesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const pool = getReservePoolRect();
  const r    = window.SYNAPSE_VESICLE_RADIUS;

  vesicles.push({
    x: random(pool.xMin + r, pool.xMax - r),
    y: random(pool.yMin + r, pool.yMax - r),

    vx: random(-0.01, 0.01),
    vy: random(-0.01, 0.01),

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
// LOADED ZONE ATTRACTION (RESERVE → STAGING)
// -----------------------------------------------------
function applyLoadedAttraction(v) {

  const r  = getLoadedPoolRect();
  const Rv = v.radius;

  const tx = (r.xMin + r.xMax) * 0.5;
  const ty = (r.yMin + r.yMax) * 0.5;

  v.vx += (tx - v.x) * 0.004;
  v.vy += (ty - v.y) * 0.004;

  v.vx *= 0.78;
  v.vy *= 0.78;

  v.x += v.vx;
  v.y += v.vy;

  // Promote only when fully inside
  if (
    v.x - Rv >= r.xMin &&
    v.x + Rv <= r.xMax &&
    v.y - Rv >= r.yMin &&
    v.y + Rv <= r.yMax
  ) {
    v.state = "LOADED";
    v.vx = 0;
    v.vy = 0;
  }
}


// -----------------------------------------------------
// RECT CONFINEMENT (HARD FOR LOADED)
// -----------------------------------------------------
function confineToRect(v, r) {

  const Rv = v.radius;

  if (v.x - Rv < r.xMin) v.x = r.xMin + Rv;
  if (v.x + Rv > r.xMax) v.x = r.xMax - Rv;

  if (v.y - Rv < r.yMin) v.y = r.yMin + Rv;
  if (v.y + Rv > r.yMax) v.y = r.yMax - Rv;

  // Kill residual motion
  v.vx = 0;
  v.vy = 0;
}


// -----------------------------------------------------
// MAIN POOL UPDATE (AUTHORITATIVE)
// -----------------------------------------------------
function updateVesiclePools() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const reserve = getReservePoolRect();
  const loaded  = getLoadedPoolRect();

  for (const v of vesicles) {

    // Pool blind during release
    if (v.releaseBias === true) continue;

    if (v.state === "LOADED_TRAVEL") {
      applyLoadedAttraction(v);
    }
    else if (v.state === "LOADED") {
      confineToRect(v, loaded);
    }
    else {
      confineToRect(v, reserve);
    }
  }
}

window.updateVesiclePools = updateVesiclePools;


// =====================================================
// DEBUG VISUALIZATION — POOL ZONES (READ-ONLY)
// =====================================================
window.SHOW_VESICLE_POOL_DEBUG = false;

window.drawVesiclePoolDebug = function () {

  if (!window.SHOW_VESICLE_POOL_DEBUG) return;

  const reserve = getReservePoolRect();
  const loaded  = getLoadedPoolRect();

  push();
  noFill();
  strokeWeight(2);

  // 🔵 LOADED POOL
  stroke(80, 160, 255, 200);
  rect(
    loaded.xMin,
    loaded.yMin,
    loaded.xMax - loaded.xMin,
    loaded.yMax - loaded.yMin
  );

  // 🟧 RESERVE POOL
  stroke(255, 160, 80, 200);
  rect(
    reserve.xMin,
    reserve.yMin,
    reserve.xMax - reserve.xMin,
    reserve.yMax - reserve.yMin
  );

  // 🔴 DOCK / FUSION PLANE (REFERENCE)
  stroke(255, 80, 80, 180);
  line(
    window.SYNAPSE_VESICLE_STOP_X,
    -400,
    window.SYNAPSE_VESICLE_STOP_X,
    400
  );

  pop();
};
