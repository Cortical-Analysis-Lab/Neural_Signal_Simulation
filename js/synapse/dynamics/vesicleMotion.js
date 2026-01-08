console.log("🫧 vesicleMotion loaded — corrected");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS (POOL-OWNED)
// =====================================================
//
// ✔ Brownian drift (energy-injecting)
// ✔ Gentle damping (non-destructive)
// ✔ Position integration
// ✔ Reserve-pool soft collisions
//
// =====================================================


// -----------------------------------------------------
// 🔧 TUNING — BIOLOGICALLY CALM BUT VISIBLE
// -----------------------------------------------------

// Brownian noise (energy source)
const THERMAL_RESERVE_X = 0.035;
const THERMAL_RESERVE_Y = 0.018;

const THERMAL_LOADED_X  = 0.010;
const THERMAL_LOADED_Y  = 0.006;

// Drag (must be weaker than noise injection)
const DRAG_X = 0.992;
const DRAG_Y = 0.985;

// Collision impulse
const COLLISION_PUSH = 0.06;

// Minimum motion floor (prevents freeze)
const MIN_V = 0.0008;


// -----------------------------------------------------
// APPLY DAMPING (FIRST)
// -----------------------------------------------------
function applyDamping(v) {
  v.vx *= DRAG_X;
  v.vy *= DRAG_Y;
}


// -----------------------------------------------------
// APPLY BROWNIAN MOTION (ENERGY INJECTION)
// -----------------------------------------------------
function applyBrownianMotion(v) {

  if (v.releaseBias === true) return;
  if (v.state === "LOADED_TRAVEL") return;

  if (v.state === "LOADED") {
    v.vx += random(-THERMAL_LOADED_X, THERMAL_LOADED_X);
    v.vy += random(-THERMAL_LOADED_Y, THERMAL_LOADED_Y);
  } else {
    v.vx += random(-THERMAL_RESERVE_X, THERMAL_RESERVE_X);
    v.vy += random(-THERMAL_RESERVE_Y, THERMAL_RESERVE_Y);
  }

  // Prevent total numerical freeze
  if (Math.abs(v.vx) < MIN_V) v.vx += random(-MIN_V, MIN_V);
  if (Math.abs(v.vy) < MIN_V) v.vy += random(-MIN_V, MIN_V);
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
// RESOLVE RESERVE-POOL COLLISIONS
// -----------------------------------------------------
function resolveCollisions(vesicles) {

  for (let i = 0; i < vesicles.length; i++) {

    const a = vesicles[i];
    if (a.releaseBias) continue;
    if (a.state !== "EMPTY") continue;

    for (let j = i + 1; j < vesicles.length; j++) {

      const b = vesicles[j];
      if (b.releaseBias) continue;
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
// MAIN UPDATE
// -----------------------------------------------------
function updateVesicleMotion() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  // 1️⃣ Damping (retain inertia)
  for (const v of vesicles) {
    if (v.releaseBias) continue;
    applyDamping(v);
  }

  // 2️⃣ Brownian injection
  for (const v of vesicles) {
    if (v.releaseBias) continue;
    applyBrownianMotion(v);
  }

  // 3️⃣ Collisions (reserve only)
  resolveCollisions(vesicles);

  // 4️⃣ Integrate
  for (const v of vesicles) {
    if (v.releaseBias) continue;
    integratePosition(v);
  }
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.updateVesicleMotion = updateVesicleMotion;
