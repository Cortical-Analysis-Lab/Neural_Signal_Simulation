console.log("🟡 postSynapse loaded");

// =====================================================
// POSTSYNAPTIC NEURON
// Geometry ONLY — no positioning logic here
// =====================================================
function drawPostSynapse() {
  push();

  // Face neuron toward synaptic cleft (LEFT)
  // (SynapseView places this on the RIGHT side)
  scale(+1, 1);

  // Draw neuron body
  drawNeuronShape(+1);

  // ==================================================
  // PSD RECEPTORS — EMBEDDED IN SYNAPTIC FACE
  // ==================================================
  push();

  // Small inset onto flat synaptic membrane
  // (tuned to your T-geometry)
  translate(8, 0);

  drawPSDReceptors();

  pop();

  pop();
}
