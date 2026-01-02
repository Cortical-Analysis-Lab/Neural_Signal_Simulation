console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY
// =====================================================
//
// ✔ Smooth cytosolic vesicle drift (low chaos)
// ✔ Vesicle–vesicle separation (soft)
// ✔ Vesicle reserve rectangle enforcement
// ✔ Vesicle–membrane & stop-plane enforcement
//
// ⚠️ RELEASE STATES ARE EXEMPT FROM MOTION & COLLISIONS
// =====================================================


// -----------------------------------------------------
// MOTION TUNING (BIOLOGICAL FEEL)
// -----------------------------------------------------
const V_DRIFT     = 0.004;   // slow directional drift
const V_NOISE     = 0.002;   // gentle stochastic component
const V_DRAG      = 0.985;   // heavy cytosolic damping
const V_MAX       = 0.12;    // hard velocity clamp
const V_WALL_SOFT = 0.15;    // wall slide instead of bounce
const V_MIN_SEP   = 2.0;


// -----------------------------------------------------
// CYTOSOLIC RESERVE RECTANGLE
// -----------------------------------------------------
// Reduced by 1/3 from previous size
// -----------------------------------------------------
function getVesicleReserveRect() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  // ---------------- BACK OF CYTOSOL ------------------
  const baseWidth  = 36 * 4 * 0.67;     // width ↓ 1/3
  const baseHeight = window.SYNAPSE_TERMINAL_RADIUS * 0.55 * 1.5 * 0.67;

  const xMax = window.SYNAPSE_VESICLE_STOP_X + 18;
  const xMin = xMax + baseWidth;

  const yCenter = window.SYNAPSE_TERMINAL_CENTER_Y;

  return {
    xMin: xMin + r,
    xMax: xMax - r,
    yMin: yCenter - baseHeight + r,
    yMax: yCenter + baseHeight - r
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

  applySmoothDrift(vesicles);
  resolveVesicleSeparation(vesicles);
  enforceReserveRectangle(vesicles);
}


// -----------------------------------------------------
// SMOOTH DRIFT MOTION (NON-CHAOTIC)
// -----------------------------------------------------
function applySmoothDrift(vesicles) {

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    // Persistent drift direction
    if (v.vx === undefined) {
      const a = random(TWO_PI);
      v.vx = cos(a) * V_DRIFT;
      v.vy = sin(a) * V_DRIFT;
    }

    // Gentle stochastic wandering
    v.vx += random(-V_NOISE, V_NOISE);
    v.vy += random(-V_NOISE, V_NOISE);

    // Integrate
    v.x += v.vx;
    v.y += v.vy;

    // Heavy damping
    v.vx *= V_DRAG;
    v.vy *= V_DRAG;

    // Velocity clamp
    const spd = sqrt(v.vx * v.vx + v.vy * v.vy);
    if (spd > V_MAX) {
      v.vx *= V_MAX / spd;
      v.vy *= V_MAX / spd;
    }
  }
}


// -----------------------------------------------------
// SOFT VESICLE SEPARATION (NO BOUNCE)
// -----------------------------------------------------
function resolveVesicleSeparation(vesicles) {

  const r = window.SYNAPSE_VESICLE_RADIUS;
  const minD = r * 2 * V_MIN_SEP;

  for (let i = 0; i < vesicles.length; i++) {
    for (let j = i + 1; j < vesicles.length; j++) {

      const a = vesicles[i];
      const b = vesicles[j];

      if (isReleaseLocked(a) || isReleaseLocked(b)) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = sqrt(dx * dx + dy * dy);

      if (d > 0 && d < minD) {

        const nx = dx / d;
        const ny = dy / d;
        const push = (minD - d) * 0.04;

        a.x -= nx * push;
        a.y -= ny * push;
        b.x += nx * push;
        b.y += ny * push;
      }
    }
  }
}


// -----------------------------------------------------
// RESERVE RECTANGLE — SOFT WALL SLIDE
// -----------------------------------------------------
function enforceReserveRectangle(vesicles) {

  const rect = getVesicleReserveRect();

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    if (v.x < rect.xMin) {
      v.x = rect.xMin;
      v.vx *= -V_WALL_SOFT;
    } else if (v.x > rect.xMax) {
      v.x = rect.xMax;
      v.vx *= -V_WALL_SOFT;
    }

    if (v.y < rect.yMin) {
      v.y = rect.yMin;
      v.vy *= -V_WALL_SOFT;
    } else if (v.y > rect.yMax) {
      v.y = rect.yMax;
      v.vy *= -V_WALL_SOFT;
    }
  }
}


// -----------------------------------------------------
// SPAWN API (USED BY RECYCLING)
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const vesicles = window.synapseVesicles;
  if (!vesicles) return;
  if (vesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const rect = getVesicleReserveRect();
  const a = random(TWO_PI);

  vesicles.push({
    x: random(rect.xMin, rect.xMax),
    y: random(rect.yMin, rect.yMax),
    vx: cos(a) * V_DRIFT,
    vy: sin(a) * V_DRIFT,
    state: "empty",
    primedH: false,
    primedATP: false,
    nts: []
  });
};


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
