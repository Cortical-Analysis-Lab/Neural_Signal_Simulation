console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCALE & SCREEN-LOCKED LAYOUT
// =====================================================
const SYNAPSE_SCALE = 0.28;

// Screen anchor (tablet+ invariant)
const SYNAPSE_SCREEN_X = 0.5;   // center horizontally
const SYNAPSE_SCREEN_Y = 0.55;  // slightly below center

// =====================================================
// MAIN VIEW — ORCHESTRATOR ONLY
// Geometry lives in submodules
// =====================================================
function drawSynapseView() {

  push();

  // =================================================
  // FIXED SCREEN SPACE (NO WORLD DRIFT)
  // =================================================
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  // =================================================
  // VISUAL SCALE (APPLIED ONCE)
  // =================================================
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // =================================================
  // STRUCTURAL LAYERS (ORDER MATTERS)
  // =================================================

  // Astrocytic endfoot (cleft boundary)
  drawAstrocyteSynapse();

  // Presynaptic terminal (LEFT → releases transmitter)
  drawPreSynapse();

  // Postsynaptic terminal (RIGHT → PSD + receptors)
  drawPostSynapse();

  pop();
}
