console.log("🔬 SynapseView — neurites trimmed + bouton offset (visible fix)");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE SCALE (DO NOT CHANGE)
// =====================================================
const SYNAPSE_SCALE = 0.28;

// Junction plane (KEY FIX)
const NEURITE_END   = 250;
const BOUTON_START  = 270;

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
// PRESYNAPTIC NEURON (RIGHT — VISIBLE GAP FIX)
// =====================================================
function drawPresynapticNeuron() {
  push();
  translate(95, 55);

  stroke(...NEURON_YELLOW);

  // ---- NEURITE (ENDS BEFORE BOUTON)
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 25);
  beginShape();
  vertex(600, -40);
  vertex(NEURITE_END, -40);
  vertex(NEURITE_END,  40);
  vertex(600,  40);
  endShape(CLOSE);

  // ---- BOUTON (STARTS AFTER GAP)
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);
  beginShape();

  curveVertex(BOUTON_START, -160);
  curveVertex(300,  -80);
  curveVertex(320,    0);
  curveVertex(300,   80);
  curveVertex(BOUTON_START, 160);

  vertex(180,  140);
  vertex(150,   80);
  vertex(150,    0);
  vertex(150,  -80);
  vertex(180, -140);

  endShape(CLOSE);
  pop();
}

// =====================================================
// POSTSYNAPTIC NEURON (LEFT — VISIBLE GAP FIX)
// =====================================================
function drawPostsynapticNeuron() {
  push();
  translate(-95, 55);

  stroke(...NEURON_YELLOW);

  // ---- NEURITE (ENDS BEFORE BOUTON)
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 25);
  beginShape();
  vertex(-600, -40);
  vertex(-NEURITE_END, -40);
  vertex(-NEURITE_END,  40);
  vertex(-600,  40);
  endShape(CLOSE);

  // ---- BOUTON (STARTS AFTER GAP)
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);
  beginShape();

  curveVertex(-BOUTON_START, -160);
  curveVertex(-300,  -80);
  curveVertex(-320,    0);
  curveVertex(-300,   80);
  curveVertex(-BOUTON_START, 160);

  vertex(-180,  140);
  vertex(-150,   80);
  vertex(-150,    0);
  vertex(-150,  -80);
  vertex(-180, -140);

  endShape(CLOSE);
  pop();
}
