console.log("🟥 cleftGeometry loaded — DEBUG ONLY (PHYSICS DISABLED)");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — VISUAL REFERENCE ONLY
// =====================================================
//
// ✔ Draws red cleft outline
// ✔ Synapse-local coordinates (same space as NTs)
// ✘ NO confinement
// ✘ NO projection
// ✘ NO physics influence
//
// 🔥 TEMPORARY DIAGNOSTIC MODE
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT POSITION & SIZE TUNING (ONLY EDIT THESE)
// -----------------------------------------------------

// Horizontal half-width of cleft
const CLEFT_HALF_WIDTH = 125;

// Vertical placement (positive = down)
const CLEFT_Y_CENTER   = 55;

// Total height
const CLEFT_HEIGHT     = 255;

// Corner rounding radius
const CLEFT_RADIUS     = 28;


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT EDIT BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;

const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🚫 PHYSICS DISABLED — EXPLICIT PASS-THROUGH
// -----------------------------------------------------
//
// These stubs exist ONLY so NTmotion.js
// does not crash if it is still calling them.
//
// They MUST NOT influence motion.
//
window.isInsideSynapticCleft = function () {
  return true;
};

window.projectToSynapticCleft = function (x, y) {
  return { x, y };
};


// -----------------------------------------------------
// 🔴 DEBUG DRAW — VISUAL REFERENCE ONLY
// -----------------------------------------------------
//
// This red outline is:
// • NOT a constraint
// • NOT used by physics
// • PURELY visual
//
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();

  stroke(255, 60, 60, 220);   // 🔴 DEBUG RED
  strokeWeight(2);
  noFill();

  rect(
    CLEFT_LEFT,
    CLEFT_TOP,
    CLEFT_RIGHT - CLEFT_LEFT,
    CLEFT_BOTTOM - CLEFT_TOP,
    CLEFT_RADIUS
  );

  pop();
};
