console.log("🔬 SynapseView — corrected scale, alignment, and morphology loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// World-space origin (0,0) = synaptic cleft center
// Geometry scaled to remain visible at high zoom
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // 🔑 Anchor anatomy to synapse focus in WORLD space
  translate(window.synapseFocus.x, window.synapseFocus.y);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();
  drawPresynapticTerminal();
  drawPostsynapticTerminal();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (PURPLE, ABOVE CLEFT)
// =====================================================
function drawAstrocyticEndfoot() {
  push();

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  // 🔑 Reduced offset to stay in frame at high zoom
  translate(0, -95);

  beginShape();
  curveVertex(-150, -10);
  curveVertex(-150, -10);
  curveVertex(-100, -55);
  curveVertex( -40, -75);
  curveVertex(   0, -80);
  curveVertex(  40, -75);
  curveVertex( 100, -55);
  curveVertex( 150, -10);
  curveVertex( 130,  30);
  curveVertex(  75,  55);
  curveVertex(   0,  62);
  curveVertex( -75,  55);
  curveVertex(-130,  30);
  curveVertex(-150, -10);
  curveVertex(-150, -10);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, FLATTENED)
// =====================================================
function drawPresynapticTerminal() {
  push();

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // 🔑 Balanced offset for visible extracellular cleft
  translate(130, 0);

  beginShape();
  curveVertex( 115, -40);
  curveVertex( 115, -40);
  curveVertex(  65, -75);
  curveVertex( -25, -70);
  curveVertex( -90, -25);
  curveVertex(-105,   0);
  curveVertex( -90,  25);
  curveVertex( -25,  70);
  curveVertex(  65,  75);
  curveVertex( 115,  40);
  curveVertex( 115, -40);
  curveVertex( 115, -40);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT, FLATTENED)
// =====================================================
function drawPostsynapticTerminal() {
  push();

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // 🔑 Symmetric offset
  translate(-130, 0);

  beginShape();
  curveVertex(-115, -40);
  curveVertex(-115, -40);
  curveVertex( -65, -75);
  curveVertex(  25, -70);
  curveVertex(  90, -25);
  curveVertex( 105,   0);
  curveVertex(  90,  25);
  curveVertex(  25,  70);
  curveVertex( -65,  75);
  curveVertex(-115,  40);
  curveVertex(-115, -40);
  curveVertex(-115, -40);
  endShape(CLOSE);

  pop();
}
