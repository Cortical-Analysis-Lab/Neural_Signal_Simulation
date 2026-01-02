console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (AUTHORITATIVE)
// =====================================================
//
// ⚠️ All vesicle physics must reference THIS FILE
// ⚠️ Coordinates are PRESYNAPTIC LOCAL SPACE
// ⚠️ drawTNeuronShape() is the geometric truth
// ⚠️ No file should invent its own membrane planes
// =====================================================


// =====================================================
// TERMINAL CAPSULE GEOMETRY
// =====================================================

// From neuronShape.js (DO NOT GUESS THESE)
window.SYNAPSE_BAR_THICK = 340;
window.SYNAPSE_BAR_HALF  = 140;

// Capsule center (local presynaptic space)
window.SYNAPSE_TERMINAL_CENTER_X = SYNAPSE_BAR_THICK / 2;
window.SYNAPSE_TERMINAL_CENTER_Y = 0;

// Inner capsule radius (usable cytosol)
window.SYNAPSE_TERMINAL_RADIUS = SYNAPSE_BAR_HALF - 10;


// =====================================================
// MEMBRANE & DOCKING GEOMETRY
// =====================================================

// Logical membrane reference (curved surface origin)
//
// ✔ Used for geometry & normals ONLY
// ❌ Vesicles must NEVER snap or clamp here
//
window.SYNAPSE_MEMBRANE_X = 0;

// Visual docking plane (flat approximation inside membrane)
//
// ✔ ALL vesicle fusion targets snap here
// ✔ Neurotransmitter release originates here
//
window.SYNAPSE_DOCK_X = 16;

// Authoritative vesicle stopping plane
//
// ✔ Vesicles may approach but never cross this
// ✔ Used by loading + recycling constraints
// ✔ Release code is allowed to override this
//
window.SYNAPSE_VESICLE_STOP_X = window.SYNAPSE_DOCK_X + 2;


// =====================================================
// BACK-POOL (CYTOSOLIC RESERVE)
// =====================================================

// Offset from center where unloaded vesicles live
window.SYNAPSE_BACK_OFFSET_X = 10;


// =====================================================
// VESICLE VISUALS
// =====================================================

window.SYNAPSE_VESICLE_RADIUS = 10;
window.SYNAPSE_VESICLE_STROKE = 4;


// =====================================================
// VESICLE POOL SIZE
// =====================================================

window.SYNAPSE_MAX_VESICLES = 10;


// =====================================================
// DEBUG VISUALIZATION (OPTIONAL, SAFE)
// =====================================================
//
// 🔵 Draws geometry anchors:
// • Terminal center
// • Docking plane
// • Membrane reference
// • Vesicle stop plane
// • Back-loading pool
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
    SYNAPSE_TERMINAL_CENTER_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    26
  );
  fill(120, 190, 255);
  text(
    "CENTER",
    SYNAPSE_TERMINAL_CENTER_X + 16,
    SYNAPSE_TERMINAL_CENTER_Y
  );

  // ---------------------------------------------
  // DOCKING PLANE (FUSION TARGET)
  // ---------------------------------------------
  fill(40, 120, 255, 220);
  circle(
    SYNAPSE_DOCK_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    22
  );
  fill(100, 180, 255);
  text(
    "DOCK_X",
    SYNAPSE_DOCK_X + 12,
    SYNAPSE_TERMINAL_CENTER_Y - 12
  );

  // ---------------------------------------------
  // VESICLE STOP PLANE
  // ---------------------------------------------
  fill(60, 200, 180, 220);
  circle(
    SYNAPSE_VESICLE_STOP_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    20
  );
  fill(140, 240, 220);
  text(
    "VESICLE_STOP_X",
    SYNAPSE_VESICLE_STOP_X + 12,
    SYNAPSE_TERMINAL_CENTER_Y + 12
  );

  // ---------------------------------------------
  // MEMBRANE REFERENCE
  // ---------------------------------------------
  fill(0, 90, 200, 160);
  circle(
    SYNAPSE_MEMBRANE_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    16
  );
  fill(80, 140, 220);
  text(
    "MEMBRANE_X",
    SYNAPSE_MEMBRANE_X + 10,
    SYNAPSE_TERMINAL_CENTER_Y + 26
  );

  // ---------------------------------------------
  // BACK-LOADING ZONE
  // ---------------------------------------------
  fill(100, 200, 255, 180);
  circle(
    SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    20
  );
  fill(140, 220, 255);
  text(
    "BACK_OFFSET",
    SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X + 12,
    SYNAPSE_TERMINAL_CENTER_Y
  );

  blendMode(BLEND);
  pop();
};
