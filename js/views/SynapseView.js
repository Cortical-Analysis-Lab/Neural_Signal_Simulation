console.log("🔬 SynapseView — corrected inward alignment loaded");

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

  // Neuronal membranes (inward-aligned)
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
// PRESYNAPTIC TERMINAL (RIGHT — INWARD, FLATTENED FACE)
// =====================================================
function drawPresynapticTerminal() {
  push();

  // 🔑 Move inward so inner face aligns with astrocyte edge
  translate(190, 0); // was 260

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge
  curveVertex( 230, -110);
  curveVertex( 230, -110);
  curveVertex( 265,  -55);
  curveVertex( 280,    0);
  curveVertex( 265,   55);
  curveVertex( 230,  110);

  // Inner flattened synaptic face (aligned near x ≈ 170)
  curveVertex( 170,   90);
  curveVertex( 145,   45);
  curveVertex( 140,    0);
  curveVertex( 145,  -45);
  curveVertex( 170,  -90);

  curveVertex( 230, -110);
  curveVertex( 230, -110);

  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT — INWARD, FLATTENED FACE)
// =====================================================
function drawPostsynapticTerminal() {
  push();

  // 🔑 Symmetric inward positioning
  translate(-190, 0); // was -260

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();

  // Outer bulging edge
  curveVertex(-230, -110);
  curveVertex(-230, -110);
  curveVertex(-265,  -55);
  curveVertex(-280,    0);
  curveVertex(-265,   55);
  curveVertex(-230,  110);

  // Inner flattened synaptic face
  curveVertex(-170,   90);
  curveVertex(-145,   45);
  curveVertex(-140,    0);
  curveVertex(-145,  -45);
  curveVertex(-170,  -90);

  curveVertex(-230, -110);
  curveVertex(-230, -110);

  endShape(CLOSE);

  pop();
}
