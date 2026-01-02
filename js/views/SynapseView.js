console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (TABLET + DESKTOP STABLE)
// =====================================================

const SYNAPSE_SCALE    = 1.45;
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

const PRE_X  = -180;
const POST_X = +180;
const NEURON_Y = 40;


// =====================================================
// USER INPUT — SYNAPSE LOCAL ONLY
// =====================================================

let spaceWasDown = false;

function handleSynapseInput() {

  const spaceDown = keyIsDown(32);

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
  // 🔑 CRITICAL: ENSURE VESICLES EXIST
  // ---------------------------------------------------
  ensureVesiclePoolInitialized();

  // ===================================================
  // PRESYNAPTIC LOCAL UPDATE ORDER (AUTHORITATIVE)
  // ===================================================

  // 1️⃣ Vesicle spatial authority
  if (typeof updateVesicleMotion === "function") {
    updateVesicleMotion();
  }

  // 2️⃣ Vesicle chemistry & loading
  if (typeof updateVesicleLoading === "function") {
    updateVesicleLoading();
  }

  // 3️⃣ Vesicle release
  if (typeof updateVesicleRelease === "function") {
    updateVesicleRelease();
  }

  // 4️⃣ Vesicle recycling
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
  // ASTROCYTE
  // ---------------------------------------------------
  if (typeof drawAstrocyteSynapse === "function") {
    drawAstrocyteSynapse();
  }

  // ===================================================
  // PRESYNAPTIC NEURON (LEFT)
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);
  scale(-1, 1); // visual-only flip

  if (typeof drawPreSynapse === "function") {
    drawPreSynapse();
  }

  if (typeof drawSynapseVesicleGeometry === "function") {
    drawSynapseVesicleGeometry();
  }

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
