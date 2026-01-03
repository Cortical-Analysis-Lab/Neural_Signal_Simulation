console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY (DEBUG)
// =====================================================
//
// ✔ Two spatial domains:
//     1) Reserve pool (empty / loading)
//     2) Loaded vesicle zone (pre-fusion)
// ✔ Both domains visible in blue (temporary)
// ✔ ONLY loaded zone is tunable
// ✔ Release states fully exempt
//
// 🔒 Reserve pool is HARD-LOCKED
// 🔧 Loaded zone is TUNABLE
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
// 🔒 RESERVE POOL (DEEP CYTOSOL — HARD LOCKED)
// =====================================================
let _vesicleReserveRect = null;

function getVesicleReserveRect() {

  if (_vesicleReserveRect) return _vesicleReserveRect;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R     = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;

  // 🔒 DO NOT TUNE
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
// 🔵 LOADED VESICLE ZONE (TUNABLE, ADJACENT)
// =====================================================
let _loadedVesicleRect = null;

function getLoadedVesicleRect() {

  if (_loadedVesicleRect) return _loadedVesicleRect;

  const reserve = getVesicleReserveRect();

  // ================================
  // 🔧 TUNABLE PARAMETERS (ONLY HERE)
  // ================================
  const WIDTH_SCALE  = 0.5;   // fraction of reserve width
  const HEIGHT_SCALE = 0.5;   // fraction of reserve height
  const X_GAP        = 0;     // gap between reserve & loaded zone
  const Y_OFFSET     = 0;     // vertical shift

  // ================================

  const width  = (reserve.xMax - reserve.xMin) * WIDTH_SCALE;
  const height = (reserve.yMax - reserve.yMin) * HEIGHT_SCALE;

  const xMax = reserve.xMin - X_GAP;
  const xMin = xMax - width;

  const yMid = (reserve.yMin + reserve.yMax) * 0.5 + Y_OFFSET;

  _loadedVesicleRect = {
    xMin,
    xMax,
    yMin: yMid - height * 0.5,
    yMax: yMid + height * 0.5
  };

  return _loadedVesicleRect;
}


// -----------------------------------------------------
// RELEASE / FUSION EXEMPTION GUARD
// -----------------------------------------------------
function isPoolExempt(v) {
  return (
    v.releaseBias === true ||
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

  enforceLoadedVesicleRect(vesicles);
  enforceReserveRectangle(vesicles);
}


// -----------------------------------------------------
// SMOOTH BROWNIAN MOTION
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  for (const v of vesicles) {

    if (isPoolExempt(v)) continue;

    if (v.vx === undefined) v.vx = random(-0.008, 0.008);
    if (v.vy === undefined) v.vy = random(-0.004, 0.004);

    v.vx += random(-V_THERMAL_X, V_THERMAL_X);
    v.vy += random(-V_THERMAL_Y, V_THERMAL_Y);

    v.x += v.vx;
    v.y += v.vy;

    v.vx *= V_DRAG_X;
    v.vy *= V_DRAG_Y;
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
// ENFORCE RESERVE POOL (EMPTY / LOADING)
// =====================================================
function enforceReserveRectangle(vesicles) {

  const r = getVesicleReserveRect();

  for (const v of vesicles) {

    if (isPoolExempt(v)) continue;
    if (v.state === "loaded") continue;

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
}


// =====================================================
// ENFORCE LOADED VESICLE ZONE
// =====================================================
function enforceLoadedVesicleRect(vesicles) {

  const r = getLoadedVesicleRect();

  for (const v of vesicles) {

    if (v.state !== "loaded") continue;
    if (v.releaseBias === true) continue;

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
}


// =====================================================
// 🔵 DEBUG DRAW — BOTH CONSTRAINT ZONES
// =====================================================
window.drawVesicleConstraintDebug = function () {

  const r1 = getVesicleReserveRect();
  const r2 = getLoadedVesicleRect();

  push();
  noFill();
  rectMode(CORNERS);

  // Reserve pool (dimmer blue)
  stroke(80, 160, 255, 140);
  strokeWeight(2);
  rect(r1.xMin, r1.yMin, r1.xMax, r1.yMax);

  // Loaded zone (brighter blue)
  stroke(80, 160, 255, 220);
  strokeWeight(2.5);
  rect(r2.xMin, r2.yMin, r2.xMax, r2.yMax);

  pop();
};


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
