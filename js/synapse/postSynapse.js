console.log("🟡 postSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// POSTSYNAPTIC NEURON — GEOMETRY + CONSTRAINT AUTHORITY
// =====================================================
//
// 🔒 CONTRACT (LOCKED):
// • Owns postsynaptic membrane geometry
// • Owns NT constraint surface (membrane-normal)
// • NO physics integration here
// • synapticBurst.js MUST query this file
//
// This mirrors preSynapse.js exactly.
//
// =====================================================


// -----------------------------------------------------
// POSTSYNAPTIC NT STOP PLANE (AUTHORITATIVE)
// -----------------------------------------------------
//
// This is analogous to SYNAPSE_FUSION_PLANE_X
// • NOT a world X
// • Offset along membrane normal
// • Used ONLY by synapticBurst.js
//
window.POSTSYNAPSE_NT_STOP_X = 0;


// -----------------------------------------------------
// DRAW — POSTSYNAPTIC NEURON (GEOMETRY ONLY)
// -----------------------------------------------------
function drawPostSynapse() {
  push();

  // Faces synaptic cleft (LEFT)
  scale(+1, 1);

  // Authoritative neuron geometry
  drawTNeuronShape(+1);

  // Postsynaptic density (visual only)
  push();
  translate(8, 0);
  drawPSDReceptors();
  pop();

  pop();
}


// =====================================================
// 🔑 POSTSYNAPTIC MEMBRANE SURFACE SAMPLER (AUTHORITATIVE)
// =====================================================
//
// MUST match neuronShape.js exactly
// Returns membrane-normal X at Y
//
// NTs, receptors, and future plasticity depend on this
//
window.getPostSynapticMembraneX = function (y) {

  const barHalf = 140;
  const rBar    = 80;

  // ---------------- Top rounded corner ----------------
  if (y < -barHalf + rBar) {
    const dy = y + barHalf - rBar;
    return rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------- Bottom rounded corner ----------------
  if (y > barHalf - rBar) {
    const dy = y - (barHalf - rBar);
    return rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------- Flat synaptic face ----------------
  return 0;
};


// =====================================================
// 🔵 DEBUG DRAW — POSTSYNAPTIC MEMBRANE (GEOMETRY)
// =====================================================
//
// • Cyan dashed line
// • Visual reference ONLY
// • No physics meaning
//
function drawPostSynapseBoundaryDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const H    = 140;
  const step = 4;

  push();
  stroke(80, 220, 255, 200);
  strokeWeight(2);
  noFill();

  drawingContext.setLineDash([6, 6]);

  beginShape();
  for (let y = -H; y <= H; y += step) {
    const x = window.getPostSynapticMembraneX(y);
    vertex(x, y);
  }
  endShape();

  drawingContext.setLineDash([]);
  pop();
}


// =====================================================
// 🟠 DEBUG DRAW — NT CONSTRAINT PLANE (PHYSICS TRUTH)
// =====================================================
//
// • EXACT surface used by synapticBurst.js
// • Curvature-aware
// • No slab possible
//
function drawPostSynapseNTStopPlaneDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const H    = 140;
  const step = 4;

  push();
  stroke(255, 160, 40, 220);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let y = -H; y <= H; y += step) {
    const membraneX = window.getPostSynapticMembraneX(y);
    vertex(
      membraneX + window.POSTSYNAPSE_NT_STOP_X,
      y
    );
  }
  endShape();

  pop();
}


// -----------------------------------------------------
// 🔒 SANITY CHECK
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 postSynapse contract: GEOMETRY + NT CONSTRAINT AUTHORITY");
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.drawPostSynapse = drawPostSynapse;
window.drawPostSynapseBoundaryDebug = drawPostSynapseBoundaryDebug;
window.drawPostSynapseNTStopPlaneDebug =
  drawPostSynapseNTStopPlaneDebug;
