console.log("🔬 SynapseView (clean structural outline) loaded");

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// ✔ Zoomed out 3×
// ✔ Yellow pre & post synaptic terminals (flattened)
// ✔ Blue astrocytic endfoot (sheet-like)
// ✔ Clear extracellular gaps
// ✘ No bars
// ✘ No particles
// ✘ No receptors
// ✘ No labels
// =====================================================


// =====================================================
// GLOBAL SCALE (ZOOMED OUT)
// =====================================================
const SYN_SCALE = 0.33;


// =====================================================
// ENTRY POINT
// =====================================================
function drawSynapseView() {
  push();
  scale(SYN_SCALE);

  noFill();
  strokeWeight(4);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();
  drawPresynapticTerminal();
  drawPostsynapticTerminal();

  pop();
}


// =====================================================
// ASTROCYTIC ENDFOOT (BLUE, ABOVE, SHEET-LIKE)
// =====================================================
function drawAstrocyticEndfoot() {

  push();
  translate(0, -260);
  stroke(120, 170, 210); // astrocyte blue

  beginShape();
  vertex(-360, -60);
  vertex(-260, -120);
  vertex(-120, -150);
  vertex( 120, -150);
  vertex( 260, -120);
  vertex( 360,  -60);
  vertex( 320,   20);
  vertex( 220,   80);
  vertex( 100,  110);
  vertex( -80,  110);
  vertex(-220,   80);
  vertex(-320,   20);
  endShape(CLOSE);

  // Endfoot projection toward synapse (STOPPED SHORT → GAP)
  beginShape();
  vertex(-80,  110);
  vertex( 80,  110);
  vertex( 60,  190);
  vertex(  0,  220);
  vertex(-60,  190);
  endShape(CLOSE);

  pop();
}


// =====================================================
// PRESYNAPTIC TERMINAL (YELLOW, FLATTENED)
// =====================================================
function drawPresynapticTerminal() {

  push();
  translate(260, 0);
  stroke(235, 215, 120); // neuron yellow

  beginShape();
  vertex( 200, -80);
  vertex( 120, -140);
  vertex( -40, -120);
  vertex(-120,  -40);
  vertex(-140,    0);
  vertex(-120,   40);
  vertex( -40,  120);
  vertex( 120,  140);
  vertex( 200,   80);
  endShape(CLOSE);

  pop();
}


// =====================================================
// POSTSYNAPTIC TERMINAL (YELLOW, FLATTENED)
// =====================================================
function drawPostsynapticTerminal() {

  push();
  translate(-260, 0);
  stroke(235, 215, 120); // neuron yellow

  beginShape();
  vertex(-200, -80);
  vertex(-120, -140);
  vertex(  40, -120);
  vertex( 120,  -40);
  vertex( 140,    0);
  vertex( 120,   40);
  vertex(  40,  120);
  vertex(-120,  140);
  vertex(-200,   80);
  endShape(CLOSE);

  pop();
}
