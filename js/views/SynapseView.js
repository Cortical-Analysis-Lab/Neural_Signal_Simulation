console.log("🔬 SynapseView — structural tripartite synapse loaded");

// =====================================================
// COLOR ACCESS (FROM color.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// ✔ Camera already centered on synapseFocus
// ✔ Yellow pre/post synaptic membranes
// ✔ Purple astrocytic endfoot (above cleft)
// ✔ Clear extracellular gaps
// ✘ No particles
// ✘ No receptors
// ✘ No bars
// =====================================================

function drawSynapseView() {

  if (!window.synapseFocus) return;

  push();

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();
  drawPresynapticTerminal();
  drawPostsynapticTerminal();

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (PURPLE, ROUNDED, ABOVE)
// =====================================================
function drawAstrocyticEndfoot() {

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 40);

  push();
  translate(0, -170);

  beginShape();
  curveVertex(-220, -40);
  curveVertex(-160, -110);
  curveVertex( -60, -150);
  curveVertex(   0, -160);
  curveVertex(  60, -150);
  curveVertex( 160, -110);
  curveVertex( 220,  -40);
  curveVertex( 200,   30);
  curveVertex( 120,   80);
  curveVertex(   0,  100);
  curveVertex(-120,   80);
  curveVertex(-200,   30);
  curveVertex(-220,  -40);
  endShape(CLOSE);

  // Endfoot process (stops before cleft)
  beginShape();
  curveVertex(-40, 100);
  curveVertex( 40, 100);
  curveVertex( 30, 140);
  curveVertex(  0, 160);
  curveVertex(-30, 140);
  curveVertex(-40, 100);
  endShape(CLOSE);

  pop();
}

// =====================================================
// PRESYNAPTIC TERMINAL (RIGHT, YELLOW, FLATTENED)
// =====================================================
function drawPresynapticTerminal() {

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  push();
  translate(180, 0);

  beginShape();
  curveVertex(120, -70);
  curveVertex( 80, -120);
  curveVertex( -20, -110);
  curveVertex( -80,  -40);
  curveVertex( -95,    0);
  curveVertex( -80,   40);
  curveVertex( -20,  110);
  curveVertex(  80,  120);
  curveVertex( 120,   70);
  curveVertex( 120,  -70);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT, YELLOW, FLATTENED)
// =====================================================
function drawPostsynapticTerminal() {

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  push();
  translate(-180, 0);

  beginShape();
  curveVertex(-120, -70);
  curveVertex( -80, -120);
  curveVertex(  20, -110);
  curveVertex(  80,  -40);
  curveVertex(  95,    0);
  curveVertex(  80,   40);
  curveVertex(  20,  110);
  curveVertex( -80,  120);
  curveVertex(-120,   70);
  curveVertex(-120,  -70);
  endShape(CLOSE);

  pop();
}
