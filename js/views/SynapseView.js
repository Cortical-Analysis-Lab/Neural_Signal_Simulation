console.log("🔬 SynapseView — refined tripartite synapse loaded");

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY (REFINED)
// =====================================================
// ✔ Rounded, flattened pre/post synaptic terminals
// ✔ Single continuous astrocytic endfoot (no blob)
// ✔ Correct spacing & cleft gap
// ✔ Uses overview neuron & astrocyte colors
// =====================================================

function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // Anchor to synapse focus in world space
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
// ASTROCYTIC ENDFOOT (PURPLE, SMOOTH, NO BLOB)
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -210);

  stroke(colors.astrocyte); // from color.js

  beginShape();
  vertex(-360, -40);
  bezierVertex(-260, -120, -140, -160,   0, -160);
  bezierVertex( 140, -160,  260, -120, 360, -40);
  endShape();

  // Gentle downward contact toward cleft
  beginShape();
  vertex(-80, -40);
  bezierVertex(-40, 40, 40, 40, 80, -40);
  endShape();

  pop();
}

// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, FLATTENED & WIDE)
// =====================================================
function drawPresynapticTerminal() {
  push();
  translate(260, 0);

  stroke(colors.neuron);

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

  stroke(colors.neuron);

  beginShape();
  vertex(-220, -60);
  bezierVertex(-140, -120,  40, -120, 180, -40);
  bezierVertex( 220,   0,  220,   0, 180,  40);
  bezierVertex(  40, 120, -140, 120, -220, 60);
  endShape();

  pop();
}
