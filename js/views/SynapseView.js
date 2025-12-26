console.log("🔬 SynapseView — single-outline neurons (clean topology)");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];
const OUTLINE_BLUE  = [120, 170, 255];

// =====================================================
// SYNAPSE SCALE (DO NOT CHANGE)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();

  // ---- PRESYNAPTIC
  drawPresynapticFill();
  drawPresynapticOutline();

  // ---- POSTSYNAPTIC
  drawPostsynapticFill();
  drawPostsynapticOutline();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (LOCKED — UNCHANGED)
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -120);

  stroke(...ASTRO_PURPLE);
  strokeWeight(6);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();
  curveVertex(-220, -30);
  curveVertex(-220, -30);
  curveVertex(-160, -90);
  curveVertex( -60, -120);
  curveVertex(   0, -125);
  curveVertex(  60, -120);
  curveVertex( 160,  -90);
  curveVertex( 220,  -30);
  curveVertex( 200,   20);
  curveVertex( 120,   55);
  curveVertex(   0,   65);
  curveVertex(-120,   55);
  curveVertex(-200,   20);
  curveVertex(-220, -30);
  curveVertex(-220, -30);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC — FILL (NO STROKE)
// =====================================================
function drawPresynapticFill() {
  push();
  translate(95, 55);

  noStroke();
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 30);

  beginShape();
  vertex(600, -40);
  vertex(260, -40);

  curveVertex(260, -160);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(260,  160);

  vertex(180,  140);
  vertex(150,   80);
  vertex(150,    0);
  vertex(150,  -80);
  vertex(180, -140);

  vertex(260, -160);
  vertex(260,  40);
  vertex(600,  40);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC — OUTER OUTLINE ONLY
// =====================================================
function drawPresynapticOutline() {
  push();
  translate(95, 55);

  noFill();
  stroke(...OUTLINE_BLUE);
  strokeWeight(6);

  beginShape();
  vertex(600, -40);
  vertex(260, -40);

  curveVertex(260, -160);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(260,  160);

  vertex(600,  40);
  endShape();

  pop();
}

// =====================================================
// POSTSYNAPTIC — FILL (NO STROKE)
// =====================================================
function drawPostsynapticFill() {
  push();
  translate(-95, 55);

  noStroke();
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 30);

  beginShape();
  vertex(-600, -40);
  vertex(-260, -40);

  curveVertex(-260, -160);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-260,  160);

  vertex(-180,  140);
  vertex(-150,   80);
  vertex(-150,    0);
  vertex(-150,  -80);
  vertex(-180, -140);

  vertex(-260, -160);
  vertex(-260,  40);
  vertex(-600,  40);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC — OUTER OUTLINE ONLY
// =====================================================
function drawPostsynapticOutline() {
  push();
  translate(-95, 55);

  noFill();
  stroke(...OUTLINE_BLUE);
  strokeWeight(6);

  beginShape();
  vertex(-600, -40);
  vertex(-260, -40);

  curveVertex(-260, -160);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-260,  160);

  vertex(-600,  40);
  endShape();

  pop();
}
