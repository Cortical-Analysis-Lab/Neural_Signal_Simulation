console.log("🔬 SynapseView — structural tripartite synapse loaded");

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// ✔ Camera-centered on synapseFocus
// ✔ Yellow pre/post synaptic membranes
// ✔ Purple astrocytic endfoot (above cleft)
// ✔ Clear extracellular gaps
// ✘ No particles
// ✘ No bars
// ✘ No receptors
// =====================================================

function drawSynapseView() {

  if (!window.synapseFocus) return;

  push();

  // ---------------------------------------------------
  // Anchor synapse geometry to camera focus
  // ---------------------------------------------------
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
// ASTROCYTIC ENDFOOT (PURPLE, ABOVE SYNAPSE)
// =====================================================
function drawAstrocyticEndfoot() {

  push();
  translate(0, -220);
  stroke(170, 120, 210); // glial purple

  beginShape();
  vertex(-280, -60);
  vertex(-180, -130);
  vertex( -60, -160);
  vertex(  60, -160);
  vertex( 180, -130);
  vertex( 280,  -60);
  vertex( 260,   40);
  vertex( 160,   90);
  vertex(  40,  120);
  vertex( -40,  120);
  vertex(-160,   90);
  vertex(-260,   40);
  endShape(CLOSE);

  // Endfoot projection toward synapse (STOPPED SHORT)
  beginShape();
  vertex(-70, 120);
  vertex( 70, 120);
  vertex( 40, 170);
  vertex(  0, 190);
  vertex(-40, 170);
  endShape(CLOSE);

  pop();
}


// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, YELLOW, FLATTENED)
// =====================================================
function drawPresynapticTerminal() {

  push();
  translate(220, 0);
  stroke(240, 220, 120); // neuronal yellow

  beginShape();
  vertex( 160, -90);
  vertex( 100, -150);
  vertex( -40, -130);
  vertex(-120,  -40);
  vertex(-140,    0);
  vertex(-120,   40);
  vertex( -40,  130);
  vertex( 100,  150);
  vertex( 160,   90);
  endShape(CLOSE);

  pop();
}


// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT, YELLOW, FLATTENED)
// =====================================================
function drawPostsynapticTerminal() {

  push();
  translate(-220, 0);
  stroke(240, 220, 120); // neuronal yellow

  beginShape();
  vertex(-160, -90);
  vertex(-100, -150);
  vertex(  40, -130);
  vertex( 120,  -40);
  vertex( 140,    0);
  vertex( 120,   40);
  vertex(  40,  130);
  vertex(-100,  150);
  vertex(-160,   90);
  endShape(CLOSE);

  pop();
}
