console.log("🔬 SynapseView — scaled + membrane-aligned loaded");

// =====================================================
// COLORS (FROM colors.js WITH FALLBACKS)
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SYNAPSE GEOMETRY SCALE
// =====================================================
const GLOBAL_SCALE = 0.66; // 🔑 ~1.5× smaller than before

// =====================================================
// SYNAPSE VIEW — STRUCTURAL OUTLINES ONLY
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(GLOBAL_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Astrocyte (LOCKED — do not modify shape)
  drawAstrocyticEndfoot();

  // Neurons aligned to astrocyte boundary
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
// PRESYNAPTIC TERMINAL (RIGHT — ALIGNED TO ASTROCYTE)
// =====================================================
function drawPresynapticTerminal() {
  push();

  // 🔑 Move inward so inner face aligns with astrocyte edge
  // Astrocyte edge ≈ ±160–180 in X after curvature
  translate(190, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulge (away from cleft)
  curveVertex( 260, -120);
  curveVertex( 260, -120);
  curveVertex( 290,  -60);
  curveVertex( 300,    0);
  curveVertex( 290,   60);
  curveVertex( 260,  120);

  // Inner flattened synaptic face
  curveVertex( 180,  100);
  curveVertex( 150,   55);
  curveVertex( 145,    0);
  curveVertex( 150,  -55);
  curveVertex( 180, -100);

  curveVertex( 260, -120);
  curveVertex( 260, -120);

  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT — ALIGNED TO ASTROCYTE)
// =====================================================
function drawPostsynapticTerminal() {
  push();

  // Symmetric inward positioning
  translate(-190, 0);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  curveVertex(-260, -120);
  curveVertex(-260, -120);
  curveVertex(-290,  -60);
  curveVertex(-300,    0);
  curveVertex(-290,   60);
  curveVertex(-260,  120);

  curveVertex(-180,  100);
  curveVertex(-150,   55);
  curveVertex(-145,    0);
  curveVertex(-150,  -55);
  curveVertex(-180, -100);

  curveVertex(-260, -120);
  curveVertex(-260, -120);

  endShape(CLOSE);

  pop();
}
