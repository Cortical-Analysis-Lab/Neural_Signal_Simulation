console.log("🟡 preSynapse loaded");

// =====================================================
// COLORS & GEOMETRY
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const CORNER_RADIUS = 80;

// =====================================================
// PRESYNAPTIC NEURON
// =====================================================
function drawPreSynapse() {
  push();
  drawTNeuronShape(-1);
  pop();
}
