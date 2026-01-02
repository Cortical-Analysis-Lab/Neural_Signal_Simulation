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

  const spaceDown = keyIsDown(32);

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

  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------------------------------------------
  // AUTHORITATIVE UPDATE ORDER
  // ---------------------------------------------------
  updateVesicleMotion?.();
  updateVesicleLoading?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();

  // ---------------------------------------------------
  // SCREEN ANCHOR
  // ---------------------------------------------------
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

  // IMPORTANT: visual-only flip
  scale(-1, 1);

  drawPreSynapse?.();

  // ===================================================
  // 🔵 FORCE-DRAW VESICLE RESERVE RECTANGLE
  // ===================================================
  drawVesicleReserveRectangle_FORCE();

  // Vesicles
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
// 🔵 HARD DEBUG RECTANGLE (CANNOT FAIL)
// =====================================================

function drawVesicleReserveRectangle_FORCE() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  const xMin = window.SYNAPSE_VESICLE_STOP_X + 12 + r;
  const xMax = xMin + 36 - r * 2;

  const yCenter = window.SYNAPSE_TERMINAL_CENTER_Y;
  const yHalf   = window.SYNAPSE_TERMINAL_RADIUS * 0.55;

  const yMin = yCenter - yHalf + r;
  const yMax = yCenter + yHalf - r;

  push();
  noFill();
  stroke(80, 160, 255, 240); // BRIGHT BLUE
  strokeWeight(3);
  rectMode(CORNERS);
  rect(xMin, yMin, xMax, yMax);
  pop();
}
