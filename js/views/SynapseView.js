console.log("🔬 SynapseView — biologically corrected tripartite morphology loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
// World-space origin (0,0) = synaptic cleft center
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
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
// ASTROCYTIC ENDFOOT (LAMINAR, ABOVE SYNAPSE)
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
// PRESYNAPTIC TERMINAL (RIGHT — OBLONG, FLAT LEFT FACE)
// =====================================================
function drawPresynapticTerminal() {
  push();
  translate(150, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();
  curveVertex( 140, -60);
  curveVertex( 140, -60);

  // Rounded outer edge
  curveVertex( 110, -95);
  curveVertex(  40, -115);
  curveVertex( -30, -100);

  // Flattened cleft face
  curveVertex( -90, -40);
  curveVertex(-100,   0);
  curveVertex( -90,  40);

  // Rounded bottom
  curveVertex( -30, 100);
  curveVertex(  40, 115);
  curveVertex( 110,  95);

  curveVertex( 140,  60);
  curveVertex( 140, -60);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT — OBLONG, FLAT RIGHT FACE)
// =====================================================
function drawPostsynapticTerminal() {
  push();
  translate(-150, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();
  curveVertex(-140, -60);
  curveVertex(-140, -60);

  // Rounded outer edge
  curveVertex(-110, -95);
  curveVertex( -40, -115);
  curveVertex(  30, -100);

  // Flattened cleft face
  curveVertex(  90, -40);
  curveVertex( 100,   0);
  curveVertex(  90,  40);

  // Rounded bottom
  curveVertex(  30, 100);
  curveVertex( -40, 115);
  curveVertex(-110,  95);

  curveVertex(-140,  60);
  curveVertex(-140, -60);
  endShape(CLOSE);

  pop();
}
