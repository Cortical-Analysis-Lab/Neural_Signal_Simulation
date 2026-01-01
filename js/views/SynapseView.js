console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET + DESKTOP STABLE)
// =====================================================

// Visual scale of synapse geometry
const SYNAPSE_SCALE = 1.45;

// Screen anchor (fraction of canvas size)
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// Horizontal separation (synaptic cleft width)
const PRE_X  = -180;
const POST_X = +180;

// Vertical offset of neurons relative to astrocyte
const NEURON_Y = 40;

// =====================================================
// USER INPUT — SYNAPSE LOCAL ONLY
// =====================================================
// Spacebar fires exactly ONE terminal AP per press

let spaceWasDown = false;

function handleSynapseInput() {
  const spaceDown = keyIsDown(32); // Spacebar

  // Rising edge detection
  if (spaceDown && !spaceWasDown) {

    // Terminal AP visual + logic
    if (typeof triggerTerminalAP === "function") {
      triggerTerminalAP();
    }

    // Vesicle release coupling
    if (typeof triggerVesicleReleaseFromAP === "function") {
      triggerVesicleReleaseFromAP();
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
  // RESET CAMERA / WORLD SPACE
  // ---------------------------------------------------
  resetMatrix();

  // ---------------------------------------------------
  // LOCAL INPUT + PHYSIOLOGY
  // ---------------------------------------------------
  handleSynapseInput();

  // Presynaptic AP waveform (terminal-local)
  if (typeof updateVoltageWave === "function") {
    updateVoltageWave();
  }

  // ---------------------------------------------------
  // VESICLE LIFECYCLE (STRICT ORDER)
// ---------------------------------------------------
  if (typeof updateSynapseVesicles === "function") {
    updateSynapseVesicles();     // loading / priming
  }

  if (typeof updateVesicleRelease === "function") {
    updateVesicleRelease();      // docking / fusion
  }

  if (typeof updateVesicleRecycling === "function") {
    updateVesicleRecycling();    // endocytosis / return
  }

  // ---------------------------------------------------
  // SCREEN-RELATIVE ANCHOR
  // ---------------------------------------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // ---------------------------------------------------
  // APPLY VISUAL SCALE (ONCE)
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
  drawPreSynapse();              // geometry + vesicle draw
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
