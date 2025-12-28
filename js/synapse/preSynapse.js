console.log("🟡 preSynapse loaded");

// =====================================================
// COLORS & GEOMETRY
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];

// =====================================================
// PRESYNAPTIC AP CONDUCTION PATH (LOCAL, UNFLIPPED)
// Shaft → cap (user-selected)
// =====================================================
const PRESYNAPTIC_AP_PATH_RAW = [
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
// MIRROR PATH TO MATCH drawTNeuronShape(-1)
// =====================================================
function mirrorXPath(path) {
  return path.map(p => ({ x: -p.x, y: p.y }));
}

const PRESYNAPTIC_AP_PATH = mirrorXPath(PRESYNAPTIC_AP_PATH_RAW);

// =====================================================
// PRESYNAPTIC NEURON (GEOMETRY + AP)
// =====================================================
function drawPreSynapse() {
  push();

  // ---- Geometry (mirrored)
  drawTNeuronShape(-1);

  // ---- Action potential (uses mirrored path)
  drawVoltageWave(PRESYNAPTIC_AP_PATH, { side: +1 });
  drawVoltageWave(PRESYNAPTIC_AP_PATH, { side: -1 });

  pop();
}
