console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY
// =====================================================
//
// ✔ Vesicle Brownian motion
// ✔ Vesicle–vesicle collision resolution
// ✔ Vesicle reserve rectangle enforcement
// ✔ Vesicle–membrane & stop-plane enforcement
// ✔ Capsule boundary enforcement (secondary)
//
// ⚠️ RELEASE STATES ARE EXEMPT FROM MOTION & COLLISIONS
// =====================================================


// -----------------------------------------------------
// LOCAL MOTION PARAMETERS
// -----------------------------------------------------
const V_THERMAL = 0.018;
const V_DRAG    = 0.992;
const V_REBOUND = 0.35;
const V_MIN_SEP = 2.1;


// -----------------------------------------------------
// CYTOSOLIC RESERVE RECTANGLE (AUTHORITATIVE)
// -----------------------------------------------------
// • 4× wider
// • 1.5× taller
// • Shifted BACK into cytosol (away from membrane)
// -----------------------------------------------------
function getVesicleReserveRect() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  // -----------------------------------------------
  // HORIZONTAL (DEPTH INTO CYTOSOL)
  // -----------------------------------------------
  // Start farther from stop plane and extend backward
  const xMax = window.SYNAPSE_VESICLE_STOP_X + 18;
  const xMin = xMax + (36 * 4); // 4× wider

  // -----------------------------------------------
  // VERTICAL (HEIGHT)
  // -----------------------------------------------
  const yCenter = window.SYNAPSE_TERMINAL_CENTER_Y;
  const yHalf   = window.SYNAPSE_TERMINAL_RADIUS * 0.55 * 1.5;

  return {
    xMin: xMin + r,
    xMax: xMax - r,
    yMin: yCenter - yHalf + r,
    yMax: yCenter + yHalf - r
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
  enforceMembraneConstraints(vesicles);
  enforceCapsuleBoundary(vesicles);
}


// -----------------------------------------------------
// BROWNIAN MOTION
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    if (v.vx === undefined) v.vx = random(-0.02, 0.02);
    if (v.vy === undefined) v.vy = random(-0.02, 0.02);

    v.vx += random(-V_THERMAL, V_THERMAL);
    v.vy += random(-V_THERMAL, V_THERMAL);

    v.x += v.vx;
    v.y += v.vy;

    v.vx *= V_DRAG;
    v.vy *= V_DRAG;
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

      if (isReleaseLocked(a) || isReleaseLocked(b)) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = sqrt(dx * dx + dy * dy);

      if (d > 0 && d < minD) {

        const nx = dx / d;
        const ny = dy / d;

        const overlap = (minD - d) * 0.5;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        const impulse = (dvx * nx + dvy * ny) * 0.4;

        a.vx += impulse * nx;
        a.vy += impulse * ny;
        b.vx -= impulse * nx;
        b.vy -= impulse * ny;
      }
    }
  }
}


// -----------------------------------------------------
// RESERVE RECTANGLE ENFORCEMENT (PRIMARY)
// -----------------------------------------------------
function enforceReserveRectangle(vesicles) {

  const rect = getVesicleReserveRect();

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    // X walls
    if (v.x < rect.xMin) {
      v.x = rect.xMin;
      v.vx = abs(v.vx) * V_REBOUND;
    } else if (v.x > rect.xMax) {
      v.x = rect.xMax;
      v.vx = -abs(v.vx) * V_REBOUND;
    }

    // Y walls
    if (v.y < rect.yMin) {
      v.y = rect.yMin;
      v.vy = abs(v.vy) * V_REBOUND;
    } else if (v.y > rect.yMax) {
      v.y = rect.yMax;
      v.vy = -abs(v.vy) * V_REBOUND;
    }
  }
}


// -----------------------------------------------------
// STOP-PLANE ENFORCEMENT (SECONDARY)
// -----------------------------------------------------
function enforceMembraneConstraints(vesicles) {

  const stopX = window.SYNAPSE_VESICLE_STOP_X;
  const r     = window.SYNAPSE_VESICLE_RADIUS;

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    if (v.x < stopX + r) {
      v.x = stopX + r;
      v.vx = abs(v.vx) * V_REBOUND;
    }
  }
}


// -----------------------------------------------------
// CAPSULE BOUNDARY (SAFETY NET)
// -----------------------------------------------------
function enforceCapsuleBoundary(vesicles) {

  const cx = window.SYNAPSE_TERMINAL_CENTER_X;
  const cy = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R  = window.SYNAPSE_TERMINAL_RADIUS;
  const r  = window.SYNAPSE_VESICLE_RADIUS;

  const maxR = R - r - 2;

  for (const v of vesicles) {

    if (isReleaseLocked(v)) continue;

    const dx = v.x - cx;
    const dy = v.y - cy;
    const d  = sqrt(dx * dx + dy * dy);

    if (d > maxR) {
      const s = maxR / d;
      v.x = cx + dx * s;
      v.y = cy + dy * s;
      v.vx *= -V_REBOUND;
      v.vy *= -V_REBOUND;
    }
  }
}


// -----------------------------------------------------
// SAFE SPAWN API (USED BY RECYCLING)
// -----------------------------------------------------
window.requestNewEmptyVesicle = function () {

  const vesicles = window.synapseVesicles;
  if (!vesicles) return;

  if (vesicles.length >= window.SYNAPSE_MAX_VESICLES) return;

  const rect = getVesicleReserveRect();

  vesicles.push({
    x: random(rect.xMin, rect.xMax),
    y: random(rect.yMin, rect.yMax),

    state: "empty",
    primedH: false,
    primedATP: false,
    nts: []
  });
};


// -----------------------------------------------------
// OPTIONAL DEBUG DRAW (BLUE RESERVE RECTANGLE)
// -----------------------------------------------------
window.drawVesicleReserveDebug = function () {

  const r = getVesicleReserveRect();

  push();
  noFill();
  stroke(80, 160, 255, 220);
  strokeWeight(3);
  rectMode(CORNERS);
  rect(r.xMin, r.yMin, r.xMax, r.yMax);
  pop();
};


// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
