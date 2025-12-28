console.log("🟡 preSynapse loaded");

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH (NEURON-LOCAL)
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
// TRANSFORM AP PATH → MATCH NEURON GEOMETRY
// =====================================================
function getPresynapticAPPath() {
  const DIR = -1;              // matches drawTNeuronShape(-1)
  const MEMBRANE_OFFSET = 0;   // adjust later if needed

  return PRESYNAPTIC_AP_PATH.map(p => ({
    x: p.x * DIR,
    y: p.y + MEMBRANE_OFFSET
  }));
}

// =====================================================
// PRESYNAPTIC NEURON (GEOMETRY + DEBUG AP DOTS)
// =====================================================
function drawPreSynapse() {
  push();

  // ---- Neuron geometry (already flipped internally)
  drawTNeuronShape(-1);

  // ---- AP debug dots (now correctly transformed)
  const apPath = getPresynapticAPPath();
  drawVoltageWave(apPath);

  pop();
}
