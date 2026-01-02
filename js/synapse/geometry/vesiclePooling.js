console.log("🫧 vesiclePool loaded");

// =====================================================
// VESICLE POOL — MOTION & GEOMETRY AUTHORITY
// -----------------------------------------------------
// RESPONSIBILITIES:
// ✔ Vesicle Brownian motion
// ✔ Vesicle–vesicle collision resolution
// ✔ Vesicle–membrane & stop-plane enforcement
// ✔ Capsule boundary enforcement
//
// NON-RESPONSIBILITIES:
// ✘ Chemistry (H+, ATP, NT loading)
// ✘ State transitions
// ✘ Rendering
//
// This file is the FINAL authority on vesicle position.
// If a vesicle crosses a boundary, it is a bug HERE.
// =====================================================


// -----------------------------------------------------
// REQUIRED GLOBALS (READ-ONLY)
// -----------------------------------------------------
// window.synapseVesicles  → array of vesicles
//
// window.SYNAPSE_TERMINAL_CENTER_X
// window.SYNAPSE_TERMINAL_CENTER_Y
// window.SYNAPSE_TERMINAL_RADIUS
//
// window.SYNAPSE_VESICLE_RADIUS
// window.SYNAPSE_VESICLE_STOP_X
// -----------------------------------------------------


// -----------------------------------------------------
// LOCAL MOTION PARAMETERS (TUNABLE, SAFE)
// -----------------------------------------------------
const V_THERMAL = 0.018;   // Brownian energy injection
const V_DRAG    = 0.992;   // Cytosolic viscosity
const V_REBOUND = 0.35;    // Wall bounce damping
const V_MIN_SEP = 2.1;     // Vesicle diameter multiplier


// -----------------------------------------------------
// MAIN UPDATE ENTRY POINT
// -----------------------------------------------------
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!vesicles || vesicles.length === 0) return;

  applyBrownianMotion(vesicles);
  resolveVesicleCollisions(vesicles);
  enforceMembraneConstraints(vesicles);
  enforceCapsuleBoundary(vesicles);
}


// -----------------------------------------------------
// BROWNIAN MOTION (LOW-ENERGY, CONTINUOUS)
// -----------------------------------------------------
function applyBrownianMotion(vesicles) {

  for (const v of vesicles) {

    // Initialize velocity if missing
    if (v.vx === undefined) v.vx = random(-0.02, 0.02);
    if (v.vy === undefined) v.vy = random(-0.02, 0.02);

    // Thermal input
    v.vx += random(-V_THERMAL, V_THERMAL);
    v.vy += random(-V_THERMAL, V_THERMAL);

    // Integrate
    v.x += v.vx;
    v.y += v.vy;

    // Drag
    v.vx *= V_DRAG;
    v.vy *= V_DRAG;
  }
}


// -----------------------------------------------------
// VESICLE–VESICLE COLLISIONS (ELASTIC, DAMPED)
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
      const d  = sqrt(dx * dx + dy * dy);

      if (d > 0 && d < minD) {

        const nx = dx / d;
        const ny = dy / d;

        // Positional separation
        const overlap = (minD - d) * 0.5;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // Velocity exchange (soft elastic)
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
// MEMBRANE & STOP-PLANE ENFORCEMENT (HARD)
// -----------------------------------------------------
function enforceMembraneConstraints(vesicles) {

  const stopX = window.SYNAPSE_VESICLE_STOP_X;
  const r     = window.SYNAPSE_VESICLE_RADIUS;

  for (const v of vesicles) {

    // Vesicles may NEVER cross the stop plane
    if (v.x < stopX + r) {
      v.x = stopX + r;
      v.vx = abs(v.vx) * V_REBOUND;
    }
  }
}


// -----------------------------------------------------
// CAPSULE BOUNDARY ENFORCEMENT (RADIAL)
// -----------------------------------------------------
function enforceCapsuleBoundary(vesicles) {

  const cx = window.SYNAPSE_TERMINAL_CENTER_X;
  const cy = window.SYNAPSE_TERMINAL_CENTER_Y;
  const R  = window.SYNAPSE_TERMINAL_RADIUS;
  const r  = window.SYNAPSE_VESICLE_RADIUS;

  const maxR = R - r - 2;

  for (const v of vesicles) {

    const dx = v.x - cx;
    const dy = v.y - cy;
    const d  = sqrt(dx * dx + dy * dy);

    if (d > maxR) {

      const s = maxR / d;
      v.x = cx + dx * s;
      v.y = cy + dy * s;

      // Reflect velocity inward
      v.vx *= -V_REBOUND;
      v.vy *= -V_REBOUND;
    }
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT (GLOBAL)
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
