console.log("🔬 SynapseView — T-geometry neurons loaded");

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
// SYNAPSE VIEW — STRUCTURAL ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeJoin(ROUND);
  strokeCap(ROUND);
  strokeWeight(6);

  drawAstrocyticEndfoot();

  // T-shaped neurons
  drawTNeuron( 120, 55,  1); // presynaptic (right)
  drawTNeuron(-120, 55, -1); // postsynaptic (left)

  pop();
}

// =====================================================
// ASTROCYTIC ENDFOOT (UNCHANGED)
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
// GENERIC T-SHAPED NEURON
// =====================================================
// dir = +1 → faces left (presynaptic)
// dir = -1 → faces right (postsynaptic)
// =====================================================
function drawTNeuron(x, y, dir) {
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // Dimensions (tuned to your current scale)
  const stemLength = 360;
  const stemWidth  = 80;
  const barLength  = 220;
  const barWidth   = 60;

  beginShape();

  // ---- STEM (vertical part of T, going backward)
  vertex( stemLength, -stemWidth/2);
  vertex( barLength/2, -stemWidth/2);
  vertex( barLength/2, -barWidth/2);

  // ---- TOP BAR (synaptic face — vertical line)
  vertex( 0, -barWidth/2);
  vertex( 0,  barWidth/2);

  // ---- BOTTOM BAR
  vertex( barLength/2,  barWidth/2);
  vertex( barLength/2,  stemWidth/2);
  vertex( stemLength,   stemWidth/2);

  endShape(CLOSE);

  pop();
}
