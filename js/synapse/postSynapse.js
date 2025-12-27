console.log("🟡 postSynapse loaded");

// =====================================================
// POSTSYNAPTIC NEURON (RIGHT SIDE)
// =====================================================
function drawPostSynapse() {
  push();

  // ---------------------------------------------------
  // Position of RIGHT neuron (postsynaptic)
  // ---------------------------------------------------
  translate(+140, 75);

  // Face neuron toward cleft (LEFT)
  scale(+1, 1);

  // Draw neuron body
  drawtNeuronShape(+1);

  // ---------------------------------------------------
  // 🔑 PSD RECEPTORS — ON SYNAPTIC FACE
  // ---------------------------------------------------
  push();

  // Move receptors onto the flat synaptic face
  // (tuned for your T-geometry)
  translate(8, 0);

  // Draw receptors
  drawPSDReceptors();

  pop();

  pop();
}
