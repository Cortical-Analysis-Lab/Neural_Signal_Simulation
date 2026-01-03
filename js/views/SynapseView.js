console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT
// =====================================================

const SYNAPSE_SCALE    = 1.45;
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

const PRE_X    = -180;
const POST_X   = +180;
const NEURON_Y = 40;


// =====================================================
// USER INPUT — SYNAPSE LOCAL ONLY
// =====================================================

let spaceWasDown = false;

function handleSynapseInput() {

  const spaceDown = keyIsDown(32); // spacebar

  if (spaceDown && !spaceWasDown) {
    triggerTerminalAP?.();
    triggerVesicleReleaseFromAP?.();
  }

  spaceWasDown = spaceDown;
}


// =====================================================
// ENSURE VESICLE POOL EXISTS (ONCE)
// =====================================================

function ensureVesiclePoolInitialized() {

  if (!Array.isArray(window.synapseVesicles)) {
    window.synapseVesicles = [];
  }

  const maxVes = window.SYNAPSE_MAX_VESICLES ?? 7;

  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      requestNewEmptyVesicle?.();
    }
  }
}


// =====================================================
// MAIN VIEW
// =====================================================

function drawSynapseView() {
  push();
  resetMatrix();

  // ---------------- INPUT + PHYSIOLOGY ----------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------- AUTHORITATIVE UPDATE ORDER --------
  updateVesicleMotion?.();
  updateVesicleLoading?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();

  // ---------------- SCREEN ANCHOR ---------------------
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyteSynapse?.();

  // ===================================================
  // PRESYNAPTIC SIDE
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  // ---------------------------------------------------
  // VISUAL-ONLY FLIP (CRITICAL)
  // Everything drawn AFTER this matches vesicle physics
  // ---------------------------------------------------
  scale(-1, 1);

  // ===================================================
  // 🔵 VESICLE RESERVE RECTANGLE (ALWAYS VISIBLE)
  // ===================================================
  drawVesicleReserveRectangle_FORCE();

  // Presynaptic geometry
  drawPreSynapse?.();

  // Vesicles + NT contents
  drawSynapseVesicleGeometry?.();
  drawSynapticBurst?.();

  pop();

  // ===================================================
  // POSTSYNAPTIC SIDE
  // ===================================================
  push();
  translate(POST_X, NEURON_Y);
  drawPostSynapse?.();
  pop();

  pop();
}


// =====================================================
// 🔵 AUTHORITATIVE DEBUG RECTANGLE
// =====================================================
// ✔ Drawn in vesicle render space
// ✔ Uses vesiclePool geometry directly
// ✔ Cannot desync from physics
// =====================================================

function drawVesicleReserveRectangle_FORCE() {

  if (typeof getVesicleReserveRect !== "function") return;

  const r = getVesicleReserveRect();

  push();
  noFill();
  stroke(80, 160, 255, 220);   // stable blue
  strokeWeight(3);
  rectMode(CORNERS);
  rect(r.xMin, r.yMin, r.xMax, r.yMax);
  pop();
}
