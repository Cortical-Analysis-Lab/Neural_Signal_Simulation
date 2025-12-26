console.log("🔬 SynapseView — corrected scale & alignment loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// World-space origin (0,0) = synaptic cleft center
// Geometry scaled for microscope zoom
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // 🔑 Anchor to synapse focus (world space)
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
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 40);

  // Positioned clearly above cleft
  translate(0, -150);

  beginShape();
  curveVertex(-160, -20);
  curveVertex(-160, -20);
  curveVertex(-110, -70);
  curveVertex( -40, -95);
  curveVertex(   0, -100);
  curveVertex(  40, -95);
  curveVertex( 110, -70);
  curveVertex( 160, -20);
  curveVertex( 140,  25);
  curveVertex(  80,  55);
  curveVertex(   0,  65);
  curveVertex( -80,  55);
  curveVertex(-140,  25);
  curveVertex(-160, -20);
  curveVertex(-160, -20);
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

  // Offset to maintain extracellular gap
  translate(140, 0);

  beginShape();
  curveVertex( 120, -45);
  curveVertex( 120, -45);
  curveVertex(  70, -80);
  curveVertex( -30, -75);
  curveVertex(-100, -25);
  curveVertex(-115,   0);
  curveVertex(-100,  25);
  curveVertex( -30,  75);
  curveVertex(  70,  80);
  curveVertex( 120,  45);
  curveVertex( 120, -45);
  curveVertex( 120, -45);
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

  // Symmetric offset
  translate(-140, 0);

  beginShape();
  curveVertex(-120, -45);
  curveVertex(-120, -45);
  curveVertex( -70, -80);
  curveVertex(  30, -75);
  curveVertex( 100, -25);
  curveVertex( 115,   0);
  curveVertex( 100,  25);
  curveVertex(  30,  75);
  curveVertex( -70,  80);
  curveVertex(-120,  45);
  curveVertex(-120, -45);
  curveVertex(-120, -45);
  endShape(CLOSE);

  pop();
}
