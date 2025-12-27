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
const NEURON_WORLD_Y_OFFSET = -40; // ↑ visibly raise neurons

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

  // Astrocyte stays fixed
  drawAstrocyticEndfoot();

  // Neurons move independently
  drawTNeuron(+140, 90, +1);  // ↑ closer to astrocyte
  drawTNeuron(-140, 90, -1);

  pop();
}


// =====================================================
// ASTROCYTE — TRUE NUB-FREE PATH
// (NO endShape(CLOSE))
// =====================================================
function drawAstrocyticEndfoot() {
  push();
  translate(0, -100);

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

  // Explicit smooth return (no CLOSE join)
  curveVertex(-220, -30);
  curveVertex(-200, -10);

  endShape(); // 🚫 NO CLOSE

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

  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);
  vertex(barThick / 2, -barHalf + rBar);

  quadraticVertex(
    barThick / 2, -barHalf,
    barThick / 2 - rBar, -barHalf
  );

  vertex(rBar, -barHalf);

  quadraticVertex(0, -barHalf, 0, -barHalf + rBar);
  vertex(0, barHalf - rBar);
  quadraticVertex(0, barHalf, rBar, barHalf);

  vertex(barThick / 2 - rBar, barHalf);

  quadraticVertex(
    barThick / 2, barHalf,
    barThick / 2, barHalf - rBar
  );

  vertex(barThick / 2, stemHalf);
  vertex(STEM_FAR, stemHalf);

  endShape(CLOSE);
  pop();
}
