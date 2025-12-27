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
function getTNeuronOutlinePath(dir = 1, steps = 120) {

  const barHalf  = 140;
  const barThick = 340;
  const rBar     = min(80, barHalf);

  const cx = (barThick / 2 - rBar);
  const cyTop = -barHalf + rBar;
  const cyBot =  barHalf - rBar;

  const path = [];

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const a = TWO_PI * t;

    let x, y;

    // ---- Upper semicircle
    if (a < PI) {
      x = cx + cos(a + PI) * rBar;
      y = cyTop + sin(a + PI) * rBar;
    }
    // ---- Lower semicircle
    else {
      x = cx + cos(a) * rBar;
      y = cyBot + sin(a) * rBar;
    }

    path.push({ x: x * dir, y });
  }

  return path;
}
