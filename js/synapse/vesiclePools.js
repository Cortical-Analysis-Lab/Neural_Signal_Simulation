console.log("🧭 vesiclePools loaded");

import {
  SYNAPSE_VESICLE_STOP_X
} from "./synapseConstants.js";

// =====================================================
// VESICLE POOLS — SPATIAL OWNERSHIP (NOT MOTION)
// =====================================================
//
// Responsibilities:
// ✔ Reserve pool bounds
// ✔ Loaded pool bounds
// ✔ Pool confinement
// ✔ Reserve → Loaded transition
//
// Must NOT:
// ✖ Apply Brownian motion
// ✖ Integrate velocity
// ✖ Reference membrane or fusion planes
// ✖ Touch release states directly
//
// =====================================================


// -----------------------------------------------------
// POOL RECTANGLES (PRESYNAPTIC LOCAL SPACE)
// -----------------------------------------------------

const RESERVE_POOL = {
  xMin: -120,
  xMax: -40,
  yMin: -36,
  yMax:  36
};

const LOADED_POOL = {
  xMin: -40,
  xMax: SYNAPSE_VESICLE_STOP_X, // ← ONLY PLANE ALLOWED
  yMin: -26,
  yMax:  26
};


// -----------------------------------------------------
// Utility
// -----------------------------------------------------

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}


// -----------------------------------------------------
// Apply pool confinement
// -----------------------------------------------------

export function applyPoolConstraints(v) {

  const pool =
    v.state === "LOADED"
      ? LOADED_POOL
      : RESERVE_POOL;

  const oldX = v.x;
  const oldY = v.y;

  v.x = clamp(v.x, pool.xMin + v.radius, pool.xMax - v.radius);
  v.y = clamp(v.y, pool.yMin + v.radius, pool.yMax - v.radius);

  // Kill momentum ONLY if boundary was violated
  if (v.x !== oldX) v.vx *= 0.3;
  if (v.y !== oldY) v.vy *= 0.3;
}


// -----------------------------------------------------
// Reserve → Loaded transition
// -----------------------------------------------------

export function updatePoolState(v) {
  if (
    v.state === "RESERVE" &&
    v.releaseBias === true
  ) {
    v.state = "LOADED";
  }
}
