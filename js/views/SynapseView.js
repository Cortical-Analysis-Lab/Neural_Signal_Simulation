console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCREEN-SPACE LAYOUT
// =====================================================
const SYNAPSE_SCALE = 0.28;

// Relative screen anchor (tablet+ stable)
const SYNAPSE_SCREEN_X = 0.5;
const SYNAPSE_SCREEN_Y = 0.55;

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {

  push();

  // 🔑 RESET WORLD TRANSFORMS
  resetMatrix();

  // Screen-relative anchor
  translate(
    width  * SYNAPSE_SCREEN_X,
    height * SYNAPSE_SCREEN_Y
  );

  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyteSynapse();
  drawPreSynapse();
  drawPostSynapse();

  pop();
}
