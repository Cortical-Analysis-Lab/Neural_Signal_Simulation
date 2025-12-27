console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET+ STABLE)
// =====================================================
const SYNAPSE_SCALE = 1.45;

// Fixed screen anchor (does not drift with resolution)
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// =====================================================
// SYNAPTIC GEOMETRY
// =====================================================
const CLEFT_GAP = 60;          // total synaptic cleft width
const HALF_GAP  = CLEFT_GAP / 2;

const NEURON_Y = 75;

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {
  push();

  // 🔒 Reset camera/world transforms
  resetMatrix();

  // Anchor synapse consistently on screen
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // Visual scale
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ==============================
  // ASTROCYTE (fixed, above cleft)
  // ==============================
  drawAstrocyteSynapse();

  // ==============================
  // PRESYNAPTIC NEURON (LEFT)
  // ==============================
  push();
  translate(PRE_X, NEURON_Y);
  drawPreSynapse();
  pop();

  // ==============================
  // POSTSYNAPTIC NEURON (RIGHT)
  // ==============================
  push();
  translate(POST_X, NEURON_Y);
  drawPostSynapse();
  pop();

  pop();
}
