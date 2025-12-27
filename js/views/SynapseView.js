console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCALE & LAYOUT (WORLD SPACE)
// =====================================================
const SYNAPSE_SCALE = 0.28;
const NEURON_WORLD_Y_OFFSET = -40; // raises neurons toward astrocyte

// =====================================================
// MAIN VIEW (ONLY WORLD TRANSFORMS HERE)
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // ---------------- WORLD SPACE ----------------
  translate(window.synapseFocus.x, window.synapseFocus.y);
  translate(0, NEURON_WORLD_Y_OFFSET);

  // ---------------- VISUAL SCALE ----------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // ---------------- STRUCTURE ----------------
  drawAstrocyteSynapse();
  drawPreSynapse();
  drawPostSynapse();

  pop();
}
