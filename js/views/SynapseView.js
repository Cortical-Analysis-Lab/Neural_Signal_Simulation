console.log("🔬 SynapseView — orchestrator loaded");

// =====================================================
// SCALE & LAYOUT (WORLD SPACE ONLY)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// World-space vertical offset applied BEFORE scaling
// (moves neurons relative to astrocyte without distortion)
const NEURON_WORLD_Y_OFFSET = -40;

// =====================================================
// MAIN VIEW — ORCHESTRATOR ONLY
// Geometry lives in submodules
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // =================================================
  // WORLD SPACE (ABSOLUTE POSITIONING)
  // =================================================
  translate(window.synapseFocus.x, window.synapseFocus.y);

  // Move neurons closer to astrocyte without scaling artifacts
  translate(0, NEURON_WORLD_Y_OFFSET);

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

  // Presynaptic terminal (right side)
  drawPreSynapse();

  // Postsynaptic terminal + PSD receptors (left side)
  drawPostSynapse();

  pop();
}
