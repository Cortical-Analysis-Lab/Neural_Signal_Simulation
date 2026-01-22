console.log("🔬 SynapseView loaded — SCREEN-FRAMED, CLIPPED (FIXED)");

// =====================================================
// SYNAPSE VIEW — ORCHESTRATOR (FIXED-RATIO, CLIPPED)
// =====================================================
//
// ✔ Independent view (NOT overview zoom)
// ✔ Fixed aspect ratio
// ✔ Uniform scaling across screen sizes
// ✔ HARD viewport clipping (Canvas-native)
// ✔ Vesicles drawn ONLY in preSynapse.js
// ✔ NT motion & constraints owned by NTmotion.js
//
// =====================================================


// =====================================================
// 🔑 SYNAPSE DESIGN FRAME (AUTHORITATIVE)
// =====================================================
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
  const spaceDown = keyIsDown(32);
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
  // 🔒 FIXED-RATIO VIEWPORT CALCULATION
  // ---------------------------------------------------
  const sx = width  / SYNAPSE_FRAME.width;
  const sy = height / SYNAPSE_FRAME.height;
  const fitScale = min(sx, sy) * SYNAPSE_SCALE;

  const viewW = SYNAPSE_FRAME.width  * fitScale;
  const viewH = SYNAPSE_FRAME.height * fitScale;

  const viewX = (width  - viewW) / 2;
  const viewY = (height - viewH) / 2;


  // ---------------------------------------------------
  // 🔒 HARD CLIP (CANVAS-NATIVE)
  // ---------------------------------------------------
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(viewX, viewY, viewW, viewH);
  drawingContext.clip();


  // ---------------------------------------------------
  // CENTER + SCALE SYNAPSE WORLD
  // ---------------------------------------------------
  translate(viewX + viewW / 2, viewY + viewH / 2);
  scale(fitScale);


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

  // 🔑 NT emission + lifetime only
  updateSynapticBurst?.();

  // 🔑 NT motion + constraints (force-based)
  updateNTMotion?.(window.synapticNTs);


  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);


  // ---------------------------------------------------
  // ASTROCYTE (DRAW FIRST)
  // ---------------------------------------------------
  drawAstrocyteSynapse();              // purple astrocyte
  drawAstrocyteBoundaryDebug();        // red (geometry intent)
  drawAstrocytePhysicsBoundaryDebug(); // blue (membrane surface)
  drawNTConstraintDebug?.();           // 🟠 ORANGE (NT physics truth)


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
  drawSynapticBurst?.();   // NT geometry only
  pop();


  // ---------------------------------------------------
  // POSTSYNAPTIC TERMINAL
  // ---------------------------------------------------
  push();
  translate(POST_X, NEURON_Y);

  drawPostSynapse?.();
  drawPostSynapseBoundaryDebug?.();  // cyan (geometry only)

  pop();


  // ---------------------------------------------------
  // RESTORE CLIP + STATE
  // ---------------------------------------------------
  drawingContext.restore();
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
