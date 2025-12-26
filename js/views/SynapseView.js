console.log("🔬 SynapseView — refined tripartite synapse loaded");

// =====================================================
// SAFE COLOR ACCESS (from colors.js)
// =====================================================
const SYN_COLORS = (() => {
  if (window.COLORS) return window.COLORS;
  if (window.colors) return window.colors;

  console.warn("⚠️ SynapseView: colors not found, using fallback");
  return {
    neuron: [240, 220, 140],
    astrocyte: [185, 155, 220]
  };
})();

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // Anchor geometry to synapse focus
  translate(window.synapseFocus.x, window.synapseFocus.y);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  drawAstrocyticEndfoot();
  drawPresynapticTerminal();
  drawPostsynapticTerminal();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (PURPLE, SMOOTH, NO EXTRA BLOB)
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -210);

  stroke(...SYN_COLORS.astrocyte);

  // Main endfoot arc
  beginShape();
  vertex(-360, -40);
  bezierVertex(-260, -120, -140, -160,   0, -160);
  bezierVertex( 140, -160,  260, -120, 360, -40);
  endShape();

  // Shallow downward contact (single, clean)
  beginShape();
  vertex(-90, -40);
  bezierVertex(-45, 35, 45, 35, 90, -40);
  endShape();

  pop();
}

// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, FLATTENED & WIDE)
// =====================================================
function drawPresynapticTerminal() {
  push();
  translate(260, 0);

  stroke(...SYN_COLORS.neuron);

  beginShape();
  vertex( 220, -60);
  bezierVertex( 140, -120, -40, -120, -180, -40);
  bezierVertex(-220,   0,  -220,   0, -180,  40);
  bezierVertex( -40, 120,  140, 120, 220,  60);
  endShape();

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT, FLATTENED & WIDE)
// =====================================================
function drawPostsynapticTerminal() {
  push();
  translate(-260, 0);

  stroke(...SYN_COLORS.neuron);

  beginShape();
  vertex(-220, -60);
  bezierVertex(-140, -120,  40, -120, 180, -40);
  bezierVertex( 220,   0,  220,   0, 180,  40);
  bezierVertex(  40, 120, -140, 120, -220, 60);
  endShape();

  pop();
}
