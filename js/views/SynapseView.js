console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET+ STABLE)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// Relative screen anchor
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// =====================================================
// SYNAPTIC GEOMETRY CONTROL
// =====================================================

// Half-width of synaptic cleft (diagram units)
// Increase to widen the gap
const CLEFT_HALF_GAP = 18;

// Base neuron vertical alignment
const NEURON_Y = 75;

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {

  push();

  // ---------------------------------------------------
  // 🔑 RESET ALL WORLD / CAMERA TRANSFORMS
  // ---------------------------------------------------
  resetMatrix();

  // ---------------------------------------------------
  // SCREEN-SPACE ANCHOR
  // ---------------------------------------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // ---------------------------------------------------
  // DIAGRAM SCALE
  // ---------------------------------------------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ---------------------------------------------------
  // STRUCTURE (ORDER MATTERS)
  // ---------------------------------------------------

  // Astrocyte sits ABOVE cleft (unchanged)
  drawAstrocyteSynapse();

  // Presynaptic neuron (RIGHT → faces LEFT)
  push();
  translate(+140 + CLEFT_HALF_GAP, NEURON_Y);
  drawPreSynapse();
  pop();

  // Postsynaptic neuron (LEFT → faces RIGHT)
  push();
  translate(-140 - CLEFT_HALF_GAP, NEURON_Y);
  drawPostSynapse();
  pop();

  pop();
}
