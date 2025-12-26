console.log("🔬 SynapseView — rotated T neurons (nub-free, stroke-safe)");

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
// ROUNDING CONTROL (SAFE, TUNABLE)
// Increase toward barHalf to approach circular geometry
// =====================================================
const CORNER_RADIUS = 80;

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();
  translate(window.synapseFocus.x, window.synapseFocus.y);
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  drawAstrocyticEndfoot();

  // Shift neurons DOWN to create astrocyte gap
  drawTNeuron(+140, 120, +1);
  drawTNeuron(-140, 120, -1);

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
// ROTATED CAPITAL T — NUB-FREE, STROKE-SAFE
// =====================================================
function drawTNeuron(x, y, dir) {
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  const STEM_FAR  = 2000;
  const stemHalf = 40;

  const barHalf  = 140;
  const barThick = 340;

  const rStem = min(CORNER_RADIUS, stemHalf);
  const rBar  = min(CORNER_RADIUS, barHalf);

  beginShape();

  // =========================
  // TOP STEM (HORIZONTAL)
  // =========================
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);

  // =========================
  // DROP VERTICALLY (NO CURVE)
  // =========================
  vertex(barThick / 2, -barHalf + rBar);

  // =========================
  // TOP BAR FILLET
  // =========================
  quadraticVertex(
    barThick / 2, -barHalf,
    barThick / 2 - rBar, -barHalf
  );

  vertex(rBar, -barHalf);

  // =========================
  // SYNAPTIC FACE
  // =========================
  quadraticVertex(0, -barHalf, 0, -barHalf + rBar);
  vertex(0, barHalf - rBar);
  quadraticVertex(0, barHalf, rBar, barHalf);

  // =========================
  // BOTTOM BAR
  // =========================
  vertex(barThick / 2 - rBar, barHalf);

  quadraticVertex(
    barThick / 2, barHalf,
    barThick / 2, barHalf - rBar
  );

  // =========================
  // BOTTOM STEM
  // =========================
  vertex(barThick / 2, stemHalf);
  vertex(STEM_FAR, stemHalf);

  endShape(CLOSE);
  pop();
}
