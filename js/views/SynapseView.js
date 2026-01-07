console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (VIEW-ONLY)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Screen → synapse coordinate transforms
// ✔ Input intent (AP trigger only)
// ✔ Authoritative update order
// ✔ Debug overlays (from synapseConstants.js)
//
// NON-RESPONSIBILITIES:
// ✘ No physics definitions
// ✘ No geometry truth
// ✘ No vesicle logic
// ✘ No chemistry logic
//
// =====================================================


// =====================================================
// SCREEN-SPACE LAYOUT (VIEW-ONLY)
// =====================================================
const SYNAPSE_SCALE    = 1.45;
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// Presynaptic / postsynaptic anchor offsets
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
  }
  spaceWasDown = spaceDown;
}


// =====================================================
// ENSURE VESICLE POOL EXISTS (ONE-TIME)
// =====================================================
function ensureVesiclePoolInitialized() {

  if (!Array.isArray(window.synapseVesicles)) {
    window.synapseVesicles = [];
  }

  const maxVes = window.SYNAPSE_MAX_VESICLES ?? 7;

  // Spawn reserve vesicles
  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      window.requestNewEmptyVesicle?.();
    }
  }

  // Seed RRP
  if (!window.__RRPSeeded) {

    const preloadCount = 3;
    const r = window.SYNAPSE_VESICLE_RADIUS;
    const loadedPool =
      typeof getLoadedPoolRect === "function"
        ? getLoadedPoolRect()
        : null;

    for (let i = 0; i < window.synapseVesicles.length && i < preloadCount; i++) {

      const v = window.synapseVesicles[i];

      if (loadedPool) {
        v.x  = random(loadedPool.xMin + r, loadedPool.xMax - r);
        v.y  = random(loadedPool.yMin + r, loadedPool.yMax - r);
        v.vx = 0;
        v.vy = 0;
      }

      v.state     = "LOADED";
      v.primedH   = true;
      v.primedATP = true;

      v.nts = [];
      for (let n = 0; n < window.SYNAPSE_NT_TARGET; n++) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.12, 0.12),
          vy: random(-0.12, 0.12)
        });
      }
    }

    window.__RRPSeeded = true;
  }
}


// =====================================================
// MAIN VIEW ENTRY — CALLED FROM main.js
// =====================================================
function drawSynapseView() {

  push();
  resetMatrix();

  // ---------------------------------------------------
  // INPUT + ELECTRICAL PHYSIOLOGY
  // ---------------------------------------------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------------------------------------------
  // AUTHORITATIVE UPDATE ORDER
  // ---------------------------------------------------
  updateVesicleLoading?.();
  updateVesicleMotion?.();
  updateVesiclePools?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();


  // ===================================================
  // SCREEN ANCHOR
  // ===================================================
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
  // PRESYNAPTIC SIDE — LOCAL PHYSICS SPACE
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  window.__synapseFlipped = true;
  scale(-1, 1);

  // Terminal AP
  if (
    typeof calibratePath === "function" &&
    typeof updateTerminalAP === "function" &&
    typeof PRESYNAPTIC_AP_PATH !== "undefined"
  ) {
    const path = calibratePath(PRESYNAPTIC_AP_PATH);
    updateTerminalAP(path);
  }

  // --- draw geometry first ---
  drawPreSynapse?.();
  drawSynapseVesicleGeometry?.();
  drawSynapticBurst?.();

  // ---------------------------------------------------
  // 🔍 DEBUG — DRAW LAST (ON TOP OF EVERYTHING)
  // ---------------------------------------------------
  if (window.SHOW_SYNAPSE_DEBUG) {
    push();
    blendMode(BLEND);
    strokeWeight(2);
    drawSynapseConstantDebug?.();
    pop();
  }

  window.__synapseFlipped = false;
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
// GLOBAL EXPORT
// =====================================================
window.drawSynapseView = drawSynapseView;
