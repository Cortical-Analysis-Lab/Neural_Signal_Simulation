console.log("🔬 SynapseView — terminal branches added");

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

  // Astrocyte (LOCKED)
  drawAstrocyticEndfoot();

  // Terminal branches (BEHIND neurons)
  drawPresynapticBranches();
  drawPostsynapticBranches();

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
// PRESYNAPTIC TERMINAL (RIGHT)
// =====================================================
function drawPresynapticTerminal() {
  push();
  translate(95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();
  curveVertex( 230, -180);
  curveVertex( 230, -180);
  curveVertex( 270,  -90);
  curveVertex( 290,    0);
  curveVertex( 270,   90);
  curveVertex( 230,  180);

  curveVertex( 170,  145);
  curveVertex( 145,   75);
  curveVertex( 140,    0);
  curveVertex( 145,  -75);
  curveVertex( 170, -145);

  curveVertex( 230, -180);
  curveVertex( 230, -180);
  endShape(CLOSE);

  pop();
}

// =====================================================
// POSTSYNAPTIC TERMINAL (LEFT)
// =====================================================
function drawPostsynapticTerminal() {
  push();
  translate(-95, 55);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  beginShape();
  curveVertex(-230, -180);
  curveVertex(-230, -180);
  curveVertex(-270,  -90);
  curveVertex(-290,    0);
  curveVertex(-270,   90);
  curveVertex(-230,  180);

  curveVertex(-170,  145);
  curveVertex(-145,   75);
  curveVertex(-140,    0);
  curveVertex(-145,  -75);
  curveVertex(-170, -145);

  curveVertex(-230, -180);
  curveVertex(-230, -180);
  endShape(CLOSE);

  pop();
}

// =====================================================
// TERMINAL BRANCHES — PRESYNAPTIC (RIGHT, BEHIND)
// =====================================================
function drawPresynapticBranches() {
  push();
  translate(95, 55);

  stroke(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 120);
  noFill();
  strokeWeight(4);

  // Upper branch
  beginShape();
  curveVertex(240, -140);
  curveVertex(240, -140);
  curveVertex(300, -220);
  curveVertex(360, -260);
  endShape();

  // Lower branch
  beginShape();
  curveVertex(240, 140);
  curveVertex(240, 140);
  curveVertex(300, 220);
  curveVertex(360, 260);
  endShape();

  pop();
}

// =====================================================
// TERMINAL BRANCHES — POSTSYNAPTIC (LEFT, BEHIND)
// =====================================================
function drawPostsynapticBranches() {
  push();
  translate(-95, 55);

  stroke(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 120);
  noFill();
  strokeWeight(4);

  // Upper branch
  beginShape();
  curveVertex(-240, -140);
  curveVertex(-240, -140);
  curveVertex(-300, -220);
  curveVertex(-360, -260);
  endShape();

  // Lower branch
  beginShape();
  curveVertex(-240, 140);
  curveVertex(-240, 140);
  curveVertex(-300, 220);
  curveVertex(-360, 260);
  endShape();

  pop();
}
