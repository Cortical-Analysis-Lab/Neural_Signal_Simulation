console.log("🫧 vesicleMotion loaded");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS (POOL ONLY)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Brownian drift (reserve + loaded only)
// ✔ Velocity damping
// ✔ Position integration
// ✔ Vesicle–vesicle soft collisions
//
// NON-RESPONSIBILITIES:
// ✘ No spatial constraints
// ✘ No state transitions
// ✘ No chemistry
// ✘ No release or recycling logic
//
// HARD RULES:
// • releaseBias vesicles are UNTOUCHABLE
// • LOADED vesicles do NOT collide
//
// =====================================================


// -----------------------------------------------------
// TUNING (BIOLOGICALLY CALM)
// -----------------------------------------------------
const THERMAL_X = 0.012;
const THERMAL_Y = 0.004;

const THERMAL_LOADED_SCALE = 0.15; // 🔒 docked vesicles barely jitter

const DRAG_X = 0.985;
const DRAG_Y = 0.950;

const COLLISION_PUSH_RESERVE = 0.08;
const COLLISION_PUSH_TRAVEL  = 0.04;


// -----------------------------------------------------
// APPLY BROWNIAN DRIFT
// -----------------------------------------------------
function applyBrownianMotion(v) {

  // 🚫 No stochastic motion during directed travel
  if (v.state === "LOADED_TRAVEL") return;

  // 🔒 Docked vesicles: extremely small thermal noise
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
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {
    const a = vesicles[i];

    if (a.releaseBias === true) continue;
    if (a.state === "LOADED") continue; // 🔒 docked vesicles do not jostle
    if (a.x == null) continue;

    for (let j = i + 1; j < vesicles.length; j++) {
      const b = vesicles[j];

      if (b.releaseBias === true) continue;
      if (b.state === "LOADED") continue; // 🔒 docked vesicles do not jostle
      if (b.x == null) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      if (dist > 0 && dist < minDist) {

        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) * 0.5;

        // Separate
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

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

  // --- stochastic motion
  for (const v of vesicles) {
    if (v.releaseBias === true) continue;
    applyBrownianMotion(v);
    applyDamping(v);
  }

  // --- collisions (pool-owned only)
  resolveCollisions(vesicles);

  // --- integrate
  for (const v of vesicles) {
    if (v.releaseBias === true) continue;
    integratePosition(v);
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
