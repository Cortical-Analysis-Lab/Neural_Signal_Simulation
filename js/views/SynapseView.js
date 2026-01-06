console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (AUTHORITATIVE)
// =====================================================
//
// ⚠️ All vesicle physics must reference THIS FILE
// ⚠️ Coordinates are PRESYNAPTIC LOCAL SPACE
// ⚠️ drawPreSynapse() geometry is the ground truth
// ⚠️ ONE physics plane — no duplicates
//
// =====================================================


// =====================================================
// TERMINAL CAPSULE GEOMETRY
// =====================================================

// From neuronShape.js (DO NOT GUESS THESE)
window.SYNAPSE_BAR_THICK = 340;
window.SYNAPSE_BAR_HALF  = 140;

// Capsule center (presynaptic local space)
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
// DEBUG TOGGLE (GLOBAL)
// =====================================================

window.SHOW_SYNAPSE_DEBUG = true; // 🔴 TURN ON TO SEE OVERLAYS


// =====================================================
// DEBUG DRAW — PRESYNAPTIC LOCAL SPACE ONLY
// =====================================================
//
// ⚠️ NO resetMatrix()
// ⚠️ NO screen-space transforms
// ⚠️ Assumes caller already translated to presynapse
//
window.drawSynapseConstantDebug = function () {

  push();
  blendMode(BLEND);
  strokeWeight(2);
  textSize(12);
  textAlign(LEFT, CENTER);
  noFill();

  // --------------------------------------------------
  // TERMINAL CENTER
  // --------------------------------------------------
  stroke(0, 255, 255);
  fill(0, 255, 255);
  circle(
    window.SYNAPSE_TERMINAL_CENTER_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    14
  );
  text(
    "CENTER",
    window.SYNAPSE_TERMINAL_CENTER_X + 10,
    window.SYNAPSE_TERMINAL_CENTER_Y
  );

  // --------------------------------------------------
  // VESICLE STOP / DOCK / FUSION PLANE
  // --------------------------------------------------
  stroke(255, 0, 0);
  line(
    window.SYNAPSE_VESICLE_STOP_X,
    -300,
    window.SYNAPSE_VESICLE_STOP_X,
    300
  );
  fill(255, 0, 0);
  text(
    "VESICLE_STOP_X",
    window.SYNAPSE_VESICLE_STOP_X + 6,
    -20
  );

  // --------------------------------------------------
  // MEMBRANE VISUAL REFERENCE (NOT PHYSICS)
  // --------------------------------------------------
  stroke(0, 150, 255);
  fill(0, 150, 255);
  circle(
    window.SYNAPSE_MEMBRANE_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    10
  );
  text(
    "MEMBRANE_X (visual)",
    window.SYNAPSE_MEMBRANE_X + 10,
    window.SYNAPSE_TERMINAL_CENTER_Y + 18
  );

  // --------------------------------------------------
  // BACK OFFSET (RESERVE POOL ORIGIN)
  // --------------------------------------------------
  stroke(255, 200, 0);
  fill(255, 200, 0);
  circle(
    window.SYNAPSE_VESICLE_STOP_X + window.SYNAPSE_BACK_OFFSET_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    10
  );
  text(
    "BACK_OFFSET",
    window.SYNAPSE_VESICLE_STOP_X + window.SYNAPSE_BACK_OFFSET_X + 10,
    window.SYNAPSE_TERMINAL_CENTER_Y
  );

  pop();
};
