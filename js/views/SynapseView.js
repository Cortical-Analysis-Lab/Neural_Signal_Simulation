console.log("🔬 SynapseView loaded");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (SCREEN-FRAMED, FIXED RATIO)
// =====================================================
//
// ✔ Independent view (NOT overview zoom)
// ✔ Fixed aspect ratio
// ✔ Uniform scaling across screen sizes
// ✔ No camera / world coupling
// ✔ Vesicles drawn ONLY in preSynapse.js
//
// =====================================================


// =====================================================
// 🔑 SYNAPSE DESIGN FRAME (AUTHORITATIVE)
// =====================================================
//
// This defines the intended synapse composition size.
// Everything scales uniformly to fit the screen.
//
const SYNAPSE_FRAME = {
  width:  900,
  height: 500
};


// =====================================================
// USER SCALE (ARTISTIC, SAFE)
// =====================================================
const SYNAPSE_SCALE = 1.45;


// =====================================================
// WORLD ANCHORS (LOCAL TO SYNAPSE VIEW)
// =====================================================
const PRE_X    = -130;
const POST_X   = +130;
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

  // ---------------------------------------------------
  // 🔒 FIXED-RATIO SCREEN FRAMING
  // ---------------------------------------------------
  const sx = width  / SYNAPSE_FRAME.width;
  const sy = height / SYNAPSE_FRAME.height;
  const fitScale = min(sx, sy);

  translate(width / 2, height / 2);
  scale(fitScale * SYNAPSE_SCALE);


  // ---------------------------------------------------
  // INPUT + ELECTRICAL
  // ---------------------------------------------------
  handleSynapseInput();
  updateVoltageWave?.();

  ensureVesiclePoolInitialized();


  // ---------------------------------------------------
  // UPDATE ORDER (AUTHORITATIVE)
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


  // ---------------------------------------------------
  // ASTROCYTE (DRAW FIRST)
  // ---------------------------------------------------
  drawAstrocyteSynapse?.();


  // ---------------------------------------------------
  // PRESYNAPTIC TERMINAL
  // ---------------------------------------------------
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


  // ---------------------------------------------------
  // POSTSYNAPTIC TERMINAL
  // ---------------------------------------------------
  push();
  translate(POST_X, NEURON_Y);
  drawPostSynapse?.();
  pop();


  pop();


  // ---------------------------------------------------
  // DEBUG PROBE
  // ---------------------------------------------------
  if (window.SHOW_SYNAPSE_DEBUG && frameCount % 60 === 0) {
    console.log(
      "🧪 vesicles:",
      window.synapseVesicles?.length,
      window.synapseVesicles?.map(v => ({
        x: v.x?.toFixed(1),
        y: v.y?.toFixed(1),
        state: v.state
      }))
    );
  }
}


// =====================================================
// EXPORT
// =====================================================
window.drawSynapseView = drawSynapseView;
