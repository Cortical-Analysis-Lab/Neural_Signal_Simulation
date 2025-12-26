console.log("🔬 SynapseView — corrected scale & alignment loaded");

// =====================================================
// COLORS (FROM color.js WITH FALLBACKS)
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

  // 🔑 THIS WAS MISSING — re-anchor to camera focus
  translate(window.synapseFocus.x, window.synapseFocus.y);

  strokeWeight(5);
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
  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 40);

  push();
  translate(0, -120);

  beginShape();
  curveVertex(-120, -20);
  curveVertex( -80, -60);
  curveVertex( -30, -80);
  curveVertex(   0, -85);
  curveVertex(  30, -80);
  curveVertex(  80, -60);
  curveVertex( 120, -20);
  curveVertex( 110,  20);
  curveVertex(  60,  45);
  curveVertex(   0,  55);
  curveVertex( -60,  45);
  curveVertex(-110,  20);
  curveVertex(-120, -20);
  endShape(CLOSE);

  // Endfoot process (stops before cleft)
  beginShape();
  curveVertex(-20,  55);
  curveVertex( 20,  55);
  curveVertex( 15,  75);
  curveVertex(  0,  85);
  curveVertex(-15,  75);
  curveVertex(-20,  55);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, YELLOW)
// =====================================================
function drawPresynapticTerminal() {
  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  push();
  translate(95, 0);

  beginShape();
  curveVertex( 60, -35);
  curveVertex( 40, -55);
  curveVertex( -5, -50);
  curveVertex(-35, -15);
  curveVertex(-42,   0);
  curveVertex(-35,  15);
  curveVertex( -5,  50);
  curveVertex( 40,  55);
  curveVertex( 60,  35);
  curveVertex( 60, -35);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT, YELLOW)
// =====================================================
function drawPostsynapticTerminal() {
  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  push();
  translate(-95, 0);

  beginShape();
  curveVertex(-60, -35);
  curveVertex(-40, -55);
  curveVertex(  5, -50);
  curveVertex( 35, -15);
  curveVertex( 42,   0);
  curveVertex( 35,  15);
  curveVertex(  5,  50);
  curveVertex(-40,  55);
  curveVertex(-60,  35);
  curveVertex(-60, -35);
  endShape(CLOSE);

  pop();
}
