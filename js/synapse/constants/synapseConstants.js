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
//
// ✔ Vesicles stop here
// ✔ Docking occurs here
// ✔ Fusion initiates here
// ✔ Pool confinement stops here
// ✔ NT release originates here
// ✔ Endocytosis buds originate here
//
window.SYNAPSE_VESICLE_STOP_X = 16;


// -----------------------------------------------------
// 🔁 BACKWARD-COMPATIBILITY ALIASES (CRITICAL)
// -----------------------------------------------------
// These prevent silent failures in older subsystems
//
window.SYNAPSE_DOCK_X         = window.SYNAPSE_VESICLE_STOP_X;
window.SYNAPSE_FUSION_PLANE_X = window.SYNAPSE_VESICLE_STOP_X;


// =====================================================
// BACK-POOL (CYTOSOLIC RESERVE)
// =====================================================

// Offset INTO cytosol from vesicle stop plane
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
//
// Toggle at runtime:
//   SHOW_SYNAPSE_DEBUG = true;
//
window.SHOW_SYNAPSE_DEBUG = false;

window.drawSynapseConstantDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  noStroke();
  blendMode(ADD);
  textSize(10);
  textAlign(LEFT, CENTER);

  // TERMINAL CENTER
  fill(80, 160, 255, 220);
  circle(
    window.SYNAPSE_TERMINAL_CENTER_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    26
  );
  fill(120, 190, 255);
  text(
    "CENTER",
    window.SYNAPSE_TERMINAL_CENTER_X + 16,
    window.SYNAPSE_TERMINAL_CENTER_Y
  );

  // VESICLE STOP / FUSION PLANE (ONLY REAL ONE)
  fill(40, 160, 255, 220);
  rect(
    window.SYNAPSE_VESICLE_STOP_X - 1,
    -240,
    2,
    480
  );
  fill(120, 200, 255);
  text(
    "VESICLE_STOP_X",
    window.SYNAPSE_VESICLE_STOP_X + 6,
    -12
  );

  // MEMBRANE REFERENCE (VISUAL ONLY)
  fill(0, 90, 200, 160);
  circle(
    window.SYNAPSE_MEMBRANE_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    16
  );
  fill(80, 140, 220);
  text(
    "MEMBRANE_X (visual)",
    window.SYNAPSE_MEMBRANE_X + 10,
    window.SYNAPSE_TERMINAL_CENTER_Y + 26
  );

  // BACK-POOL REFERENCE
  fill(100, 200, 255, 180);
  circle(
    window.SYNAPSE_VESICLE_STOP_X + window.SYNAPSE_BACK_OFFSET_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    20
  );
  fill(140, 220, 255);
  text(
    "BACK_OFFSET",
    window.SYNAPSE_VESICLE_STOP_X + window.SYNAPSE_BACK_OFFSET_X + 12,
    window.SYNAPSE_TERMINAL_CENTER_Y
  );

  blendMode(BLEND);
  pop();
};
