console.log("🔬 SynapseView — neurons stretched & lowered");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE SCALE (DO NOT CHANGE)
// =====================================================
const SYNAPSE_SCALE = 0.33;

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

  // Astrocyte (LOCKED — unchanged)
  drawAstrocyticEndfoot();

  // Neuronal membranes (taller + lower)
  drawPresynapticTerminal();
  drawPostsynapticTerminal();

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
// PRESYNAPTIC TERMINAL (RIGHT — TALLER & LOWERED)
// =====================================================
function drawPresynapticTerminal() {
  push();

  // 🔑 inward + downward shift
  translate(95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge (taller)
  curveVertex( 230, -170);
  curveVertex( 230, -170);
  curveVertex( 265,  -85);
  curveVertex( 280,    0);
  curveVertex( 265,   85);
  curveVertex( 230,  170);

  // Inner flattened synaptic face (elongated)
  curveVertex( 170,  135);
  curveVertex( 145,   70);
  curveVertex( 140,    0);
  curveVertex( 145,  -70);
  curveVertex( 170, -135);

  curveVertex( 230, -170);
  curveVertex( 230, -170);

  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT — TALLER & LOWERED)
// =====================================================
function drawPostsynapticTerminal() {
  push();

  // 🔑 inward + downward shift
  translate(-95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge
  curveVertex(-230, -170);
  curveVertex(-230, -170);
  curveVertex(-265,  -85);
  curveVertex(-280,    0);
  curveVertex(-265,   85);
  curveVertex(-230,  170);

  // Inner flattened synaptic face
  curveVertex(-170,  135);
  curveVertex(-145,   70);
  curveVertex(-140,    0);
  curveVertex(-145,  -70);
  curveVertex(-170, -135);

  curveVertex(-230, -170);
  curveVertex(-230, -170);

  endShape(CLOSE);

  pop();
}
