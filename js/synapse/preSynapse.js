console.log("🟡 preSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// PRESYNAPTIC GEOMETRY — SINGLE SOURCE OF TRUTH
// =====================================================

// ---------------- AUTHORITATIVE CONSTANTS ----------------

window.SYNAPSE_TERMINAL_CENTER_Y = 0;
window.SYNAPSE_TERMINAL_RADIUS   = 130;

window.SYNAPSE_VESICLE_STOP_X   = 16;
window.SYNAPSE_BACK_OFFSET_X    = 60;

window.SYNAPSE_VESICLE_RADIUS   = 10;
window.SYNAPSE_VESICLE_STROKE   = 4;

window.SYNAPSE_MAX_VESICLES     = 7;

window.SHOW_SYNAPSE_DEBUG = true;

// ---------------- CONSOLE VERIFICATION ----------------

console.log("▶ SYNAPSE_VESICLE_STOP_X =", window.SYNAPSE_VESICLE_STOP_X);
console.log("▶ SYNAPSE_VESICLE_RADIUS =", window.SYNAPSE_VESICLE_RADIUS);
console.log("▶ SYNAPSE_TERMINAL_RADIUS =", window.SYNAPSE_TERMINAL_RADIUS);

// ---------------- AP PATH ----------------

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

window.AP_PATH_SCALE = 6.0;
window.AP_PATH_OFFSET = { x: -120, y: 0 };

window.calibratePath = function (path) {
  return path.map(p => ({
    x: p.x * window.AP_PATH_SCALE + window.AP_PATH_OFFSET.x,
    y: p.y * window.AP_PATH_SCALE + window.AP_PATH_OFFSET.y
  }));
};

// =====================================================
// PRESYNAPTIC DRAW (GEOMETRY ONLY)
// =====================================================

window.drawPreSynapse = function () {

  push();

  // ---------------------------------------------------
  // CANONICAL ORIENTATION
  // ---------------------------------------------------
  rotate(PI);

  // ---------------------------------------------------
  // GROUND-TRUTH GEOMETRY
  // ---------------------------------------------------
  drawTNeuronShape(1);

  drawVesicleStopPlaneDebug();

  // Vesicles (membranes + contents)
  drawSynapseVesicleGeometry?.();

  // 🔴 DEBUG: VESICLE CENTERS (CORRECT SPACE)
  if (
    window.SHOW_SYNAPSE_DEBUG &&
    typeof drawVesicleCenters === "function"
  ) {
    drawVesicleCenters();
  }

  // ---------------------------------------------------
  // TERMINAL AP (VISUAL ONLY)
  // ---------------------------------------------------
  const calibratedPath = calibratePath(window.PRESYNAPTIC_AP_PATH);
  drawTerminalAP?.(calibratedPath);

  if (window.apActive === true) {
    drawAPDebugDots(calibratedPath);
  }

  pop();
};

// =====================================================
// DEBUG: VESICLE STOP / FUSION PLANE
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
