console.log("🟡 preSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// PRESYNAPTIC GEOMETRY — SINGLE SOURCE OF TRUTH
// =====================================================
//
// ✔ Owns ALL presynaptic spatial constants
// ✔ Owns vesicle stop / fusion plane
// ✔ Owns terminal radius + center
// ✔ Owns AP path calibration (visual only)
//
// ❌ No pools
// ❌ No motion
// ❌ No chemistry
//
// =====================================================


// =====================================================
// 🔴 AUTHORITATIVE PRESYNAPTIC CONSTANTS
// =====================================================
// (This fully replaces synapseConstants.js)
// =====================================================

// Terminal geometry
window.SYNAPSE_TERMINAL_CENTER_Y = 0;
window.SYNAPSE_TERMINAL_RADIUS   = 130;

// Vesicle fusion / stop plane (membrane-adjacent)
window.SYNAPSE_VESICLE_STOP_X    = 16;

// Reserve pool offset (deep cytosol direction)
window.SYNAPSE_BACK_OFFSET_X     = 60;

// Vesicle visuals
window.SYNAPSE_VESICLE_RADIUS   = 10;
window.SYNAPSE_VESICLE_STROKE   = 4;

// Pool capacity
window.SYNAPSE_MAX_VESICLES     = 7;

// Debug master toggle (KEEP TRUE while troubleshooting)
window.SHOW_SYNAPSE_DEBUG = true;


// =====================================================
// CONSOLE VERIFICATION (DO NOT REMOVE YET)
// =====================================================
console.log("▶ SYNAPSE_VESICLE_STOP_X =", window.SYNAPSE_VESICLE_STOP_X);
console.log("▶ SYNAPSE_VESICLE_RADIUS =", window.SYNAPSE_VESICLE_RADIUS);
console.log("▶ SYNAPSE_TERMINAL_RADIUS =", window.SYNAPSE_TERMINAL_RADIUS);


// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH (LOCAL GEOMETRY)
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
// 🔧 AP PATH CALIBRATION (VIEW ONLY)
// =====================================================
window.AP_PATH_SCALE = 6.0;

window.AP_PATH_OFFSET = {
  x: -120,
  y: 0
};

window.calibratePath = function (path) {
  return path.map(p => ({
    x: (p.x * window.AP_PATH_SCALE) + window.AP_PATH_OFFSET.x,
    y: (p.y * window.AP_PATH_SCALE) + window.AP_PATH_OFFSET.y
  }));
};


// =====================================================
// PRESYNAPTIC DRAW (GEOMETRY ONLY)
// =====================================================
window.drawPreSynapse = function () {

  push();

  // Presynaptic neuron faces cleft
  rotate(PI);

  // Ground-truth geometry
  drawTNeuronShape(1);

  // Debug: vesicle stop / fusion plane
  drawVesicleStopPlaneDebug();

  // Vesicles (draw-only)
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

  // Terminal AP
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
// 🔵 DEBUG: TRUE VESICLE STOP / FUSION PLANE
// =====================================================
window.DEBUG_PLANE_HEIGHT = 140;

window.drawVesicleStopPlaneDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const x = window.SYNAPSE_VESICLE_STOP_X;
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
