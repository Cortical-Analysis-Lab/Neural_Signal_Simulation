console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET+ STABLE)
// =====================================================

// Visual scale of synapse geometry
const SYNAPSE_SCALE = 1.45;

// Screen anchor (fraction of canvas size)
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// Horizontal separation (controls synaptic cleft width)
const PRE_X  = -180;
const POST_X = +180;

// Vertical offset of neurons relative to astrocyte
// ↓ decrease this to move neurons UP
const NEURON_Y = 40;

// =====================================================
// SYNAPSE VIEW — USER INPUT (LOCAL ONLY)
// =====================================================
// Spacebar fires ONE terminal AP per press

let spaceWasDown = false;

function handleSynapseInput() {
  const spaceDown = keyIsDown(32); // Spacebar

  // Rising edge: UP → DOWN
  if (spaceDown && !spaceWasDown) {
    if (typeof triggerTerminalAP === "function") {
      triggerTerminalAP();
    }
  }

  spaceWasDown = spaceDown;
}

// =====================================================
// MAIN VIEW — ORCHESTRATOR ONLY
// =====================================================
function drawSynapseView() {
  push();

  // ---------------------------------------------------
  // RESET ALL CAMERA / WORLD TRANSFORMS
  // ---------------------------------------------------
  resetMatrix();

  // ---------------------------------------------------
  // ⚡ SYNAPSE-LOCAL INPUT + PHYSIOLOGY
  // (APs only exist meaningfully here)
  // ---------------------------------------------------
  handleSynapseInput();

  if (typeof updateVoltageWave === "function") {
    updateVoltageWave();
  }

  // ---------------------------------------------------
  // SCREEN-RELATIVE ANCHOR
  // (stable across tablet & desktop sizes)
  // ---------------------------------------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // ---------------------------------------------------
  // VISUAL SCALE (APPLIED ONCE)
  // ---------------------------------------------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ---------------------------------------------------
  // ASTROCYTE (FIXED ABOVE CLEFT)
  // ---------------------------------------------------
  drawAstrocyteSynapse();

  // ---------------------------------------------------
  // PRESYNAPTIC NEURON (LEFT)
  // ---------------------------------------------------
  push();
  translate(PRE_X, NEURON_Y);
  drawPreSynapse();
  pop();

  // ---------------------------------------------------
  // POSTSYNAPTIC NEURON (RIGHT)
  // ---------------------------------------------------
  push();
  translate(POST_X, NEURON_Y);
  drawPostSynapse();
  pop();

  pop();
}
