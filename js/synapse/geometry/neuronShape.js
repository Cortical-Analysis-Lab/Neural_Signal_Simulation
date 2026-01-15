console.log("🧠 neuronShape.js loaded — SCALED GEOMETRY");

// =====================================================
// PURE NEURON SHAPE — GEOMETRY ONLY (AUTHORITATIVE)
// Used by preSynapse.js and postSynapse.js
// =====================================================
//
// ✔ SAFE to scale
// ✔ NO vesicle logic here
// ✔ NO world transforms
// ✔ Membrane shape matches getSynapticMembraneX()
//
// =====================================================


// -----------------------------------------------------
// 🔑 AUTHORITATIVE GEOMETRY SCALE
// -----------------------------------------------------
window.NEURON_GEOMETRY_SCALE = 2.5;


// -----------------------------------------------------
// DRAW NEURON SHAPE (SCALED)
// -----------------------------------------------------
function drawTNeuronShape(dir = 1) {

  push();

  // 🔑 Scale ONLY geometry (vesicles are membrane-relative)
  scale(
    dir * window.NEURON_GEOMETRY_SCALE,
    window.NEURON_GEOMETRY_SCALE
  );

  stroke(...window.COLORS?.neuron ?? [245, 225, 140]);
  fill(245, 225, 140, 35);

  const STEM_FAR  = 2000;
  const stemHalf = 40;
  const barHalf  = 140;
  const barThick = 340;
  const rBar     = min(80, barHalf);

  beginShape();

  // ---------------- Stem (open) ----------------
  vertex(STEM_FAR, -stemHalf);
  vertex(barThick / 2, -stemHalf);
  vertex(barThick / 2, -barHalf + rBar);

  // ---------------- Top bar ----------------
  quadraticVertex(
    barThick / 2, -barHalf,
    barThick / 2 - rBar, -barHalf
  );

  // ---------------- Synaptic face (AUTHORITATIVE) ----------------
  vertex(rBar, -barHalf);
  quadraticVertex(0, -barHalf, 0, -barHalf + rBar);
  vertex(0, barHalf - rBar);
  quadraticVertex(0, barHalf, rBar, barHalf);

  // ---------------- Bottom bar ----------------
  vertex(barThick / 2 - rBar, barHalf);
  quadraticVertex(
    barThick / 2, barHalf,
    barThick / 2, barHalf - rBar
  );

  // ---------------- Stem exit ----------------
  vertex(barThick / 2, stemHalf);
  vertex(STEM_FAR, stemHalf);

  endShape(CLOSE);
  pop();
}


// -----------------------------------------------------
// MEMBRANE SURFACE SAMPLER (SCALED)
// -----------------------------------------------------
//
// 🔑 MUST match drawTNeuronShape() exactly
// Vesicles, fusion, recycling, NT release depend on this
//
// -----------------------------------------------------
window.getSynapticMembraneX = function (y) {

  const S = window.NEURON_GEOMETRY_SCALE;

  // Convert to unscaled geometry space
  const yLocal = y / S;

  const barHalf = 140;
  const rBar    = 80;

  let xLocal;

  // ---------------- Top rounded corner ----------------
  if (yLocal < -barHalf + rBar) {
    const dy = yLocal + barHalf - rBar;
    xLocal = rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------- Bottom rounded corner ----------------
  else if (yLocal > barHalf - rBar) {
    const dy = yLocal - (barHalf - rBar);
    xLocal = rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------- Flat synaptic face ----------------
  else {
    xLocal = 0;
  }

  // Convert back to scaled space
  return xLocal * S;
};
