console.log("🔬 SynapseView — rotated T neurons (tunable rounded corners)");

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
// ROUNDING CONTROL (🔥 THIS IS THE KNOB 🔥)
// =====================================================
const CORNER_RADIUS = 120;
// 0   → sharp corners
// 40  → subtle rounding
// 140 → pill-like
// 300 → corners disappear → near-circle

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
// ROTATED CAPITAL T — ROUNDED OUTER BORDER
// =====================================================
function drawTNeuron(x, y, dir) {
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // ---- BASE GEOMETRY ----
  const STEM_FAR  = 2000;
  const stemHalf = 40;

  const barHalf  = 140;
  const barThick = 340;

  const R = CORNER_RADIUS;

  beginShape();

  // ---- TOP STEM → BAR CORNER
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2 - R, -stemHalf);
  quadraticVertex(
    barThick / 2, -stemHalf,
    barThick / 2, -stemHalf - R
  );

  // ---- TOP BAR (FLAT)
  vertex(barThick / 2, -barHalf + R);
  quadraticVertex(
    barThick / 2, -barHalf,
    barThick / 2 - R, -barHalf
  );
  vertex(R, -barHalf);

  // ---- SYNAPTIC FACE (LEFT EDGE)
  quadraticVertex(0, -barHalf, 0, -barHalf + R);
  vertex(0, barHalf - R);
  quadraticVertex(0, barHalf, R, barHalf);

  // ---- BOTTOM BAR
  vertex(barThick / 2 - R, barHalf);
  quadraticVertex(
    barThick / 2, barHalf,
    barThick / 2, barHalf - R
  );
  vertex(barThick / 2, stemHalf + R);
  quadraticVertex(
    barThick / 2, stemHalf,
    barThick / 2 + R, stemHalf
  );

  // ---- BOTTOM STEM
  vertex(STEM_FAR, stemHalf);

  endShape(CLOSE);

  pop();
}
