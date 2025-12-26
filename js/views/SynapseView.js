console.log("🔬 SynapseView — unified open neurite lumen");

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
// PRESYNAPTIC NEURON (RIGHT — SINGLE OPEN SHAPE)
// =====================================================
function drawPresynapticNeuron() {
  push();
  translate(95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // --- TOP NEURITE EDGE (open, straight back)
  vertex(600, -40);
  vertex(260, -40);

  // --- BOUTON OUTER CONTOUR
  curveVertex(260, -160);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(260,  160);

  // --- FLATTENED SYNAPTIC FACE
  vertex(180,  140);
  vertex(150,   80);
  vertex(150,    0);
  vertex(150,  -80);
  vertex(180, -140);

  // --- BOTTOM NEURITE EDGE (open, straight back)
  vertex(260,  40);
  vertex(600,  40);

  endShape(); // deliberately NOT closed
  pop();
}

// =====================================================
// POSTSYNAPTIC NEURON (LEFT — SINGLE OPEN SHAPE)
// =====================================================
function drawPostsynapticNeuron() {
  push();
  translate(-95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // --- TOP NEURITE EDGE
  vertex(-600, -40);
  vertex(-260, -40);

  // --- BOUTON OUTER CONTOUR
  curveVertex(-260, -160);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-260,  160);

  // --- FLATTENED SYNAPTIC FACE
  vertex(-180,  140);
  vertex(-150,   80);
  vertex(-150,    0);
  vertex(-150,  -80);
  vertex(-180, -140);

  // --- BOTTOM NEURITE EDGE
  vertex(-260,  40);
  vertex(-600,  40);

  endShape(); // open back
  pop();
}
