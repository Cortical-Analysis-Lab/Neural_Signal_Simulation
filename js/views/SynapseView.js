console.log("🔬 SynapseView — rounded tripartite synapse (structural)");

// =====================================================
// SYNAPSE VIEW — BIOLOGICALLY ROUNDED STRUCTURE
// =====================================================
// ✔ Soft neuronal yellow (matches overview neurons)
// ✔ Soft astrocytic purple (matches overview astrocytes)
// ✔ Rounded, flattened membranes
// ✔ Clear extracellular gaps
// =====================================================

function drawSynapseView() {

  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);

  strokeWeight(7);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  noFill();

  drawAstrocyticEndfoot();
  drawPresynapticMembrane();
  drawPostsynapticMembrane();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT — ROUNDED, FLATTENED CAP (PURPLE)
// =====================================================
function drawAstrocyticEndfoot() {

  // Matches overview astrocyte tone
  stroke(185, 145, 220);

  push();
  translate(0, -210);

  beginShape();
  curveVertex(-300, -40);
  curveVertex(-260, -110);
  curveVertex(-160, -160);
  curveVertex(   0, -180);
  curveVertex( 160, -160);
  curveVertex( 260, -110);
  curveVertex( 300,  -40);
  curveVertex( 240,   40);
  curveVertex( 120,   85);
  curveVertex(   0,  100);
  curveVertex(-120,   85);
  curveVertex(-240,   40);
  curveVertex(-300,  -40);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC MEMBRANE — RIGHT, CONCAVE, YELLOW
// =====================================================
function drawPresynapticMembrane() {

  // Matches overview neuron yellow
  stroke(245, 225, 140);

  push();
  translate(230, 0);

  beginShape();
  curveVertex( 150, -120);
  curveVertex( 110, -160);
  curveVertex(  20, -140);
  curveVertex( -40,  -70);
  curveVertex( -55,    0);
  curveVertex( -40,   70);
  curveVertex(  20,  140);
  curveVertex( 110,  160);
  curveVertex( 150,  120);
  endShape();

  pop();
}

// =====================================================
// POSTSYNAPTIC MEMBRANE — LEFT, CONCAVE, YELLOW
// =====================================================
function drawPostsynapticMembrane() {

  stroke(245, 225, 140);

  push();
  translate(-230, 0);

  beginShape();
  curveVertex(-150, -120);
  curveVertex(-110, -160);
  curveVertex( -20, -140);
  curveVertex(  40,  -70);
  curveVertex(  55,    0);
  curveVertex(  40,   70);
  curveVertex( -20,  140);
  curveVertex(-110,  160);
  curveVertex(-150,  120);
  endShape();

  pop();
}
