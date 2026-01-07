console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH
// (LOCAL GEOMETRY SPACE — VIEW ONLY)
// =====================================================

window.PRESYNAPTIC_AP_PATH = [
  { x: 153.1, y:  4.7 },
  { x: 170.5, y: -5.1 },
  { x: 181.1, y: -20.5 },
  { x: 200.1, y: -22.9 },
  { x: 214.9, y: -16.9 },
  { x: 219.3, y:   3.7 },
  { x: 219.7, y:  30.1 },
  { x: 215.9, y:  49.7 },
  { x: 204.7, y:  57.5 },
  { x: 186.5, y:  57.9 },
  { x: 171.9, y:  43.1 },
  { x: 170.5, y:  29.1 },
  { x: 153.5, y:  28.7 }
];

// =====================================================
// 🔧 PRESYNAPTIC VIEW CALIBRATION (GLOBAL & SHARED)
// =====================================================
//
// These are authoritative for *presynaptic geometry*.
// They are NOT biological physics.
// They are NOT synapseConstants.
// =====================================================

// Visual scale of AP path
window.AP_PATH_SCALE = 6.0;

// Final world-space offset (aligns presynapse to astrocyte edge)
window.AP_PATH_OFFSET = {
  x: -120,   // ← shift LEFT toward astrocyte
  y: 0
};

// Debug plane height (visual only)
window.DEBUG_PLANE_HEIGHT = 140;


// =====================================================
// PATH CALIBRATION (NO FLIPS, WORLD-SPACE CONSISTENT)
// =====================================================
window.calibratePath = function (path) {
  return path.map(p => ({
    x: (p.x * window.AP_PATH_SCALE) + window.AP_PATH_OFFSET.x,
    y: (p.y * window.AP_PATH_SCALE) + window.AP_PATH_OFFSET.y
  }));
};


// =====================================================
// PRESYNAPTIC NEURON
// GEOMETRY + VISUALS ONLY
// =====================================================
window.drawPreSynapse = function () {

  push();

  // ---------------------------------------------------
  // 🔁 CANONICAL ORIENTATION FIX
  // ---------------------------------------------------
  //
  // Presynaptic neuron faces RIGHT by default.
  // Rotate 180° so it faces the synaptic cleft.
  //
  rotate(PI);

  // ---------------------------------------------------
  // DRAW GEOMETRY (GROUND TRUTH)
  // ---------------------------------------------------
  drawTNeuronShape(1);

  // ---------------------------------------------------
  // DEBUG: TRUE PHYSICS PLANE (READ-ONLY)
  // ---------------------------------------------------
  drawVesicleStopPlaneDebug();

  // ---------------------------------------------------
  // VESICLES (DRAW ONLY — NO OWNERSHIP)
  // ---------------------------------------------------
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

  // ---------------------------------------------------
  // TERMINAL AP (VISUAL ONLY)
  // ---------------------------------------------------
  const calibratedPath = calibratePath(window.PRESYNAPTIC_AP_PATH);

  if (typeof drawTerminalAP === "function") {
    drawTerminalAP(calibratedPath);
  }

  // Optional AP debug dots
  if (window.apActive === true) {
    drawAPDebugDots(calibratedPath);
  }

  pop();
};


// =====================================================
// 🔵 DEBUG: TRUE VESICLE STOP PLANE
// =====================================================
window.drawVesicleStopPlaneDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const x = window.SYNAPSE_VESICLE_STOP_X ?? 0;
  const H = window.DEBUG_PLANE_HEIGHT;

  push();
  stroke(80, 180, 255, 220);
  strokeWeight(2);
  noFill();

  line(x, -H, x, H);

  for (let y = -H; y <= H; y += 24) {
    fill(80, 180, 255, 140);
    noStroke();
    circle(x, y, 4);
  }

  pop();
};


// =====================================================
// DEBUG: AP PATH DOTS
// =====================================================
window.drawAPDebugDots = function (path) {

  const pulse = 0.5 + 0.5 * sin(frameCount * 0.2);

  push();
  blendMode(ADD);
  noStroke();

  for (const p of path) {
    fill(80, 255, 120, 120 * pulse);
    circle(p.x, p.y, 18);

    fill(160, 255, 190, 220 * pulse);
    circle(p.x, p.y, 6);
  }

  blendMode(BLEND);
  pop();
};
