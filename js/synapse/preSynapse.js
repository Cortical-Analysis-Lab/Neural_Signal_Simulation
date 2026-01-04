console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH
// (VIEW-SPACE ONLY — CALIBRATED TO GEOMETRY)
// =====================================================

const PRESYNAPTIC_AP_PATH = [
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
// 🔧 CALIBRATION CONSTANTS (AUTHORITATIVE, VIEW ONLY)
// =====================================================

// Global presynaptic scale (visual only)
const AP_PATH_SCALE = 6.0;

// Final translation into synapse-local view space
const AP_PATH_OFFSET = {
  x: -170,
  y: 0
};

// Debug height only (no physics meaning)
const DEBUG_PLANE_HEIGHT = 140;


// =====================================================
// PATH TRANSFORM
// ✔ SCALE → FLIP → OFFSET
// ✔ VIEW-SPACE ONLY
// =====================================================
function calibratePath(path) {
  return path.map(p => ({
    x: (-p.x * AP_PATH_SCALE) + AP_PATH_OFFSET.x,
    y: ( p.y * AP_PATH_SCALE) + AP_PATH_OFFSET.y
  }));
}


// =====================================================
// PRESYNAPTIC NEURON
// GEOMETRY + VISUALS ONLY
// =====================================================
function drawPreSynapse() {
  push();

  // Canonical presynaptic geometry
  drawTNeuronShape(1);

  // Debug: true vesicle stop plane (READ-ONLY)
  drawVesicleStopPlaneDebug();

  // Vesicles (DRAW ONLY)
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

  // Terminal AP (VISUAL ONLY)
  const calibratedPath = calibratePath(PRESYNAPTIC_AP_PATH);

  if (typeof drawTerminalAP === "function") {
    drawTerminalAP(calibratedPath);
  }

  // Optional debug: AP path dots
  if (window.apActive === true) {
    drawAPDebugDots(calibratedPath);
  }

  pop();
}


// =====================================================
// 🔵 DEBUG: TRUE VESICLE STOP PLANE (VISUAL ONLY)
// =====================================================
function drawVesicleStopPlaneDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  // EXACTLY matches physics — NO OFFSET
  const x = window.SYNAPSE_VESICLE_STOP_X ?? 0;

  push();
  stroke(80, 180, 255, 220);
  strokeWeight(2);
  noFill();

  line(x, -DEBUG_PLANE_HEIGHT, x, DEBUG_PLANE_HEIGHT);

  // Anchor dots
  for (let y = -DEBUG_PLANE_HEIGHT; y <= DEBUG_PLANE_HEIGHT; y += 24) {
    fill(80, 180, 255, 140);
    noStroke();
    circle(x, y, 4);
  }

  pop();
}


// =====================================================
// DEBUG: FLASHING GREEN AP DOTS
// =====================================================
function drawAPDebugDots(path) {

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
}
