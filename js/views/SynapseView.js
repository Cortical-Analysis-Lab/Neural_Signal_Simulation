console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (WORLD SPACE)
// =====================================================
//
// ✔ Single coordinate space
// ✔ No flips
// ✔ No synapseConstants dependency
// ✔ Deterministic update → draw order
// ✔ Vesicles drawn ONLY in preSynapse.js
//
// =====================================================


// =====================================================
// SCREEN-SPACE LAYOUT (VIEW ONLY)
// =====================================================
const SYNAPSE_SCALE    = 1.45;
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// World anchors
const PRE_X    = -180;
const POST_X   = +180;
const NEURON_Y = 40;


// =====================================================
// USER INPUT — INTENT ONLY
// =====================================================
let spaceWasDown = false;

function handleSynapseInput() {
  const spaceDown = keyIsDown(32); // spacebar
  if (spaceDown && !spaceWasDown) {
    triggerTerminalAP?.();
  }
  spaceWasDown = spaceDown;
}


// =====================================================
// ENSURE VESICLE POOL EXISTS (ONE-TIME)
// =====================================================
function ensureVesiclePoolInitialized() {

  if (!Array.isArray(window.synapseVesicles)) {
    window.synapseVesicles = [];
    console.warn("🧪 synapseVesicles initialized");
  }

  const maxVes = window.SYNAPSE_MAX_VESICLES ?? 7;

  // Seed reserve pool ONLY ONCE
  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      window.requestNewEmptyVesicle?.();
    }
    console.log("🧪 reserve pool seeded:", window.synapseVesicles.length);
  }
}


// =====================================================
// MAIN VIEW ENTRY — CALLED FROM main.js
// =====================================================
function drawSynapseView() {

  push();
  resetMatrix();

  // ---------------- INPUT + ELECTRICAL ----------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------- UPDATE ORDER (AUTHORITATIVE) ------
  updateVesicleLoading?.();
  updateVesicleMotion?.();
  updateVesiclePools?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();

  // ---------------- SCREEN → WORLD --------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ---------------- ASTROCYTE -------------------------
  drawAstrocyteSynapse?.();

  // ---------------- PRESYNAPTIC TERMINAL --------------
  push();
  translate(PRE_X, NEURON_Y);

  // Terminal AP (visual + trigger)
  if (
    typeof calibratePath === "function" &&
    typeof updateTerminalAP === "function" &&
    window.PRESYNAPTIC_AP_PATH
  ) {
    updateTerminalAP(
      calibratePath(window.PRESYNAPTIC_AP_PATH)
    );
  }

  // ✅ PRESYNAPTIC GEOMETRY OWNERSHIP
  // (vesicles are drawn INSIDE this function)
  drawPreSynapse?.();
  drawSynapticBurst?.();

   pop();

  // ---------------- POSTSYNAPTIC TERMINAL --------------
  push();
  translate(POST_X, NEURON_Y);
  drawPostSynapse?.();
  pop();

  pop();

}


// =====================================================
// EXPORT
// =====================================================
window.drawSynapseView = drawSynapseView;
