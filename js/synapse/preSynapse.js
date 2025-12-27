console.log("🟡 preSynapse loaded");

// =====================================================
// COLORS & GEOMETRY
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const CORNER_RADIUS = 80;

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH (LOCKED)
// Shaft → cap (user-selected, directed)
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
// PRESYNAPTIC NEURON (GEOMETRY + BIDIRECTIONAL AP)
// =====================================================
function drawPreSynapse() {
  push();

  // ---- Draw neuron geometry (pure, unchanged)
  drawTNeuronShape(-1);

  // ---- Presynaptic action potential
  // One wave travels forward, one backward
  // Both fade out at midpoint (handled in voltageWave.js)
  drawVoltageWave(PRESYNAPTIC_AP_PATH, { side: +1 });
  drawVoltageWave(PRESYNAPTIC_AP_PATH, { side: -1 });

  pop();
}
