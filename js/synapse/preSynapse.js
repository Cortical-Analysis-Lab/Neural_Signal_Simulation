console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH (NEURON-LOCAL, UNFLIPPED)
// Shaft → cap (user-selected)
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
// 🔑 MIRROR PATH TO MATCH PRESYNAPTIC FLIP
// =====================================================
function mirrorXPath(path) {
  return path.map(p => ({
    x: -p.x,
    y:  p.y
  }));
}

// =====================================================
// PRESYNAPTIC NEURON (GEOMETRY + AP DOT DEBUG)
// =====================================================
function drawPreSynapse() {
  push();

  // ---------------------------------------------------
  // APPLY PRESYNAPTIC ORIENTATION
  // ---------------------------------------------------
  scale(-1, 1);

  // ---- Draw neuron geometry (canonical)
  drawTNeuronShape(1);

  // ---- Draw AP debug dots (PATH MIRRORED TO MATCH SPACE)
  const mirroredPath = mirrorXPath(PRESYNAPTIC_AP_PATH);
  drawAPDebugDots(mirroredPath);

  pop();
}

// =====================================================
// DEBUG: FLASHING GREEN DOTS AT EACH AP COORDINATE
// =====================================================
function drawAPDebugDots(path) {
  if (!window.apActive) return;

  const pulse = 0.5 + 0.5 * sin(frameCount * 0.2);

  push();
  blendMode(ADD);
  noStroke();

  for (const p of path) {
    // Soft halo
    fill(80, 255, 120, 120 * pulse);
    circle(p.x, p.y, 18);

    // Bright core
    fill(160, 255, 190, 220 * pulse);
    circle(p.x, p.y, 6);
  }

  blendMode(BLEND);
  pop();
}
