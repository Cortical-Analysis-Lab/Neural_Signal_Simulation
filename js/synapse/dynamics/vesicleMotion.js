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
// HARD RULES:
// • releaseBias vesicles are UNTOUCHABLE
// • LOADED vesicles do NOT collide
// • LOADED_TRAVEL vesicles do NOT collide
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

// Drag (anisotropic)
const DRAG_X = 0.985;
const DRAG_Y = 0.950;

// Collision impulse strength
const COLLISION_PUSH_RESERVE = 0.08;
const COLLISION_PUSH_TRAVEL  = 0.04;


// -----------------------------------------------------
// APPLY BROWNIAN DRIFT
// -----------------------------------------------------
function applyBrownianMotion(v) {

  // 🚫 No noise during directed travel
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
// INTEGRATE POSITION (SAFE)
// -----------------------------------------------------
function integratePosition(v) {

  if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) {
    v.vx = 0;
    v.vy = 0;
    return;
  }

  v.x += v.vx;
  v.y += v.vy;
}


// -----------------------------------------------------
// RESOLVE VESICLE–VESICLE COLLISIONS
// -----------------------------------------------------
//
// • Only reserve-pool vesicles collide
// • LOADED and LOADED_TRAVEL are immune
// • releaseBias vesicles are sacred
//
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {

    const a = vesicles[i];

    if (a.releaseBias === true) continue;
    if (a.state === "LOADED") continue;
    if (a.state === "LOADED_TRAVEL") continue;
    if (!Number.isFinite(a.x)) continue;

    for (let j = i + 1; j < vesicles.length; j++) {

      const b = vesicles[j];

      if (b.releaseBias === true) continue;
      if (b.state === "LOADED") continue;
      if (b.state === "LOADED_TRAVEL") continue;
      if (!Number.isFinite(b.x)) continue;

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

        // --- gentle impulse
        a.vx -= nx * COLLISION_PUSH_RESERVE;
        a.vy -= ny * COLLISION_PUSH_RESERVE * 0.6;
        b.vx += nx * COLLISION_PUSH_RESERVE;
        b.vy += ny * COLLISION_PUSH_RESERVE * 0.6;
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
  // COLLISIONS (RESERVE ONLY)
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
// PUBLIC EXPORT
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
