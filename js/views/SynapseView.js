console.log("🔬 SynapseView loaded — WORLD SPACE LOCKED");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (WORLD SPACE)
// =====================================================
//
// ✔ Single authoritative coordinate system
// ✔ Inherits WORLD_FRAME + camera from main.js
// ✔ NO resetMatrix()
// ✔ NO screen-relative layout
// ✔ Deterministic update → draw order
// ✔ Vesicles drawn ONLY in preSynapse.js
//
// =====================================================


// =====================================================
// WORLD-SPACE LAYOUT (AUTHORITATIVE)
// =====================================================
//
// These are REAL WORLD COORDINATES.
// Resize window → NOTHING MOVES.
//
const PRE_X    = -140;
const POST_X   = +140;
const NEURON_Y =   40;


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
  // ❌ NO resetMatrix()
  // ❌ NO translate(width/height)
  // ❌ NO scale()
  //
  // ✔ camera + WORLD_FRAME already applied in main.js

  // ---------------------------------------------------
  // INPUT + ELECTRICAL (WORLD-RELATIVE)
  // ---------------------------------------------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------------------------------------------
  // UPDATE ORDER (AUTHORITATIVE, BIOLOGICAL)
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
  // 🌿 ASTROCYTE (WORLD SPACE)
  // ===================================================
  // Draw FIRST so terminals sit inside it
  drawAstrocyteSynapse?.();

  // ===================================================
  // 🟡 PRESYNAPTIC TERMINAL
  // ===================================================
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

  // 🔑 PRESYNAPTIC GEOMETRY OWNERSHIP
  // Vesicles + fusion + recycling live here
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
