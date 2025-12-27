console.log("🔬 SynapseView — rotated T neurons (stroke-clean, final geometry)");

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
// ROUNDING CONTROL
// =====================================================
const CORNER_RADIUS = 80;

// =====================================================
// LAYOUT CONTROL (WORLD SPACE — NOT SCALED)
// =====================================================
const NEURON_WORLD_Y_OFFSET = -40; // ↑ raise neurons toward astrocyte

// =====================================================
// MAIN VIEW
// =====================================================
function drawSynapseView() {
  if (!window.synapseFocus) return;

  push();

  // ---------------------------------------------------
  // WORLD SPACE (layout happens HERE)
  // ---------------------------------------------------
  translate(window.synapseFocus.x, window.synapseFocus.y);

  // 🔑 APPLY NEURON OFFSET IN WORLD SPACE
  translate(0, NEURON_WORLD_Y_OFFSET);

  // ---------------------------------------------------
  // GEOMETRY SCALE (visual only)
  // ---------------------------------------------------
  scale(SYNAPSE_SCALE);

  strokeWeight(6);
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // Astrocyte stays fixed relative to synapse focus
  drawAstrocyticEndfoot();

  // Neurons inherit world-space offset
  drawTNeuron(+140, 75, +1);
  drawTNeuron(-140, 75, -1);

  pop();
}

// =====================================================
// ASTROCYTE — TRUE NUB-FREE PATH
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -140);

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();
  curveVertex(-200, -10);
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

  // smooth return — no CLOSE join
  curveVertex(-220, -30);
  curveVertex(-200, -10);

  endShape(); // intentionally OPEN
  pop();
}

// =====================================================
// ROTATED CAPITAL T — STROKE-SAFE
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

  const rBar = min(CORNER_RADIUS, barHalf);

  beginShape();

  // Stem (open end)
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);

  // Vertical descent (no curve → no nub)
  vertex(barThick / 2, -barHalf + rBar);

  // Top bar fillet
  quadraticVertex(
    barThick / 2, -barHalf,
    barThick / 2 - rBar, -barHalf
  );

  // Synaptic face
  vertex(rBar, -barHalf);
  quadraticVertex(0, -barHalf, 0, -barHalf + rBar);
  vertex(0, barHalf - rBar);
  quadraticVertex(0, barHalf, rBar, barHalf);

  // Bottom bar
  vertex(barThick / 2 - rBar, barHalf);
  quadraticVertex(
    barThick / 2, barHalf,
    barThick / 2, barHalf - rBar
  );

  // Stem exit
  vertex(barThick / 2, stemHalf);
  vertex(STEM_FAR, stemHalf);

  endShape(CLOSE);
  pop();
}
