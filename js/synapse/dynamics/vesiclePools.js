console.log("🧭 vesiclePools loaded");

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (AUTHORITATIVE)
// =====================================================
//
// ✔ Reserve pool (deep cytosol)
// ✔ Loaded pool (membrane-adjacent)
// ✔ Smooth reserve → loaded travel
// ✔ Radius-aware confinement
//
// ✘ No motion noise
// ✘ No collisions
// ✘ No fusion logic
//
// =====================================================


// -----------------------------------------------------
// INTERNAL CACHE (AUTO-INVALIDATING)
// -----------------------------------------------------
let _cacheKey = null;
let _reservePool = null;
let _loadedPool  = null;

function getCacheKey() {
  return [
    window.SYNAPSE_VESICLE_STOP_X,
    window.SYNAPSE_BACK_OFFSET_X,
    window.SYNAPSE_TERMINAL_RADIUS
  ].join("|");
}


// -----------------------------------------------------
// RESERVE POOL — DEEP CYTOSOL
// -----------------------------------------------------
function getReservePoolRect() {

  const key = getCacheKey();
  if (_reservePool && _cacheKey === key) return _reservePool;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R     = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;
  const back  = window.SYNAPSE_BACK_OFFSET_X;

  const WIDTH  = 75;
  const HEIGHT = R * 0.75;

  const xMin = stopX + back;
  const xMax = xMin + WIDTH;

  _cacheKey = key;
  _reservePool = {
    xMin,
    xMax,
    yMin: cy - HEIGHT,
    yMax: cy + HEIGHT
  };

  return _reservePool;
}


// -----------------------------------------------------
// LOADED POOL — PRE-FUSION STAGING (MEMBRANE-LOCKED)
// -----------------------------------------------------
function getLoadedPoolRect() {

  const key = getCacheKey();
  if (_loadedPool && _cacheKey === key) return _loadedPool;

  const reserve = getReservePoolRect();
  const stopX   = window.SYNAPSE_VESICLE_STOP_X;

  const WIDTH  = 48;                    // biological staging depth
  const HEIGHT = (reserve.yMax - reserve.yMin) * 0.55;

  const xMax = stopX;                   // 🔴 HARD ANCHOR
  const xMin = xMax - WIDTH;

  const yMid = (reserve.yMin + reserve.yMax) * 0.5;

  _loadedPool = {
    xMin,
    xMax,
    yMin: yMid - HEIGHT * 0.5,
    yMax: yMid + HEIGHT * 0.5
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
// LOADED ZONE ATTRACTION (SMOOTH, BIOLOGICAL)
// -----------------------------------------------------
function applyLoadedAttraction(v) {

  const r  = getLoadedPoolRect();
  const Rv = v.radius;

  const tx = (r.xMin + r.xMax) * 0.5;
  const ty = (r.yMin + r.yMax) * 0.5;

  const dx = tx - v.x;
  const dy = ty - v.y;

  v.vx += dx * 0.0038;
  v.vy += dy * 0.0038;

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
    v.vx *= 0.25;
    v.vy *= 0.25;
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
  if (!vesicles.length) return;

  const reserve = getReservePoolRect();
  const loaded  = getLoadedPoolRect();

  for (const v of vesicles) {

    // Pool is blind during release
    if (v.releaseBias === true) continue;

    if (v.state === "LOADED_TRAVEL") {
      applyLoadedAttraction(v);
    }
    else if (v.state === "LOADED") {
      confineToRect(v, {
        xMin: loaded.xMin,
        xMax: Infinity,          // 🔥 membrane allowed
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
