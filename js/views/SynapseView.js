console.log("🔬 SynapseView — edge-anchored neuronal membranes loaded");

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

  // Astrocyte (LOCKED — do not change)
  drawAstrocyticEndfoot();

  // Neuronal membranes
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
// PRESYNAPTIC TERMINAL (RIGHT — EDGE-ANCHORED)
// =====================================================
function drawPresynapticTerminal() {
  push();

  // 🔑 Push membrane toward screen edge
  translate(260, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge (off-screen direction)
  curveVertex( 260, -140);
  curveVertex( 260, -140);
  curveVertex( 300,  -60);
  curveVertex( 320,    0);
  curveVertex( 300,   60);
  curveVertex( 260,  140);

  // Inner flattened synaptic face
  curveVertex( 160,  110);
  curveVertex( 120,   60);
  curveVertex( 110,    0);
  curveVertex( 120,  -60);
  curveVertex( 160, -110);

  curveVertex( 260, -140);
  curveVertex( 260, -140);

  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT — EDGE-ANCHORED)
// =====================================================
function drawPostsynapticTerminal() {
  push();

  // 🔑 Push membrane toward screen edge
  translate(-260, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge
  curveVertex(-260, -140);
  curveVertex(-260, -140);
  curveVertex(-300,  -60);
  curveVertex(-320,    0);
  curveVertex(-300,   60);
  curveVertex(-260,  140);

  // Inner flattened synaptic face
  curveVertex(-160,  110);
  curveVertex(-120,   60);
  curveVertex(-110,    0);
  curveVertex(-120,  -60);
  curveVertex(-160, -110);

  curveVertex(-260, -140);
  curveVertex(-260, -140);

  endShape(CLOSE);

  pop();
}
