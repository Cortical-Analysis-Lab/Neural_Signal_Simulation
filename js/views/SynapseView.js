console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT (VIEW-ONLY)
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
//
// ✔ Detects AP trigger intent
// ✔ Emits NO physics
// ✔ Emits NO geometry
// ✔ Emits NO vesicle release directly
//
let spaceWasDown = false;

function handleSynapseInput() {

  const spaceDown = keyIsDown(32); // spacebar

  if (spaceDown && !spaceWasDown) {
    triggerTerminalAP?.(); // AP owns release coupling
  }

  spaceWasDown = spaceDown;
}


// =====================================================
// ENSURE VESICLE POOL EXISTS (ONE-TIME)
// =====================================================
//
// ✔ Pool creation only
// ✔ Explicit RRP positioning
// ✔ No motion
// ✔ No confinement
// ✔ No release
//
function ensureVesiclePoolInitialized() {

  if (!Array.isArray(window.synapseVesicles)) {
    window.synapseVesicles = [];
  }

  const maxVes = window.SYNAPSE_MAX_VESICLES ?? 7;

  // ---------------------------------------------------
  // SPAWN EMPTY VESICLES (RESERVE POOL)
  // ---------------------------------------------------
  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      window.requestNewEmptyVesicle?.();
    }
  }

  // ---------------------------------------------------
  // SEED READILY RELEASABLE POOL (LOADED ZONE)
  // ---------------------------------------------------
  if (!window.__RRPSeeded) {

    const preloadCount = 3;
    const r = window.SYNAPSE_VESICLE_RADIUS;

    const loadedPool =
      typeof getLoadedPoolRect === "function"
        ? getLoadedPoolRect()
        : null;

    for (let i = 0; i < window.synapseVesicles.length && i < preloadCount; i++) {
      const v = window.synapseVesicles[i];

      // ------------------------------
      // FORCE POSITION INTO LOADED ZONE
      // ------------------------------
      if (loadedPool) {
        v.x  = random(loadedPool.xMin + r, loadedPool.xMax - r);
        v.y  = random(loadedPool.yMin + r, loadedPool.yMax - r);
        v.vx = 0;
        v.vy = 0;
      }

      // ------------------------------
      // STATE + CHEMISTRY ONLY
      // ------------------------------
      v.state     = "LOADED";
      v.primedH   = true;
      v.primedATP = true;

      // Pre-fill neurotransmitters
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
// MAIN VIEW — ORCHESTRATOR ONLY
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
  // AUTHORITATIVE UPDATE ORDER (CRITICAL)
  // ---------------------------------------------------
  //
  // 1) Chemistry & priming
  // 2) Pool motion (Brownian + collisions)
  // 3) Pool confinement / staging
  // 4) Release ownership & fusion
  // 5) Recycling
  //
  updateVesicleLoading?.();
  updateVesicleMotion?.();
  updateVesiclePools?.();
  updateVesicleRelease?.();
  updateVesicleRecycling?.();
  updateSynapticBurst?.();


  // ===================================================
  // SCREEN ANCHOR (VIEW SPACE)
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
  // PRESYNAPTIC SIDE (LOCAL PHYSICS SPACE)
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  // ---------------------------------------------------
  // VISUAL-ONLY FLIP (GEOMETRY ONLY)
  // ---------------------------------------------------
  window.__synapseFlipped = true;
  scale(-1, 1);

  // ---------------------------------------------------
  // TERMINAL AP UPDATE (MUST RUN BEFORE DRAW)
  // ---------------------------------------------------
  if (
    typeof calibratePath === "function" &&
    typeof updateTerminalAP === "function" &&
    typeof PRESYNAPTIC_AP_PATH !== "undefined"
  ) {
    const path = calibratePath(PRESYNAPTIC_AP_PATH);
    updateTerminalAP(path);
  }

  // ---------------------------------------------------
  // DRAW ORDER
  // ---------------------------------------------------
  drawPreSynapse?.();
  drawSynapseVesicleGeometry?.();
  drawSynapticBurst?.();

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
