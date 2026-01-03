console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY (FINAL)
// =====================================================
//
// ✔ Smooth Brownian drift (non-repetitive)
// ✔ Deep cytosolic reserve rectangle (implicit, invisible)
// ✔ Soft confinement (NO ping-pong)
// ✔ Vesicle–vesicle collisions (gentle)
// ✔ Release states fully exempt
//
// 🔒 Reserve geometry is HARD-CODED
// 👻 No debug rendering
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


// -----------------------------------------------------
// 🔒 CYTOSOLIC RESERVE RECTANGLE (LOCKED)
// -----------------------------------------------------
// • Anchored to membrane stop-plane
// • Invisible
// • Stable for entire runtime
// -----------------------------------------------------

let _vesicleReserveRect = null;

function getVesicleReserveRect() {

  // Cache once — geometry should NEVER change at runtime
  if (_vesicleReserveRect) return _vesicleReserveRect;

  const cy    = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R     = window.SYNAPSE_TERMINAL_RADIUS;
  const stopX = window.SYNAPSE_VESICLE_STOP_X;

  // 🔒 FINALIZED GEOMETRY
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


// -----------------------------------------------------
// RELEASE STATE GUARD
// -----------------------------------------------------
function isReleaseLocked(v) {
  return (
    v.state === "DOCKING" ||
    v.state === "FUSION_ZIPPER" ||
    v.state === "FUSION_PORE" ||
    v.state === "FUSION_OPEN" ||
    v.state === "MEMBRANE_MERGE"
  );
}


// -----------------------------------------------------
// MAIN UPDATE
// -----------------------------------------------------
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!vesicles || vesicles.length === 0) return;

  applyBrownianMotion(vesicles);
  resolveVesicleCollisions(vesicles);
  enforceReserveRectangle(vesicles);
}


// -----------------------------------------------------
// SMOOTH BROWNIAN MOTION
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

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
// VESICLE–VESICLE COLLISIONS (GENTLE)
// -----------------------------------------------------
function resolveVesicleCollisions(vesicles) {

  const r = window.SYNAPSE_VESICLE_RADIUS;
  const minD = r * 2 * V_MIN_SEP;

  for (let i = 0; i < vesicles.length; i++) {
    for (let j = i + 1; j < vesicles.length; j++) {

      const a = vesicles[i];
      const b = vesicles[j];

      if (isReleaseLocked(a) || isReleaseLocked(b)) continue;

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

        a.vx -= nx * 0.10;
        a.vy -= ny * 0.06;
        b.vx += nx * 0.10;
        b.vy += ny * 0.06;
      }
    }
  }
}


// -----------------------------------------------------
// RESERVE RECTANGLE ENFORCEMENT (INVISIBLE)
// -----------------------------------------------------
function enforceReserveRectangle(vesicles) {

  const r = getVesicleReserveRect();

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

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


// -----------------------------------------------------
// SAFE SPAWN API
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const vesicles = window.synapseVesicles;
  if (!vesicles) return;
  if (vesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const r = getVesicleReserveRect();

  vesicles.push({
    x: random(r.xMin, r.xMax),
    y: random(r.yMin, r.yMax),

    vx: random(-0.01, 0.01),
    vy: random(-0.004, 0.004),

    state: "empty",
    primedH: false,
    primedATP: false,
    nts: []
  });
};


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
