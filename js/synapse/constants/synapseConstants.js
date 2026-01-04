console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (AUTHORITATIVE)
// =====================================================
//
// ⚠️ All vesicle physics must reference THIS FILE
// ⚠️ Coordinates are PRESYNAPTIC LOCAL SPACE
// ⚠️ drawTNeuronShape() is the geometric truth
// ⚠️ ONE physics membrane plane — no duplicates
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
// MEMBRANE & FUSION GEOMETRY (SINGLE AUTHORITY)
// =====================================================

// Curved membrane reference
//
// ✔ Geometry, shading, normals ONLY
// ❌ Never used for physics or clamping
//
window.SYNAPSE_MEMBRANE_X = 0;

// 🔴 AUTHORITATIVE PHYSICS PLANE
//
// ✔ Vesicles dock here
// ✔ Fusion initiates here
// ✔ Pool confinement stops here
// ✔ Neurotransmitter release originates here
// ✔ Endocytosis buds originate here
//
window.SYNAPSE_FUSION_PLANE_X = 16;


// =====================================================
// BACK-POOL (CYTOSOLIC RESERVE)
// =====================================================

// Offset INTO cytosol from fusion plane
// (used to build reserve + loaded zones)
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
// VESICLE LOADING PHYSIOLOGY (AUTHORITATIVE)
// =====================================================
//
// All loading behavior, timing, and spatial tuning
// MUST be adjusted here — nowhere else.
//

// Forward cytosolic loading band (relative to fusion plane)
window.SYNAPSE_LOAD_MIN_OFFSET = 10;
window.SYNAPSE_LOAD_MAX_OFFSET = 46;

// Vertical dispersion during spawning
window.SYNAPSE_VESICLE_Y_SPREAD = 0.9;


// =====================================================
// PROTON (H⁺) PRIMING DYNAMICS
// =====================================================

window.SYNAPSE_H_SPEED = 0.42;
window.SYNAPSE_H_LIFE  = 260;


// =====================================================
// ATP PRIMING + HYDROLYSIS DYNAMICS
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
// DEBUG VISUALIZATION (OPTIONAL, SAFE)
// =====================================================
//
// 🔵 Draws geometry anchors:
// • Terminal center
// • Fusion plane (ONLY real one)
// • Membrane reference (visual)
// • Back-pool reference
//
// ❗ OFF BY DEFAULT
// Toggle at runtime:
//   SHOW_SYNAPSE_DEBUG = true;
// =====================================================

window.SHOW_SYNAPSE_DEBUG = false;

window.drawSynapseConstantDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  noStroke();
  blendMode(ADD);
  textSize(10);
  textAlign(LEFT, CENTER);

  // ---------------------------------------------
  // TERMINAL CENTER
  // ---------------------------------------------
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

  // ---------------------------------------------
  // FUSION PLANE (AUTHORITATIVE)
  // ---------------------------------------------
  fill(40, 160, 255, 220);
  rect(
    window.SYNAPSE_FUSION_PLANE_X - 1,
    -240,
    2,
    480
  );
  fill(120, 200, 255);
  text(
    "FUSION_PLANE_X",
    window.SYNAPSE_FUSION_PLANE_X + 6,
    -12
  );

  // ---------------------------------------------
  // MEMBRANE REFERENCE (VISUAL ONLY)
  // ---------------------------------------------
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

  // ---------------------------------------------
  // BACK-POOL REFERENCE
  // ---------------------------------------------
  fill(100, 200, 255, 180);
  circle(
    window.SYNAPSE_FUSION_PLANE_X + window.SYNAPSE_BACK_OFFSET_X,
    window.SYNAPSE_TERMINAL_CENTER_Y,
    20
  );
  fill(140, 220, 255);
  text(
    "BACK_OFFSET",
    window.SYNAPSE_FUSION_PLANE_X + window.SYNAPSE_BACK_OFFSET_X + 12,
    window.SYNAPSE_TERMINAL_CENTER_Y
  );

  blendMode(BLEND);
  pop();
};
