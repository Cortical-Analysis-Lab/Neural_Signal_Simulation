console.log("🔬 SynapseView loaded — WORLD SPACE LOCKED (SYNAPSE-FRAMED)");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (WORLD SPACE)
// =====================================================
//
// ✔ Single authoritative coordinate system
// ✔ Inherits WORLD_FRAME from main.js
// ✔ Camera zoom from overview is IGNORED after fade
// ✔ Explicit synapse framing (microscopic scale)
// ✔ Vesicles drawn ONLY in preSynapse.js
//
// =====================================================


// =====================================================
// 🔑 SYNAPSE GEOMETRY SCALE (AUTHORITATIVE)
// =====================================================
const S = window.NEURON_GEOMETRY_SCALE ?? 1;


// =====================================================
// 🔑 SYNAPSE WORLD LAYOUT (AUTHORITATIVE)
// =====================================================
//
// These define the *true* synapse micro-environment.
// If geometry scale changes, spacing scales automatically.
//
const CLEFT_HALF_WIDTH = 140 * S;

const PRE_X    = -CLEFT_HALF_WIDTH;
const POST_X   =  CLEFT_HALF_WIDTH;
const NEURON_Y =  40 * S;


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
  // ❌ NO resetMatrix()
  // ❌ NO screen-relative translate
  // ✔ WORLD_FRAME already applied in main.js

  // ---------------------------------------------------
  // 🔒 OVERRIDE CAMERA POSITION *FOR SYNAPSE ONLY*
  // ---------------------------------------------------
  //
  // Overview camera zoomed into a bouton.
  // SynapseView must now reframe the microscopic scene.
  //
  translate(
    -window.synapseFocus.x,
    -window.synapseFocus.y
  );

  // ---------------------------------------------------
  // INPUT + ELECTRICAL
  // ---------------------------------------------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------------------------------------------
  // UPDATE ORDER (BIOLOGICAL AUTHORITY)
  // ---------------------------------------------------
  updateVesicleLoading?.();
  updateVesicleMotion?.();
  updateVesiclePools?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ===================================================
  // 🌿 ASTROCYTE (DRAW FIRST — CONTAINS TERMINALS)
  // ===================================================
  drawAstrocyteSynapse?.();

  // ===================================================
  // 🟡 PRESYNAPTIC TERMINAL
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  if (
    typeof calibratePath === "function" &&
    typeof updateTerminalAP === "function" &&
    window.PRESYNAPTIC_AP_PATH
  ) {
    updateTerminalAP(
      calibratePath(window.PRESYNAPTIC_AP_PATH)
    );
  }

  drawPreSynapse?.();
  drawSynapticBurst?.();
  pop();

  // ===================================================
  // 🔵 POSTSYNAPTIC TERMINAL
  // ===================================================
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
