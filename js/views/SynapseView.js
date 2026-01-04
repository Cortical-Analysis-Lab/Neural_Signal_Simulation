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
//
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
// ENSURE VESICLE POOL EXISTS (ONE-TIME)
// =====================================================
//
// ✔ Pool creation only
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
  // SPAWN EMPTY VESICLES (ONCE)
// ---------------------------------------------------
  if (window.synapseVesicles.length === 0) {
    for (let i = 0; i < maxVes; i++) {
      window.requestNewEmptyVesicle?.();
    }
  }

  // ---------------------------------------------------
  // SEED READILY RELEASABLE POOL (ONCE)
// ---------------------------------------------------
  if (!window.__RRPSeeded) {

    const preloadCount = 3;

    for (let i = 0; i < window.synapseVesicles.length && i < preloadCount; i++) {
      const v = window.synapseVesicles[i];

      // ⚠️ STATE ONLY — NO POSITION, NO VELOCITY
      v.state       = "LOADED";
      v.primedH     = true;
      v.primedATP   = true;
      v.owner       = "POOL";
      v.ownerFrame  = frameCount;

      // Pre-fill neurotransmitters (geometry-local)
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
// ✔ Owns NO pool logic
//
// Authority flow:
//
// vesicleMotion.js   → how vesicles move
// vesiclePools.js    → where vesicles are allowed
// vesicleRelease.js  → when vesicles leave pool
// vesicleRecycling.js→ recovery only
//
// =====================================================

function drawSynapseView() {

  push();
  resetMatrix();

  // ---------------------------------------------------
  // INPUT + ELECTRICAL PHYSIOLOGY (NO GEOMETRY)
  // ---------------------------------------------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();

  // ---------------------------------------------------
  // AUTHORITATIVE UPDATE ORDER (DO NOT CHANGE)
  // ---------------------------------------------------

  // 1) Biochemical priming / bias
  updateVesicleLoading?.();

  // 2) Motion + collisions (pure kinematics)
  updateVesicleMotion?.();

  // 3) Pool confinement + reserve→loaded transitions
  updateVesiclePools?.();

  // 4) Fusion / release ownership transfer
  updateVesicleRelease?.();

  // 5) Endocytosis + recovery
  updateVesicleRecycling?.();

  // 6) Postsynaptic response aggregation
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
  // 🔁 VISUAL-ONLY FLIP (SIGNAL ONLY)
  // ---------------------------------------------------
  //
  // ✔ Geometry MAY read this
  // ✖ Physics MUST IGNORE THIS
  //
  window.__synapseFlipped = true;
  scale(-1, 1);

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
