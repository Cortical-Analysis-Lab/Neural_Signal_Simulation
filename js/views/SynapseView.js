console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET + DESKTOP STABLE)
// =====================================================

const SYNAPSE_SCALE    = 1.45;
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

const PRE_X   = -180;
const POST_X  = +180;
const NEURON_Y = 40;


// =====================================================
// USER INPUT — SYNAPSE LOCAL ONLY
// =====================================================
// Spacebar fires exactly ONE terminal AP per press

let spaceWasDown = false;

function handleSynapseInput() {

  const spaceDown = keyIsDown(32); // spacebar

  if (spaceDown && !spaceWasDown) {

    if (typeof triggerTerminalAP === "function") {
      triggerTerminalAP();
    }

    if (typeof triggerVesicleReleaseFromAP === "function") {
      triggerVesicleReleaseFromAP();
    }
  }

  spaceWasDown = spaceDown;
}


// =====================================================
// ONE-TIME VESICLE POOL BOOTSTRAP
// =====================================================
function ensureVesiclePoolInitialized() {

  if (!Array.isArray(window.synapseVesicles)) {
    window.synapseVesicles = [];
  }

  const maxVes = window.SYNAPSE_MAX_VESICLES ?? 7;

  // Populate cytosolic reserve ONCE
  if (window.synapseVesicles.length === 0) {

    for (let i = 0; i < maxVes; i++) {
      if (typeof requestNewEmptyVesicle === "function") {
        requestNewEmptyVesicle();
      }
    }
  }
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
  // INPUT + TERMINAL PHYSIOLOGY
  // ---------------------------------------------------
  handleSynapseInput();

  if (typeof updateVoltageWave === "function") {
    updateVoltageWave();
  }

  // ---------------------------------------------------
  // 🔑 ENSURE VESICLE POOL EXISTS
  // ---------------------------------------------------
  ensureVesiclePoolInitialized();

  // ===================================================
  // PRESYNAPTIC LOCAL UPDATE ORDER (AUTHORITATIVE)
  // ===================================================

  // 1️⃣ Vesicle motion & collision authority
  if (typeof updateVesicleMotion === "function") {
    updateVesicleMotion();
  }

  // 2️⃣ Vesicle chemistry & loading
  if (typeof updateVesicleLoading === "function") {
    updateVesicleLoading();
  }

  // 3️⃣ Vesicle release (fusion)
  if (typeof updateVesicleRelease === "function") {
    updateVesicleRelease();
  }

  // 4️⃣ Vesicle recycling (endocytosis)
  if (typeof updateVesicleRecycling === "function") {
    updateVesicleRecycling();
  }

  // 5️⃣ Neurotransmitter diffusion
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
  // VISUAL-ONLY FLIP (PHYSICS ALREADY DONE)
  // ---------------------------------------------------
  scale(-1, 1);

  // Geometry (terminal membrane, shaft)
  if (typeof drawPreSynapse === "function") {
    drawPreSynapse();
  }

  // 🔵 VESICLE RESERVE DEBUG RECTANGLE (OPTIONAL)
  if (
    window.SHOW_VESICLE_RESERVE_DEBUG &&
    typeof drawVesicleReserveDebug === "function"
  ) {
    drawVesicleReserveDebug();
  }

  // Vesicles + priming particles + NT contents
  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

  // Neurotransmitter visuals (cleft-facing)
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
