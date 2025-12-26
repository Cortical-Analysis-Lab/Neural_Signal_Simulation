console.log("🔬 SynapseView — rotated T neurons (flat bar, reduced rounding)");

// =====================================================
// COLORS
// =====================================================
const NEURON_YELLOW = window.COLORS?.neuron ?? [245, 225, 140];
const ASTRO_PURPLE  = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// SCALE
// =====================================================
const SYNAPSE_SCALE = 0.28;

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);   // subtle rounding only at corners
  strokeCap(ROUND);

  drawAstrocyticEndfoot();

  drawTNeuron(+140, 55, +1); // presynaptic
  drawTNeuron(-140, 55, -1); // postsynaptic

  pop();
}

// =====================================================
// ASTROCYTE (UNCHANGED)
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
  curveVertex(-60, -120);
  curveVertex(0, -125);
  curveVertex(60, -120);
  curveVertex(160, -90);
  curveVertex(220, -30);
  curveVertex(200, 20);
  curveVertex(120, 55);
  curveVertex(0, 65);
  curveVertex(-120, 55);
  curveVertex(-200, 20);
  curveVertex(-220, -30);
  curveVertex(-220, -30);
  endShape(CLOSE);

  pop();
}

// =====================================================
// ROTATED CAPITAL T — FLAT BAR, LOW ROUNDING
// =====================================================
function drawTNeuron(x, y, dir) {
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // ---- DIMENSIONS ----
  const STEM_FAR  = 2000; // exits screen
  const stemHalf = 40;

  const barHalf  = 140;
  const barThick = 340;

  beginShape();

  // ---- TOP STEM
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);

  // ---- FLAT TOP BAR (NO CURVATURE)
  vertex(barThick / 2, -barHalf);
  vertex(0,            -barHalf);

  // ---- SYNAPTIC FACE
  vertex(0, +barHalf);

  // ---- FLAT BOTTOM BAR
  vertex(barThick / 2, +barHalf);

  // ---- BOTTOM STEM
  vertex(barThick / 2, +stemHalf);
  vertex(STEM_FAR,     +stemHalf);

  endShape(CLOSE);

  pop();
}
