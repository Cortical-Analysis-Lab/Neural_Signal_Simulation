console.log("🧠 synapseConstants loaded");

// =====================================================
// SHARED SYNAPSE CONSTANTS (AUTHORITATIVE)
// =====================================================

// -----------------------------------------------------
// Geometry (must match drawTNeuronShape)
// -----------------------------------------------------

// Capsule dimensions (from neuronShape.js)
window.SYNAPSE_BAR_THICK = 340;
window.SYNAPSE_BAR_HALF  = 140;

// Terminal center
window.SYNAPSE_TERMINAL_CENTER_X = SYNAPSE_BAR_THICK / 2;
window.SYNAPSE_TERMINAL_CENTER_Y = 0;
window.SYNAPSE_TERMINAL_RADIUS   = SYNAPSE_BAR_HALF - 10;

// -----------------------------------------------------
// Membrane & docking geometry
// -----------------------------------------------------

// Logical membrane reference (do NOT dock to this)
window.SYNAPSE_MEMBRANE_X = 0;

// Visual docking plane (inside curved membrane face)
window.SYNAPSE_DOCK_X = 16;

// Back-loading offset (cytosolic pool)
window.SYNAPSE_BACK_OFFSET_X = 30;

// -----------------------------------------------------
// Vesicle visuals
// -----------------------------------------------------
window.SYNAPSE_VESICLE_RADIUS = 10;
window.SYNAPSE_VESICLE_STROKE = 4;

// Vesicle count
window.SYNAPSE_MAX_VESICLES = 10;

// =====================================================
// 🔵 DEBUG VISUALIZATION (OPTIONAL, SAFE)
// =====================================================
// Renders large blue dots at key geometric anchors
// Call drawSynapseConstantDebug() from SynapseView
// =====================================================

window.drawSynapseConstantDebug = function () {

  push();
  noStroke();
  blendMode(ADD);

  // -------------------------------
  // Terminal center
  // -------------------------------
  fill(80, 160, 255, 220);
  circle(
    SYNAPSE_TERMINAL_CENTER_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    24
  );

  // Label
  fill(120, 190, 255, 240);
  textSize(10);
  textAlign(LEFT, CENTER);
  text("CENTER", SYNAPSE_TERMINAL_CENTER_X + 14, SYNAPSE_TERMINAL_CENTER_Y);

  // -------------------------------
  // Docking plane
  // -------------------------------
  fill(40, 120, 255, 220);
  circle(
    SYNAPSE_DOCK_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    20
  );

  text("DOCK_X", SYNAPSE_DOCK_X + 10, SYNAPSE_TERMINAL_CENTER_Y - 12);

  // -------------------------------
  // Membrane reference (x = 0)
  // -------------------------------
  fill(0, 90, 200, 180);
  circle(
    SYNAPSE_MEMBRANE_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    16
  );

  text("MEMBRANE_X", SYNAPSE_MEMBRANE_X + 8, SYNAPSE_TERMINAL_CENTER_Y + 14);

  // -------------------------------
  // Back-loading zone
  // -------------------------------
  fill(100, 200, 255, 180);
  circle(
    SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X,
    SYNAPSE_TERMINAL_CENTER_Y,
    18
  );

  text(
    "BACK_OFFSET",
    SYNAPSE_TERMINAL_CENTER_X + SYNAPSE_BACK_OFFSET_X + 10,
    SYNAPSE_TERMINAL_CENTER_Y
  );

  blendMode(BLEND);
  pop();
};
