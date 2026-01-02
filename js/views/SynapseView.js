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

  // Rising edge detection
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
//
// ⚠️ THIS FILE:
// • Does NOT move vesicles
// • Does NOT enforce membrane constraints
// • Does NOT run chemistry
//
// It ONLY:
// • Orders subsystems
// • Applies visual transforms
// • Routes user input
// =====================================================
function drawSynapseView() {
  push();

  // ---------------------------------------------------
  // RESET CAMERA / WORLD SPACE
  // ---------------------------------------------------
  resetMatrix();

  // ---------------------------------------------------
  // LOCAL INPUT + PHYSIOLOGY (NO TRANSFORMS)
  // ---------------------------------------------------
  handleSynapseInput();

  // Terminal-local AP waveform
  if (typeof updateVoltageWave === "function") {
    updateVoltageWave();
  }

  // ===================================================
  // PRESYNAPTIC LOCAL UPDATE ORDER (AUTHORITATIVE)
  //
  // ⚠️ MUST REMAIN IN THIS ORDER
  // ⚠️ NO VISUAL TRANSFORMS YET
  // ===================================================

  // 1️⃣ Vesicle motion + collisions + membrane constraints
  if (typeof updateVesicleMotion === "function") {
    updateVesicleMotion();        // vesiclePool.js
  }

  // 2️⃣ Vesicle chemistry & state machine
  if (typeof updateVesicleLoading === "function") {
    updateVesicleLoading();       // vesicleLoading.js
  }

  // 3️⃣ Vesicle release (docking → fusion → merge)
  if (typeof updateVesicleRelease === "function") {
    updateVesicleRelease();
  }

  // 4️⃣ Vesicle recycling (endocytosis → reserve pool)
  if (typeof updateVesicleRecycling === "function") {
    updateVesicleRecycling();
  }

  // 5️⃣ Neurotransmitter diffusion (cleft)
  if (typeof updateSynapticBurst === "function") {
    updateSynapticBurst();
  }

  // ===================================================
  // SCREEN-RELATIVE ANCHOR
  // ===================================================
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
  if (typeof drawAstrocyteSynapse === "function") {
    drawAstrocyteSynapse();
  }

  // ===================================================
  // PRESYNAPTIC NEURON (LEFT)
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  // ---------------------------------------------------
  // VISUAL-ONLY COORDINATE FLIP
  // ⚠️ PHYSICS ALREADY RESOLVED UPSTREAM
  // ---------------------------------------------------
  scale(-1, 1);

  // Geometry (terminal membrane, dock, etc.)
  if (typeof drawPreSynapse === "function") {
    drawPreSynapse();
  }

  // Vesicles + priming particles + NT contents
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry(); // vesicleGeometry.js
  }

  // Neurotransmitter release visuals (cleft-facing)
  if (typeof drawSynapticBurst === "function") {
    drawSynapticBurst();
  }

  pop();

  // ===================================================
  // POSTSYNAPTIC NEURON (RIGHT)
  // ===================================================
  push();
  translate(POST_X, NEURON_Y);

  if (typeof drawPostSynapse === "function") {
    drawPostSynapse();
  }

  pop();

  pop();
}
