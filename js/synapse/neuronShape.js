console.log("🧩 tNeuronShape loaded");

// =====================================================
// ROTATED CAPITAL T — STROKE-SAFE GEOMETRY ONLY
// =====================================================
function drawTNeuronShape(dir) {
  push();
  scale(dir, 1);

  stroke(...NEURON_YELLOW);
  fill(NEURON_YELLOW[0], NEURON_YELLOW[1], NEURON_YELLOW[2], 35);

  const STEM_FAR  = 2000;
  const stemHalf = 40;
  const barHalf  = 140;
  const barThick = 340;

  const rBar = min(CORNER_RADIUS, barHalf);

  beginShape();

  // Stem (open)
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);

  // Vertical drop (no curve → no nub)
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
