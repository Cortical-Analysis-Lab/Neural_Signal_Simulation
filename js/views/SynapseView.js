console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET + DESKTOP STABLE)
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
const NEURON_Y = 40;

// =====================================================
// USER INPUT — SYNAPSE LOCAL ONLY
// =====================================================
// Spacebar fires exactly ONE terminal AP per press

let spaceWasDown = false;

function handleSynapseInput() {

  const spaceDown = keyIsDown(32); // Spacebar

  // Rising edge: UP → DOWN
  if (spaceDown && !spaceWasDown) {

    // Terminal AP (visual + timing)
    if (typeof triggerTerminalAP === "function") {
      triggerTerminalAP();
    }

    // Vesicle release coupling (event-driven)
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
  // LOCAL INPUT + PHYSIOLOGY (NO TRANSFORMS YET)
  // ---------------------------------------------------
  handleSynapseInput();

  // Terminal-local AP waveform
  if (typeof updateVoltageWave === "function") {
    updateVoltageWave();
  }

  // ---------------------------------------------------
  // VESICLE LIFECYCLE — AUTHORITATIVE ORDER
  // (ALL IN PRESYNAPTIC LOCAL SPACE)
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
  // APPLY VISUAL SCALE (ONCE, AFTER UPDATES)
  // ---------------------------------------------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ---------------------------------------------------
  // ASTROCYTE (FIXED ABOVE CLEFT)
  // ---------------------------------------------------
  if (typeof drawAstrocyteSynapse === "function") {
    drawAstrocyteSynapse();
  }

  // ---------------------------------------------------
  // PRESYNAPTIC NEURON (LEFT)
  // ---------------------------------------------------
  push();
  translate(PRE_X, NEURON_Y);

  // ✅ CRITICAL FIX:
  // Flip ENTIRE presynaptic system (geometry + vesicles + APs)
  scale(-1, 1);

  // Geometry + vesicle drawing + terminal AP visuals
  if (typeof drawPreSynapse === "function") {
    drawPreSynapse();
  }

  // 🔵 OPTIONAL DEBUG: synapseConstants geometry overlay
  if (typeof drawSynapseConstantDebug === "function") {
    drawSynapseConstantDebug();
  }

  pop();

  // ---------------------------------------------------
  // POSTSYNAPTIC NEURON (RIGHT)
  // ---------------------------------------------------
  push();
  translate(POST_X, NEURON_Y);

  if (typeof drawPostSynapse === "function") {
    drawPostSynapse();
  }

  pop();

  pop();
}
