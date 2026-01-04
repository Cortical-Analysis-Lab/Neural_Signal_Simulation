console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (AUTHORITATIVE)
// =====================================================
//
// ✔ Reserve pool (deep cytosol)
// ✔ Loaded pool (membrane-adjacent, NOT docked)
// ✔ Smooth reserve → loaded travel
// ✔ Hard confinement for LOADED vesicles
//
// ✘ No motion noise
// ✘ No collisions
// ✘ No fusion logic
//
// =====================================================


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

  const WIDTH  = 75;
  const HEIGHT = R * 0.75;

  const xMin = stopX + back;
  const xMax = xMin + WIDTH;

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
// LOADED POOL — PRE-FUSION STAGING (CRITICAL)
// -----------------------------------------------------
function getLoadedPoolRect() {

  const key = getLoadedCacheKey();
  if (_loadedPool && _loadedCacheKey === key) return _loadedPool;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;

  // 🔑 Gap between staging zone and docking plane
  const MEMBRANE_GAP = 10;

  const WIDTH  = 48;
  const HEIGHT = window.SYNAPSE_TERMINAL_RADIUS * 0.42;

  const xMax = stopX - MEMBRANE_GAP;
  const xMin = xMax - WIDTH;

  _loadedCacheKey = key;
  _loadedPool = {
    xMin,
    xMax,
    yMin: cy - HEIGHT,
    yMax: cy + HEIGHT
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

    vx: random(-0.015, 0.015),
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
// PLACE VESICLE DIRECTLY INTO LOADED POOL (SEEDING)
// -----------------------------------------------------
function placeVesicleInLoadedPool(v) {

  const r = getLoadedPoolRect();
  const Rv = v.radius;

  v.x = random(r.xMin + Rv, r.xMax - Rv);
  v.y = random(r.yMin + Rv, r.yMax - Rv);

  v.vx = random(-0.002, 0.002);
  v.vy = random(-0.002, 0.002);
}


// -----------------------------------------------------
// LOADED ZONE ATTRACTION (SMOOTH STAGING)
// -----------------------------------------------------
function applyLoadedAttraction(v) {

  const r  = getLoadedPoolRect();
  const Rv = v.radius;

  const tx = (r.xMin + r.xMax) * 0.5;
  const ty = (r.yMin + r.yMax) * 0.5;

  v.vx += (tx - v.x) * 0.0038;
  v.vy += (ty - v.y) * 0.0038;

  v.vx *= 0.78;
  v.vy *= 0.78;

  v.x += v.vx;
  v.y += v.vy;

  if (
    v.x - Rv >= r.xMin &&
    v.x + Rv <= r.xMax &&
    v.y - Rv >= r.yMin &&
    v.y + Rv <= r.yMax
  ) {
    v.state = "LOADED";
    v.vx *= 0.2;
    v.vy *= 0.2;
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

  // Kill residual motion when confined
  v.vx *= 0.2;
  v.vy *= 0.2;
}


// -----------------------------------------------------
// MAIN POOL UPDATE
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
