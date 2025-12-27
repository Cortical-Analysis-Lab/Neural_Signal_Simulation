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

function getTNeuronOutlinePath(dir = 1, resolution = 6) {

  const STEM_FAR  = 2000;
  const stemHalf = 40;
  const barHalf  = 140;
  const barThick = 340;
  const rBar     = min(80, barHalf);

  const path = [];

  function add(x, y) {
    path.push({ x: x * dir, y });
  }

  function arc(cx, cy, r, a0, a1) {
    for (let a = a0; a <= a1; a += (a1 - a0) / resolution) {
      add(cx + cos(a) * r, cy + sin(a) * r);
    }
  }

  // ---- Stem top
  add(STEM_FAR, -stemHalf);
  add(barThick / 2, -stemHalf);

  // ---- Top right corner
  arc(barThick / 2 - rBar, -barHalf + rBar, rBar, -HALF_PI, PI);

  // ---- Synaptic face
  add(0, -barHalf + rBar);
  add(0, barHalf - rBar);

  // ---- Bottom left corner
  arc(rBar, barHalf - rBar, rBar, PI, HALF_PI);

  // ---- Bottom bar
  add(barThick / 2 - rBar, barHalf);
  add(barThick / 2, barHalf - rBar);

  // ---- Stem bottom
  add(barThick / 2, stemHalf);
  add(STEM_FAR, stemHalf);

  return path;
}

