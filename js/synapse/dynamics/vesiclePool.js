console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY (STABLE)
// =====================================================
//
// ✔ Smooth Brownian drift (non-chaotic)
// ✔ Cytosolic reserve rectangle (deep)
// ✔ Soft vertical confinement (NO ping-pong)
// ✔ Vesicle–vesicle collisions
// ✔ Release states exempt
// =====================================================


// -----------------------------------------------------
// MOTION PARAMETERS (CALM)
// -----------------------------------------------------
const V_THERMAL_X = 0.014;   // horizontal drift
const V_THERMAL_Y = 0.006;   // MUCH weaker vertical noise

const V_DRAG_X    = 0.990;
const V_DRAG_Y    = 0.960;   // strong vertical damping

const V_REBOUND   = 0.25;
const V_MIN_SEP   = 2.1;


// -----------------------------------------------------
// CYTOSOLIC RESERVE RECTANGLE (AUTHORITATIVE)
// -----------------------------------------------------
// • 1/3 smaller
// • Deep cytosolic
// • NOT membrane-adjacent
// -----------------------------------------------------
function getVesicleReserveRect() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  const cx = window.SYNAPSE_TERMINAL_CENTER_X;
  const cy = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R  = window.SYNAPSE_TERMINAL_RADIUS;

  const width  = 48 * (2 / 3);   // reduced by 1/3
  const height = R * 0.50;       // reduced vertical span

  return {
    xMin: cx + 18,
    xMax: cx + 18 + width,

    yMin: cy - height,
    yMax: cy + height
  };
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
// SMOOTH BROWNIAN MOTION (NO RACING)
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  const rect = getVesicleReserveRect();
  const yCenter = (rect.yMin + rect.yMax) * 0.5;

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    if (v.vx === undefined) v.vx = random(-0.01, 0.01);
    if (v.vy === undefined) v.vy = random(-0.01, 0.01);

    // Horizontal drift (free)
    v.vx += random(-V_THERMAL_X, V_THERMAL_X);

    // Vertical drift (weak + restoring)
    v.vy += random(-V_THERMAL_Y, V_THERMAL_Y);
    v.vy += (yCenter - v.y) * 0.0008; // soft spring

    v.x += v.vx;
    v.y += v.vy;

    v.vx *= V_DRAG_X;
    v.vy *= V_DRAG_Y;
  }
}


// -----------------------------------------------------
// VESICLE–VESICLE COLLISIONS (CALM)
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

        const impulse = 0.25;
        a.vx -= nx * impulse;
        a.vy -= ny * impulse;
        b.vx += nx * impulse;
        b.vy += ny * impulse;
      }
    }
  }
}


// -----------------------------------------------------
// RESERVE RECTANGLE ENFORCEMENT (SOFT)
// -----------------------------------------------------
function enforceReserveRectangle(vesicles) {

  const r = getVesicleReserveRect();

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    if (v.x < r.xMin) {
      v.x = r.xMin;
      v.vx = Math.abs(v.vx) * V_REBOUND;
    }
    if (v.x > r.xMax) {
      v.x = r.xMax;
      v.vx = -Math.abs(v.vx) * V_REBOUND;
    }

    if (v.y < r.yMin) {
      v.y = r.yMin;
      v.vy *= -0.15;
    }
    if (v.y > r.yMax) {
      v.y = r.yMax;
      v.vy *= -0.15;
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
    state: "empty",
    primedH: false,
    primedATP: false,
    nts: []
  });
};


// -----------------------------------------------------
// DEBUG DRAW (VISIBLE, STABLE)
// -----------------------------------------------------
window.drawVesicleReserveDebug = function () {

  const r = getVesicleReserveRect();

  push();
  noFill();
  stroke(80, 160, 255, 200);
  strokeWeight(2.5);
  rectMode(CORNERS);
  rect(r.xMin, r.yMin, r.xMax, r.yMax);
  pop();
};


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
