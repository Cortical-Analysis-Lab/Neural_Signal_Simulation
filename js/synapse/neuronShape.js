console.log("🧠 neuronShape.js loaded");

// =====================================================
// PURE NEURON SHAPE — NO WORLD TRANSFORMS
// Used by preSynapse.js and postSynapse.js
// =====================================================
function drawTNeuronShape(dir = 1) {
  push();
  scale(dir, 1);

  stroke(...window.COLORS?.neuron ?? [245, 225, 140]);
  fill(245, 225, 140, 35);

  const STEM_FAR  = 2000;
  const stemHalf = 40;
  const barHalf  = 140;
  const barThick = 340;
  const rBar     = min(80, barHalf);

  beginShape();

  // Stem (open)
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);
  vertex(barThick / 2, -barHalf + rBar);

  // Top bar
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

// =====================================================
// MEMBRANE-ONLY OUTLINE PATH (FOR VOLTAGE WAVES)
// Closed, smooth, no STEM_FAR jumps
// =====================================================
function getTNeuronOutlinePath(dir = 1, steps = 48) {

  const barHalf  = 140;
  const barThick = 340;
  const rBar     = min(80, barHalf);

  const path = [];

  function add(x, y) {
    path.push({ x: x * dir, y });
  }

  // -------------------------------
  // TOP ROUNDED MEMBRANE
  // -------------------------------
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = PI + t * PI; // left → right

    add(
      (barThick / 2 - rBar) + cos(a) * rBar,
      -barHalf + rBar + sin(a) * rBar
    );
  }

  // -------------------------------
  // SYNAPTIC FACE (VERTICAL)
  // -------------------------------
  add(0, -barHalf + rBar);
  add(0,  barHalf - rBar);

  // -------------------------------
  // BOTTOM ROUNDED MEMBRANE
  // -------------------------------
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = 0 + t * PI; // right → left

    add(
      (barThick / 2 - rBar) + cos(a) * rBar,
      barHalf - rBar + sin(a) * rBar
    );
  }

  return path;
}
