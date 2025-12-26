console.log("🔬 SynapseView — TRUE rotated T neurons (short stem, wide bar)");

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
// TRUE CAPITAL T (ROTATED) — MODIFIED GEOMETRY
// =====================================================
function drawTNeuron(x, y, dir) {
  push();
  translate(x, y);
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  // ---- UPDATED DIMENSIONS ----
  const stemLength = 180;   // ↓ 2× shorter
  const stemHalf   = 40;

  const barHalf    = 700;   // ↑ 5× wider
  const barThick   = 60;

  beginShape();

  // Stem (neurite)
  vertex(stemLength, -stemHalf);
  vertex(barThick / 2, -stemHalf);
  vertex(barThick / 2, -barHalf);

  // Synaptic face (wide vertical bar)
  vertex(0, -barHalf);
  vertex(0, +barHalf);

  // Bottom return
  vertex(barThick / 2, +barHalf);
  vertex(barThick / 2, +stemHalf);
  vertex(stemLength, +stemHalf);

  endShape(CLOSE);

  pop();
}
