console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH
// (Captured in VIEW SPACE — needs calibration)
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
// 🔧 CALIBRATION CONSTANTS (THIS IS THE FIX)
// =====================================================

// Empirically determined: neuron geometry units / capture units
const AP_PATH_SCALE = 6.0;

// Align path to synaptic face (x = 0 in neuronShape)
const AP_PATH_OFFSET = {
  x: -170,   // ≈ barThick / 2
  y: 0
};

// =====================================================
// PATH TRANSFORMS (ORDER MATTERS)
// =====================================================
function calibratePath(path) {
  return path.map(p => ({
    x: (-p.x * AP_PATH_SCALE) + AP_PATH_OFFSET.x,
    y: ( p.y * AP_PATH_SCALE) + AP_PATH_OFFSET.y
  }));
}

// =====================================================
// PRESYNAPTIC NEURON (GEOMETRY + DEBUG DOTS)
// =====================================================
function drawPreSynapse() {
  push();

  // Presynaptic orientation
  scale(-1, 1);

  // Neuron geometry (canonical)
  drawTNeuronShape(1);

  // Calibrated AP path
  const calibratedPath = calibratePath(PRESYNAPTIC_AP_PATH);

  drawAPDebugDots(calibratedPath);

  pop();
}

// =====================================================
// DEBUG: FLASHING GREEN DOTS
// =====================================================
function drawAPDebugDots(path) {
  if (!window.apActive) return;

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
