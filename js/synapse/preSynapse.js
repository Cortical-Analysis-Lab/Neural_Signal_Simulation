console.log("🟡 preSynapse loaded");

// =====================================================
// COLORS & GEOMETRY
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const CORNER_RADIUS = 80;

// =====================================================
// PRESYNAPTIC NEURON (GEOMETRY + AP GLOW)
// =====================================================
function drawPreSynapse() {
  push();

  // ---- Draw neuron geometry (pure)
  drawTNeuronShape(-1);

  // ---- Presynaptic action potential (membrane-bound)
  const membranePath = getTNeuronOutlinePath(-1);

  drawVoltageWave(membranePath, { side: +1 });
  drawVoltageWave(membranePath, { side: -1 });

  pop();
}
