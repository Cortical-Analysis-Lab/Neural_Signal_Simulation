console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET+ STABLE)
// =====================================================
const SYNAPSE_SCALE = 1;

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

  // -----------------------------------------------
  // RESET CAMERA / WORLD
  // -----------------------------------------------
  resetMatrix();

  // -----------------------------------------------
  // SCREEN-SPACE ANCHOR
  // -----------------------------------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // -----------------------------------------------
  // DIAGRAM SCALE
  // -----------------------------------------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // -----------------------------------------------
  // ASTROCYTE (UNCHANGED, ABOVE CLEFT)
  // -----------------------------------------------
  drawAstrocyteSynapse();

  // -----------------------------------------------
  // PRESYNAPTIC NEURON (LEFT)
  // -----------------------------------------------
  push();
  translate(-140 - HALF_GAP, NEURON_Y);
  drawPreSynapse();
  pop();

  // -----------------------------------------------
  // POSTSYNAPTIC NEURON (RIGHT)
  // -----------------------------------------------
  push();
  translate(+140 + HALF_GAP, NEURON_Y);
  drawPostSynapse();
  pop();

  pop();
}
