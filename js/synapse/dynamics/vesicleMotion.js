console.log("🫧 vesicleMotion loaded");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS (POOL ONLY)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Brownian drift
// ✔ Velocity damping
// ✔ Position integration
// ✔ Vesicle–vesicle soft collisions
//
// NON-RESPONSIBILITIES:
// ✘ No spatial constraints
// ✘ No state transitions
// ✘ No chemistry
// ✘ No release or recycling logic
// ✘ No geometry awareness
//
// HARD RULE:
// • Vesicles with releaseBias === true are UNTOUCHABLE
//
// =====================================================


// -----------------------------------------------------
// TUNING (BIOLOGICALLY CALM)
// -----------------------------------------------------
const THERMAL_X = 0.012;
const THERMAL_Y = 0.004;

const DRAG_X = 0.985;
const DRAG_Y = 0.950;

const COLLISION_PUSH = 0.04;


// -----------------------------------------------------
// APPLY BROWNIAN DRIFT
// -----------------------------------------------------
function applyBrownianMotion(v) {
  v.vx += random(-THERMAL_X, THERMAL_X);
  v.vy += random(-THERMAL_Y, THERMAL_Y);
}


// -----------------------------------------------------
// APPLY VELOCITY DAMPING
// -----------------------------------------------------
function applyDamping(v) {
  v.vx *= DRAG_X;
  v.vy *= DRAG_Y;
}


// -----------------------------------------------------
// INTEGRATE POSITION
// -----------------------------------------------------
function integratePosition(v) {
  v.x += v.vx;
  v.y += v.vy;
}


// -----------------------------------------------------
// RESOLVE VESICLE–VESICLE COLLISIONS (SOFT REPULSION)
// -----------------------------------------------------
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {
    const a = vesicles[i];

    // Skip non-pool vesicles
    if (a.releaseBias === true) continue;

    for (let j = i + 1; j < vesicles.length; j++) {
      const b = vesicles[j];

      // Skip non-pool vesicles
      if (b.releaseBias === true) continue;

      if (a.x == null || b.x == null) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      if (dist > 0 && dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        const push = (minDist - dist) * COLLISION_PUSH;

        a.vx -= nx * push;
        a.vy -= ny * push;
        b.vx += nx * push;
        b.vy += ny * push;
      }
    }
  }
}


// -----------------------------------------------------
// MAIN UPDATE — MOTION AUTHORITY ONLY
// -----------------------------------------------------
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  // ---------------------------------------------------
  // APPLY STOCHASTIC MOTION + DAMPING
  // ---------------------------------------------------
  for (const v of vesicles) {

    // Motion NEVER touches release-owned vesicles
    if (v.releaseBias === true) continue;

    applyBrownianMotion(v);
    applyDamping(v);
  }

  // ---------------------------------------------------
  // COLLISION RESOLUTION (POOL ONLY)
  // ---------------------------------------------------
  resolveCollisions(vesicles);

  // ---------------------------------------------------
  // POSITION INTEGRATION
  // ---------------------------------------------------
  for (const v of vesicles) {

    if (v.releaseBias === true) continue;

    integratePosition(v);
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT (GLOBAL HOOK)
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
