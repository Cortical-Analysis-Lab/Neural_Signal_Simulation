console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (AUTHORITATIVE)
// =====================================================
//
// COORDINATE CONTRACT:
// • Presynaptic LOCAL space
// • +X → toward membrane / vesicle stop plane
// • -X → deeper cytosol
// • NO flips, NO view transforms
//
// RESPONSIBILITIES:
// ✔ Reserve pool (deep cytosol)
// ✔ Loaded pool (membrane-adjacent, NOT docked)
// ✔ Explicit biological gap before docking plane
// ✔ Smooth reserve → loaded travel (X-normal only)
// ✔ HARD confinement for LOADED vesicles
//
// NON-RESPONSIBILITIES:
// ✘ No Brownian motion
// ✘ No vesicle–vesicle collisions
// ✘ No fusion logic
// ✘ No recycling logic
//
// =====================================================


// -----------------------------------------------------
// 🔧 TUNING KNOBS
// -----------------------------------------------------

const MEMBRANE_GAP_FACTOR = -5;

const LOADED_POOL_WIDTH_FACTOR  = 3.0;
const LOADED_POOL_HEIGHT_FACTOR = 2.0;

const RESERVE_POOL_WIDTH = 75;
const RESERVE_POOL_HEIGHT_FACTOR = 0.9;

const LOADED_DAMPING  = 0.35;
const RESERVE_DAMPING = 0.65;


// -----------------------------------------------------
// INTERNAL CACHE
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
    window.SYNAPSE_TERMINAL_RADIUS,
    MEMBRANE_GAP_FACTOR,
    LOADED_POOL_WIDTH_FACTOR,
    LOADED_POOL_HEIGHT_FACTOR
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
// LOADED POOL — PRE-FUSION STAGING
// -----------------------------------------------------
function getLoadedPoolRect() {

  const key = getLoadedCacheKey();
  if (_loadedPool && _loadedCacheKey === key) return _loadedPool;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;
  const rVes  = window.SYNAPSE_VESICLE_RADIUS;
  const rTerm = window.SYNAPSE_TERMINAL_RADIUS;

  const MEMBRANE_GAP = rVes * MEMBRANE_GAP_FACTOR;

  const WIDTH  = rVes * LOADED_POOL_WIDTH_FACTOR;
  const HEIGHT = rTerm * LOADED_POOL_HEIGHT_FACTOR;

  const xMax = stopX - MEMBRANE_GAP;
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
// AUTHORITATIVE EMPTY VESICLE CREATION
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
// RESERVE → LOADED ATTRACTION
// -----------------------------------------------------
function applyLoadedAttraction(v) {

  const r  = getLoadedPoolRect();
  const Rv = v.radius;

  const targetX = r.xMax - Rv;

  v.vx += (targetX - v.x) * 0.006;
  v.vx *= 0.75;
  v.vy *= 0.95;

  v.x += v.vx;
  v.y += v.vy;

  if (
    v.x + Rv >= r.xMax &&
    v.x - Rv >= r.xMin &&
    v.y - Rv >= r.yMin &&
    v.y + Rv <= r.yMax
  ) {
    v.state = "LOADED";
    v.vx = 0;
    v.vy *= 0.6;
  }
}


// -----------------------------------------------------
// HARD RECTANGULAR CONFINEMENT
// -----------------------------------------------------
function confineToRect(v, r, damping) {

  const Rv = v.radius;

  if (v.x - Rv < r.xMin) {
    v.x = r.xMin + Rv;
    v.vx *= -0.3;
  }
  else if (v.x + Rv > r.xMax) {
    v.x = r.xMax - Rv;
    v.vx *= -0.3;
  }

  if (v.y - Rv < r.yMin) {
    v.y = r.yMin + Rv;
    v.vy *= -0.3;
  }
  else if (v.y + Rv > r.yMax) {
    v.y = r.yMax - Rv;
    v.vy *= -0.3;
  }

  v.vx *= damping;
  v.vy *= damping;
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

    // 🔒 Release owns these
    if (v.releaseBias === true) continue;

    // 🔒 Recycling owns these until release clears them
    if (v.state === "RECYCLE_TRAVEL") continue;

    if (v.state === "LOADED_TRAVEL") {
      applyLoadedAttraction(v);
    }
    else if (v.state === "LOADED") {
      confineToRect(v, loaded, LOADED_DAMPING);
    }
    else {
      confineToRect(v, reserve, RESERVE_DAMPING);
    }
  }
}

window.updateVesiclePools = updateVesiclePools;


// =====================================================
// DEBUG VISUALIZATION
// =====================================================
window.SHOW_VESICLE_POOL_DEBUG = false;

window.drawVesiclePoolDebug = function () {

  if (!window.SHOW_VESICLE_POOL_DEBUG) return;

  const reserve = getReservePoolRect();
  const loaded  = getLoadedPoolRect();

  push();
  noFill();
  strokeWeight(2);

  stroke(80, 160, 255, 200);
  rect(
    loaded.xMin,
    loaded.yMin,
    loaded.xMax - loaded.xMin,
    loaded.yMax - loaded.yMin
  );

  stroke(255, 160, 80, 200);
  rect(
    reserve.xMin,
    reserve.yMin,
    reserve.xMax - reserve.xMin,
    reserve.yMax - reserve.yMin
  );

  stroke(255, 80, 80, 180);
  line(
    window.SYNAPSE_VESICLE_STOP_X,
    -400,
    window.SYNAPSE_VESICLE_STOP_X,
    400
  );

  pop();
};
