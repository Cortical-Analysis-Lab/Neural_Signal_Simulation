console.log("🫧 vesicleMotion loaded — floating restored");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS (POOL-COMPATIBLE)
// =====================================================
//
// ✔ Brownian drift (energy injection)
// ✔ Gentle damping (inertia-preserving)
// ✔ State-aware motion scaling
// ✔ Reserve-pool collisions only
//
// OWNERSHIP:
// • Disabled during release
// • Disabled during recycling
// • Subordinate to vesiclePools confinement
//
// =====================================================


// -----------------------------------------------------
// 🔧 TUNING — BIOLOGICALLY CALM BUT VISIBLE
// -----------------------------------------------------

// Brownian noise (energy source)
const THERMAL_RESERVE_X = 0.035;
const THERMAL_RESERVE_Y = 0.020;

const THERMAL_LOADED_X  = 0.018;
const THERMAL_LOADED_Y  = 0.010;

// Drag (must be weaker than noise injection)
const DRAG_X = 0.992;
const DRAG_Y = 0.985;

// Collision impulse (reserve only)
const COLLISION_PUSH = 0.06;

// Minimum motion floor (prevents freeze)
const MIN_V = 0.0008;


// -----------------------------------------------------
// APPLY BROWNIAN MOTION (ENERGY INJECTION)
// -----------------------------------------------------
function applyBrownianMotion(v) {

  // Hard exclusions
  if (v.releaseBias === true) return;
  if (v.recycleBias === true) return;

  // LOADED_TRAVEL → reduced lateral wander
  if (v.state === "LOADED_TRAVEL") {
    v.vx += random(-THERMAL_LOADED_X * 0.4, THERMAL_LOADED_X * 0.4);
    v.vy += random(-THERMAL_LOADED_Y * 0.4, THERMAL_LOADED_Y * 0.4);
    return;
  }

  // LOADED → subtle jitter
  if (v.state === "LOADED") {
    v.vx += random(-THERMAL_LOADED_X, THERMAL_LOADED_X);
    v.vy += random(-THERMAL_LOADED_Y, THERMAL_LOADED_Y);
  }
  // EMPTY / RESERVE → stronger drift
  else {
    v.vx += random(-THERMAL_RESERVE_X, THERMAL_RESERVE_X);
    v.vy += random(-THERMAL_RESERVE_Y, THERMAL_RESERVE_Y);
  }

  // Prevent numerical freeze
  if (Math.abs(v.vx) < MIN_V) v.vx += random(-MIN_V, MIN_V);
  if (Math.abs(v.vy) < MIN_V) v.vy += random(-MIN_V, MIN_V);
}


// -----------------------------------------------------
// APPLY DAMPING (AFTER NOISE)
// -----------------------------------------------------
function applyDamping(v) {

  if (v.releaseBias === true) return;
  if (v.recycleBias === true) return;

  v.vx *= DRAG_X;
  v.vy *= DRAG_Y;
}


// -----------------------------------------------------
// INTEGRATE POSITION
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
// RESOLVE RESERVE-POOL COLLISIONS ONLY
// -----------------------------------------------------
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {

    const a = vesicles[i];
    if (a.releaseBias) continue;
    if (a.recycleBias) continue;
    if (a.state !== "EMPTY") continue;

    for (let j = i + 1; j < vesicles.length; j++) {

      const b = vesicles[j];
      if (b.releaseBias) continue;
      if (b.recycleBias) continue;
      if (b.state !== "EMPTY") continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = a.radius + b.radius;

      if (dist > 0 && dist < minDist) {

        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) * 0.5;

        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        a.vx -= nx * COLLISION_PUSH;
        a.vy -= ny * COLLISION_PUSH * 0.6;
        b.vx += nx * COLLISION_PUSH;
        b.vy += ny * COLLISION_PUSH * 0.6;
      }
    }
  }
}


// -----------------------------------------------------
// MAIN UPDATE — FLOATING FIRST, POOLS LATER
// -----------------------------------------------------
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  // 1️⃣ Brownian energy injection
  for (const v of vesicles) {
    applyBrownianMotion(v);
  }

  // 2️⃣ Damping (soften, do not erase)
  for (const v of vesicles) {
    applyDamping(v);
  }

  // 3️⃣ Integrate motion
  for (const v of vesicles) {
    integratePosition(v);
  }

  // 4️⃣ Resolve collisions (reserve only)
  resolveCollisions(vesicles);
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
