console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY (FINAL)
// =====================================================
//
// ✔ Two spatial domains (INVISIBLE):
//     1) Reserve pool (empty / loading vesicles)
//     2) Loaded vesicle zone (pre-fusion staging)
// ✔ Smooth Brownian drift
// ✔ Gentle vesicle–vesicle collisions
// ✔ Smooth transport into loaded zone (NO POPPING)
// ✔ Release + recycling states fully exempt
//
// 🔒 BOTH ZONES ARE HARD-CODED (PHYSICS SPACE)
// 👻 NO DEBUG RENDERING
// =====================================================


// -----------------------------------------------------
// MOTION PARAMETERS (CALM + BIOLOGICAL)
// -----------------------------------------------------
const V_THERMAL_X = 0.012;
const V_THERMAL_Y = 0.004;

const V_DRAG_X    = 0.985;
const V_DRAG_Y    = 0.950;

const V_REBOUND_X = 0.20;
const V_REBOUND_Y = 0.12;

const V_MIN_SEP   = 2.1;


// =====================================================
// 🔒 RESERVE POOL — DEEP CYTOSOL (AUTHORITATIVE)
// =====================================================
let _vesicleReserveRect = null;

function getVesicleReserveRect() {

  if (_vesicleReserveRect) return _vesicleReserveRect;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R     = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;

  const WIDTH       = 75;
  const HEIGHT      = R * 0.8;
  const BACK_OFFSET = 60;

  const xMin = stopX + BACK_OFFSET;
  const xMax = xMin + WIDTH;

  _vesicleReserveRect = {
    xMin,
    xMax,
    yMin: cy - HEIGHT,
    yMax: cy + HEIGHT
  };

  return _vesicleReserveRect;
}


// =====================================================
// 🔒 LOADED VESICLE ZONE — PRE-FUSION STAGING
// =====================================================
let _loadedVesicleRect = null;

function getLoadedVesicleRect() {

  if (_loadedVesicleRect) return _loadedVesicleRect;

  const reserve = getVesicleReserveRect();

  const WIDTH_SCALE  = 0.75;
  const HEIGHT_SCALE = 0.85;

  const width  = (reserve.xMax - reserve.xMin) * WIDTH_SCALE;
  const height = (reserve.yMax - reserve.yMin) * HEIGHT_SCALE;

  const xMax = reserve.xMin;
  const xMin = xMax - width;

  const yMid = (reserve.yMin + reserve.yMax) * 0.5;

  _loadedVesicleRect = {
    xMin,
    xMax,
    yMin: yMid - height * 0.5,
    yMax: yMid + height * 0.5
  };

  return _loadedVesicleRect;
}


// -----------------------------------------------------
// POOL EXEMPTION GUARD
// -----------------------------------------------------
function isPoolExempt(v) {
  return (
    v.releaseBias === true ||
    v.recycleBias === true ||
    v.state === "DOCKING" ||
    v.state === "FUSION_ZIPPER" ||
    v.state === "FUSION_PORE" ||
    v.state === "FUSION_OPEN" ||
    v.state === "MEMBRANE_MERGE"
  );
}


// =====================================================
// MAIN UPDATE
// =====================================================
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!vesicles || vesicles.length === 0) return;

  applyBrownianMotion(vesicles);
  resolveVesicleCollisions(vesicles);
  enforceVesicleDomains(vesicles);
  resolveRecycleCompletion(vesicles);
}


// -----------------------------------------------------
// SMOOTH BROWNIAN MOTION
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  for (const v of vesicles) {

    if (isPoolExempt(v)) continue;
    if (v.state === "loaded_travel") continue;

    if (!Number.isFinite(v.vx)) v.vx = random(-0.008, 0.008);
    if (!Number.isFinite(v.vy)) v.vy = random(-0.004, 0.004);

    v.vx += random(-V_THERMAL_X, V_THERMAL_X);
    v.vy += random(-V_THERMAL_Y, V_THERMAL_Y);

    v.x += v.vx;
    v.y += v.vy;

    v.vx *= V_DRAG_X;
    v.vy *= V_DRAG_Y;
  }
}


// -----------------------------------------------------
// LOADED ZONE ATTRACTION (KEY ADDITION)
// -----------------------------------------------------
function applyLoadedZoneAttraction(v) {

  const r = getLoadedVesicleRect();

  const tx = (r.xMin + r.xMax) * 0.5;
  const ty = (r.yMin + r.yMax) * 0.5;

  const dx = tx - v.x;
  const dy = ty - v.y;

  v.vx += dx * 0.015;
  v.vy += dy * 0.015;

  v.vx *= 0.92;
  v.vy *= 0.92;

  v.x += v.vx;
  v.y += v.vy;

  // Lock once fully inside
  if (
    v.x >= r.xMin &&
    v.x <= r.xMax &&
    v.y >= r.yMin &&
    v.y <= r.yMax
  ) {
    v.state = "loaded";
    v.vx *= 0.3;
    v.vy *= 0.3;
  }
}


// -----------------------------------------------------
// VESICLE–VESICLE COLLISIONS
// -----------------------------------------------------
function resolveVesicleCollisions(vesicles) {

  const r = window.SYNAPSE_VESICLE_RADIUS;
  const minD = r * 2 * V_MIN_SEP;

  for (let i = 0; i < vesicles.length; i++) {
    for (let j = i + 1; j < vesicles.length; j++) {

      const a = vesicles[i];
      const b = vesicles[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = Math.hypot(dx, dy);

      if (d > 0 && d < minD) {

        const nx = dx / d;
        const ny = dy / d;
        const overlap = (minD - d) * 0.5;

        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        a.vx -= nx * 0.08;
        a.vy -= ny * 0.05;
        b.vx += nx * 0.08;
        b.vy += ny * 0.05;
      }
    }
  }
}


// =====================================================
// DOMAIN ENFORCEMENT
// =====================================================
function enforceVesicleDomains(vesicles) {

  const reserve = getVesicleReserveRect();
  const loaded  = getLoadedVesicleRect();

  for (const v of vesicles) {

    if (isPoolExempt(v)) continue;

    if (v.state === "loaded_travel") {
      applyLoadedZoneAttraction(v);
    }
    else if (v.state === "loaded") {
      clampToRect(v, loaded);
    }
    else {
      clampToRect(v, reserve);
    }
  }
}


// -----------------------------------------------------
// RECT CLAMP HELPER
// -----------------------------------------------------
function clampToRect(v, r) {

  if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) return;

  if (v.x < r.xMin) {
    v.x = r.xMin;
    v.vx = Math.abs(v.vx) * V_REBOUND_X;
  }
  else if (v.x > r.xMax) {
    v.x = r.xMax;
    v.vx = -Math.abs(v.vx) * V_REBOUND_X;
  }

  if (v.y < r.yMin) {
    v.y = r.yMin;
    v.vy *= -V_REBOUND_Y;
  }
  else if (v.y > r.yMax) {
    v.y = r.yMax;
    v.vy *= -V_REBOUND_Y;
  }
}


// =====================================================
// RECYCLE COMPLETION — RETURN TO RESERVE POOL
// =====================================================
function resolveRecycleCompletion(vesicles) {

  const r = getVesicleReserveRect();

  for (const v of vesicles) {

    if (v.recycleBias !== true) continue;

    if (
      v.x >= r.xMin &&
      v.x <= r.xMax &&
      v.y >= r.yMin &&
      v.y <= r.yMax
    ) {
      v.recycleBias = false;
      v.state = "empty";
      v.vx *= 0.4;
      v.vy *= 0.4;
    }
  }
}


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;


// =====================================================
// SAFE SPAWN API — RESERVE POOL ONLY
// =====================================================
window.requestNewEmptyVesicle = function () {

  if (!Array.isArray(window.synapseVesicles)) return;
  if (window.synapseVesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const r = getVesicleReserveRect();

  window.synapseVesicles.push({
    x: random(r.xMin, r.xMax),
    y: random(r.yMin, r.yMax),

    vx: random(-0.01, 0.01),
    vy: random(-0.004, 0.004),

    state: "empty",
    primedH: false,
    primedATP: false,
    nts: [],

    releaseBias: false,
    recycleBias: false
  });
};
