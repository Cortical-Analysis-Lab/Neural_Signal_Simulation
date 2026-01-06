console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (AUTHORITATIVE)
// =====================================================
//
// ⚠️ All vesicle physics must reference THIS FILE
// ⚠️ Coordinates are PRESYNAPTIC LOCAL SPACE
// ⚠️ drawTNeuronShape() is the geometric truth
// ⚠️ ONE physics plane — no duplicates
//
// =====================================================


// =====================================================
// TERMINAL CAPSULE GEOMETRY
// =====================================================

// From neuronShape.js (DO NOT GUESS THESE)
window.SYNAPSE_BAR_THICK = 340;
window.SYNAPSE_BAR_HALF  = 140;

// Capsule center (local presynaptic space)
window.SYNAPSE_TERMINAL_CENTER_X = window.SYNAPSE_BAR_THICK / 2;
window.SYNAPSE_TERMINAL_CENTER_Y = 0;

// Inner capsule radius (usable cytosol)
window.SYNAPSE_TERMINAL_RADIUS = window.SYNAPSE_BAR_HALF - 10;


// =====================================================
// MEMBRANE & DOCKING GEOMETRY (SINGLE AUTHORITY)
// =====================================================

// Curved membrane reference (VISUAL ONLY)
window.SYNAPSE_MEMBRANE_X = 0;

// 🔴 AUTHORITATIVE PHYSICS PLANE
window.SYNAPSE_VESICLE_STOP_X = 16;

// Backward-compatibility aliases
window.SYNAPSE_DOCK_X         = window.SYNAPSE_VESICLE_STOP_X;
window.SYNAPSE_FUSION_PLANE_X = window.SYNAPSE_VESICLE_STOP_X;


// =====================================================
// BACK-POOL (CYTOSOLIC RESERVE)
// =====================================================

window.SYNAPSE_BACK_OFFSET_X = 60;


// =====================================================
// VESICLE VISUALS
// =====================================================

window.SYNAPSE_VESICLE_RADIUS = 10;
window.SYNAPSE_VESICLE_STROKE = 4;


// =====================================================
// VESICLE POOL SIZE
// =====================================================

window.SYNAPSE_MAX_VESICLES = 7;


// =====================================================
// VESICLE LOADING PHYSIOLOGY
// =====================================================

window.SYNAPSE_LOAD_MIN_OFFSET = 10;
window.SYNAPSE_LOAD_MAX_OFFSET = 46;
window.SYNAPSE_VESICLE_Y_SPREAD = 0.9;


// =====================================================
// PROTON (H⁺) PRIMING
// =====================================================

window.SYNAPSE_H_SPEED = 0.42;
window.SYNAPSE_H_LIFE  = 260;


// =====================================================
// ATP PRIMING + HYDROLYSIS
// =====================================================

window.SYNAPSE_ATP_SPEED  = 0.38;
window.SYNAPSE_ATP_LIFE   = 320;
window.SYNAPSE_ATP_BOUNCE = 0.45;


// =====================================================
// NEUROTRANSMITTER LOADING
// =====================================================

window.SYNAPSE_NT_TARGET    = 18;
window.SYNAPSE_NT_PACK_RATE = 0.35;


// =====================================================
// DEBUG VISUALIZATION (READ-ONLY)
// =====================================================

window.SHOW_SYNAPSE_DEBUG = false;

window.drawSynapseConstantDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  textSize(10);
  textAlign(LEFT, CENTER);
  strokeWeight(1.5);
  noFill();

  const cx = window.SYNAPSE_TERMINAL_CENTER_X;
  const cy = window.SYNAPSE_TERMINAL_CENTER_Y;

  // ---------------------------------------------------
  // TERMINAL CYTOSOL RADIUS
  // ---------------------------------------------------
  stroke(80, 120, 255, 120);
  circle(cx, cy, window.SYNAPSE_TERMINAL_RADIUS * 2);
  noStroke();
  fill(120, 160, 255);
  text(
    `TERMINAL_RADIUS = ${window.SYNAPSE_TERMINAL_RADIUS}`,
    cx + 8,
    cy - window.SYNAPSE_TERMINAL_RADIUS + 12
  );

  // ---------------------------------------------------
  // TERMINAL CENTER
  // ---------------------------------------------------
  fill(80, 160, 255, 220);
  circle(cx, cy, 12);
  text("CENTER (0,0 local Y)", cx + 10, cy);

  // ---------------------------------------------------
  // AUTHORITATIVE VESICLE STOP / FUSION PLANE
  // ---------------------------------------------------
  stroke(255, 80, 80, 200);
  line(
    window.SYNAPSE_VESICLE_STOP_X,
    -260,
    window.SYNAPSE_VESICLE_STOP_X,
    260
  );
  noStroke();
  fill(255, 120, 120);
  text(
    `VESICLE_STOP_X = ${window.SYNAPSE_VESICLE_STOP_X}`,
    window.SYNAPSE_VESICLE_STOP_X + 6,
    -220
  );

  // ---------------------------------------------------
  // VISUAL MEMBRANE REFERENCE (NOT PHYSICS)
  // ---------------------------------------------------
  stroke(0, 140, 220, 160);
  line(
    window.SYNAPSE_MEMBRANE_X,
    -200,
    window.SYNAPSE_MEMBRANE_X,
    200
  );
  noStroke();
  fill(80, 160, 220);
  text(
    "MEMBRANE_X (visual only)",
    window.SYNAPSE_MEMBRANE_X + 6,
    180
  );

  // ---------------------------------------------------
  // BACK-POOL / RESERVE OFFSET ANCHOR
  // ---------------------------------------------------
  const backX = window.SYNAPSE_VESICLE_STOP_X + window.SYNAPSE_BACK_OFFSET_X;
  stroke(120, 220, 255, 180);
  line(backX, -120, backX, 120);
  noStroke();
  fill(160, 230, 255);
  text(
    `BACK_OFFSET_X = ${window.SYNAPSE_BACK_OFFSET_X}`,
    backX + 6,
    100
  );

  // ---------------------------------------------------
  // AXES ORIENTATION
  // ---------------------------------------------------
  stroke(200, 200, 200, 160);
  line(cx, cy, cx + 40, cy);      // +X
  line(cx, cy, cx, cy - 40);      // -Y
  noStroke();
  fill(220);
  text("+X (toward membrane)", cx + 42, cy);
  text("-Y", cx, cy - 44);

  pop();
};
