console.log("🔬 SynapseView — single-outline neurons (clean topology)");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE SCALE (DO NOT CHANGE)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// =====================================================
// MERGE ANCHORS (CRITICAL FIX)
// =====================================================
const MERGE_TOP    = -120;
const MERGE_BOTTOM =  120;

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();
  drawPresynapticNeuron();
  drawPostsynapticNeuron();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (LOCKED)
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -120);

  stroke(...ASTRO_PURPLE);
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
// PRESYNAPTIC NEURON (RIGHT — CLEAN TOPOLOGY)
// =====================================================
function drawPresynapticNeuron() {
  push();
  translate(95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 30);

  beginShape();

  // ---- TOP NEURITE WALL (OPEN)
  vertex(600, -40);
  vertex(260, -40);

  // ---- TOP MERGE INTO BOUTON
  curveVertex(260, MERGE_TOP);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(260, MERGE_BOTTOM);

  // ---- SYNAPTIC FACE
  vertex(180,  140);
  vertex(150,   80);
  vertex(150,    0);
  vertex(150,  -80);
  vertex(180, -140);

  // ---- RETURN TO TOP MERGE (NOT SAME POINT)
  curveVertex(260, MERGE_TOP);

  // ---- BOTTOM NEURITE WALL (OPEN)
  vertex(260,  40);
  vertex(600,  40);

  endShape(CLOSE);
  pop();
}

// =====================================================
// POSTSYNAPTIC NEURON (LEFT — CLEAN TOPOLOGY)
// =====================================================
function drawPostsynapticNeuron() {
  push();
  translate(-95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 30);

  beginShape();

  // ---- TOP NEURITE WALL (OPEN)
  vertex(-600, -40);
  vertex(-260, -40);

  // ---- TOP MERGE INTO BOUTON
  curveVertex(-260, MERGE_TOP);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-260, MERGE_BOTTOM);

  // ---- SYNAPTIC FACE
  vertex(-180,  140);
  vertex(-150,   80);
  vertex(-150,    0);
  vertex(-150,  -80);
  vertex(-180, -140);

  // ---- RETURN TO TOP MERGE (NOT SAME POINT)
  curveVertex(-260, MERGE_TOP);

  // ---- BOTTOM NEURITE WALL (OPEN)
  vertex(-260,  40);
  vertex(-600,  40);

  endShape(CLOSE);
  pop();
}
