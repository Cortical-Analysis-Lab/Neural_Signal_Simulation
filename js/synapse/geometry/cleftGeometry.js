console.log("🟥 cleftGeometry loaded — DEBUG ONLY (PHYSICS DISABLED)");

// =====================================================
// SYNAPTIC CLEFT GEOMETRY — VISUAL REFERENCE ONLY
// =====================================================
//
// ✔ Draws red cleft outline
// ✔ Synapse-local coordinates
// ✘ NO confinement
// ✘ NO projection
// ✘ NO physics influence
//
// 🔥 Temporary diagnostic mode
//
// =====================================================


// -----------------------------------------------------
// 🎛️ CLEFT POSITION & SIZE TUNING (ONLY EDIT THESE)
// -----------------------------------------------------

// Horizontal size
const CLEFT_HALF_WIDTH = 125;

// Vertical placement
const CLEFT_Y_CENTER   = 55;
const CLEFT_HEIGHT     = 255;

// Corner rounding
const CLEFT_RADIUS     = 28;


// -----------------------------------------------------
// DERIVED BOUNDS (DO NOT EDIT BELOW)
// -----------------------------------------------------
const CLEFT_LEFT   = -CLEFT_HALF_WIDTH;
const CLEFT_RIGHT  = +CLEFT_HALF_WIDTH;

const CLEFT_TOP    = CLEFT_Y_CENTER - CLEFT_HEIGHT / 2;
const CLEFT_BOTTOM = CLEFT_Y_CENTER + CLEFT_HEIGHT / 2;


// -----------------------------------------------------
// 🚫 PHYSICS DISABLED — PASS-THROUGH STUBS
// -----------------------------------------------------

// Everything is considered "inside"
window.isInsideSynapticCleft = function (x, y) {
  return true;
};

// No projection / correction
window.projectToSynapticCleft = function (x, y) {
  return { x, y };
};


// -----------------------------------------------------
// 🔴 DEBUG DRAW — VISUAL REFERENCE ONLY
// -----------------------------------------------------
window.drawSynapticCleftDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  stroke(255, 60, 60, 220);   // 🔴 debug red
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
