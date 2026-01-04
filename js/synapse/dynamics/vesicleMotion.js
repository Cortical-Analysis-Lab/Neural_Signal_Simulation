console.log("🫧 vesicleMotion loaded");

// =====================================================
// VESICLE MOTION — PURE KINEMATICS
// =====================================================

// Tunable but biologically calm
const THERMAL_X = 0.012;
const THERMAL_Y = 0.004;

const DRAG_X = 0.985;
const DRAG_Y = 0.950;

const COLLISION_PUSH = 0.04;

// -----------------------------------------------------
// Brownian drift
// -----------------------------------------------------
export function applyBrownianMotion(v) {
  v.vx += random(-THERMAL_X, THERMAL_X);
  v.vy += random(-THERMAL_Y, THERMAL_Y);
}

// -----------------------------------------------------
// Velocity damping
// -----------------------------------------------------
export function applyDamping(v) {
  v.vx *= DRAG_X;
  v.vy *= DRAG_Y;
}

// -----------------------------------------------------
// Integrate motion
// -----------------------------------------------------
export function integratePosition(v) {
  v.x += v.vx;
  v.y += v.vy;
}

// -----------------------------------------------------
// Vesicle–vesicle collisions (soft repulsion)
// -----------------------------------------------------
export function resolveCollisions(vesicles) {
  for (let i = 0; i < vesicles.length; i++) {
    for (let j = i + 1; j < vesicles.length; j++) {
      const a = vesicles[i];
      const b = vesicles[j];

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
