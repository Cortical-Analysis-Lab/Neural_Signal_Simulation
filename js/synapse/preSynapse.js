console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH
// (LOCAL GEOMETRY SPACE — VIEW ONLY)
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
// 🔧 CALIBRATION CONSTANTS (VIEW ONLY)
// =====================================================

// Visual scale of AP path
const AP_PATH_SCALE = 6.0;

// Final world-space offset (after rotation)
const AP_PATH_OFFSET = {
  x: -120,   // ← shift LEFT toward astrocyte
  y: 0
};

// Debug height only
const DEBUG_PLANE_HEIGHT = 140;


// =====================================================
// PATH CALIBRATION (NO FLIPS)
// =====================================================
function calibratePath(path) {
  return path.map(p => ({
    x: (p.x * AP_PATH_SCALE) + AP_PATH_OFFSET.x,
    y: (p.y * AP_PATH_SCALE) + AP_PATH_OFFSET.y
  }));
}


// =====================================================
// PRESYNAPTIC NEURON
// GEOMETRY + VISUALS ONLY
// =====================================================
function drawPreSynapse() {
  push();

  // ---------------------------------------------------
  // 🔁 CANONICAL ORIENTATION FIX
  // ---------------------------------------------------
  //
  // Rotate presynaptic terminal to face postsynaptic side
  //
  rotate(PI);            // 180° rotation
  translate(0, 0);       // (explicit, readable)

  // ---------------------------------------------------
  // DRAW GEOMETRY
  // ---------------------------------------------------
  drawTNeuronShape(1);

  // ---------------------------------------------------
  // DEBUG: TRUE PHYSICS PLANE
  // ---------------------------------------------------
  drawVesicleStopPlaneDebug();

  // ---------------------------------------------------
  // VESICLES (DRAW ONLY)
  // ---------------------------------------------------
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

  // ---------------------------------------------------
  // TERMINAL AP (VISUAL ONLY)
  // ---------------------------------------------------
  const calibratedPath = calibratePath(PRESYNAPTIC_AP_PATH);

  if (typeof drawTerminalAP === "function") {
    drawTerminalAP(calibratedPath);
  }

  // Optional AP debug dots
  if (window.apActive === true) {
    drawAPDebugDots(calibratedPath);
  }

  pop();
}


// =====================================================
// 🔵 DEBUG: TRUE VESICLE STOP PLANE
// =====================================================
function drawVesicleStopPlaneDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const x = window.SYNAPSE_VESICLE_STOP_X ?? 0;

  push();
  stroke(80, 180, 255, 220);
  strokeWeight(2);
  noFill();

  line(x, -DEBUG_PLANE_HEIGHT, x, DEBUG_PLANE_HEIGHT);

  for (let y = -DEBUG_PLANE_HEIGHT; y <= DEBUG_PLANE_HEIGHT; y += 24) {
    fill(80, 180, 255, 140);
    noStroke();
    circle(x, y, 4);
  }

  pop();
}


// =====================================================
// DEBUG: AP PATH DOTS
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
