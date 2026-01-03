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

  // ---------------------------------------------------
  // SPAWN VESICLES (ONCE)
  // ---------------------------------------------------
  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      window.requestNewEmptyVesicle?.();
    }
  }

  // ---------------------------------------------------
  // SEED RRP (ONCE, GUARDED)
  // ---------------------------------------------------
  if (!window.__RRPSeeded) {

    const preloadCount = 3;

    for (let i = 0; i < window.synapseVesicles.length && i < preloadCount; i++) {
      const v = window.synapseVesicles[i];

      v.state = "loaded";
      v.primedH = true;
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
//
// ✔ Orders subsystems
// ✔ Applies transforms
// ✔ Owns NO geometry
// ✔ Owns NO physics
//
// Vesicle confinement + domains are
// fully owned by vesiclePool.js
// =====================================================

function drawSynapseView() {
  push();
  resetMatrix();

  // ---------------- INPUT + PHYSIOLOGY ----------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------- AUTHORITATIVE UPDATE ORDER --------
  updateVesicleLoading();
  updateVesicleRelease();  
  updateVesicleMotion();    
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
  // PRESYNAPTIC SIDE (PHYSICS SPACE)
  // ===================================================
  push();
  translate(PRE_X, NEURON_Y);

  // ---------------------------------------------------
  // VISUAL-ONLY FLIP (CRITICAL)
  // Everything AFTER this matches vesicle physics
  // ---------------------------------------------------
  scale(-1, 1);

  // Presynaptic geometry
  drawPreSynapse?.();

  // Vesicles + neurotransmitter contents
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
