console.log("🫧 vesicleMotion loaded");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS (POOL-OWNED)
// =====================================================
//
// COORDINATE CONTRACT:
// • Presynaptic LOCAL space
// • +X → toward membrane
// • -X → deeper cytosol
// • NO flips
// • NO view transforms
//
// RESPONSIBILITIES:
// ✔ Brownian drift (reserve + loaded only)
// ✔ Velocity damping
// ✔ Position integration
// ✔ Vesicle–vesicle soft collisions (non-docked only)
//
// NON-RESPONSIBILITIES:
// ✘ No spatial constraints (handled by vesiclePools.js)
// ✘ No state transitions
// ✘ No chemistry
// ✘ No fusion / recycling
//
// HARD RULES:
// • releaseBias vesicles are UNTOUCHABLE
// • LOADED vesicles do NOT collide
//
// =====================================================


// -----------------------------------------------------
// 🔧 TUNING — BIOLOGICALLY CALM
// -----------------------------------------------------

// Thermal motion (reserve pool)
const THERMAL_X = 0.012;
const THERMAL_Y = 0.004;

// Loaded vesicles barely jitter
const THERMAL_LOADED_SCALE = 0.15;

// Drag (anisotropic to preserve lateral spread)
const DRAG_X = 0.985;
const DRAG_Y = 0.950;

// Collision impulse strength
const COLLISION_PUSH_RESERVE = 0.08;
const COLLISION_PUSH_TRAVEL  = 0.04;


// -----------------------------------------------------
// APPLY BROWNIAN DRIFT
// -----------------------------------------------------
function applyBrownianMotion(v) {

  // 🚫 No noise during directed staging travel
  if (v.state === "LOADED_TRAVEL") return;

  // 🔒 Docked vesicles: extremely low noise
  const scale =
    v.state === "LOADED"
      ? THERMAL_LOADED_SCALE
      : 1.0;

  v.vx += random(-THERMAL_X, THERMAL_X) * scale;
  v.vy += random(-THERMAL_Y, THERMAL_Y) * scale;
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
// RESOLVE VESICLE–VESICLE COLLISIONS
// -----------------------------------------------------
//
// • Only for pool-owned vesicles
// • LOADED vesicles are exempt (they stage, not jostle)
// • releaseBias vesicles are sacred
//
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {
    const a = vesicles[i];

    if (a.releaseBias === true) continue;
    if (a.state === "LOADED") continue;
    if (a.x == null) continue;

    for (let j = i + 1; j < vesicles.length; j++) {
      const b = vesicles[j];

      if (b.releaseBias === true) continue;
      if (b.state === "LOADED") continue;
      if (b.x == null) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      if (dist > 0 && dist < minDist) {

        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) * 0.5;

        // --- positional separation
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // --- impulse depends on state
        const impulse =
          (a.state === "LOADED_TRAVEL" || b.state === "LOADED_TRAVEL")
            ? COLLISION_PUSH_TRAVEL
            : COLLISION_PUSH_RESERVE;

        a.vx -= nx * impulse;
        a.vy -= ny * impulse * 0.6;
        b.vx += nx * impulse;
        b.vy += ny * impulse * 0.6;
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
  // STOCHASTIC MOTION + DAMPING
  // ---------------------------------------------------
  for (const v of vesicles) {
    if (v.releaseBias === true) continue;
    applyBrownianMotion(v);
    applyDamping(v);
  }

  // ---------------------------------------------------
  // COLLISIONS (POOL-OWNED ONLY)
  // ---------------------------------------------------
  resolveCollisions(vesicles);

  // ---------------------------------------------------
  // INTEGRATE POSITION
  // ---------------------------------------------------
  for (const v of vesicles) {
    if (v.releaseBias === true) continue;
    integratePosition(v);
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
