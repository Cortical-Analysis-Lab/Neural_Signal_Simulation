console.log("🟡 postSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// POSTSYNAPTIC NEURON — GEOMETRY ONLY
// =====================================================
//
// 🔒 HARD CONTRACT (LOCKED):
// • Owns postsynaptic membrane GEOMETRY
// • Exposes membrane sampler (local geometry space)
// • Draws neuron body + PSD
// • Provides debug visualization ONLY
//
// 🚫 THIS FILE MUST NOT:
// • Apply NT constraints
// • Define stop planes
// • Modify NT motion
// • Perform physics
//
// NT confinement is owned by cleftGeometry.js
//
// =====================================================


// -----------------------------------------------------
// DRAW — POSTSYNAPTIC NEURON (LOCAL SPACE)
// -----------------------------------------------------
//
// Coordinate system:
// • Local to SynapseView
// • +X faces AWAY from cleft
// • −X faces INTO cleft
//
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
// 🔑 POSTSYNAPTIC MEMBRANE SAMPLER (GEOMETRY ONLY)
// =====================================================
//
// MUST match neuronShape.js EXACTLY
//
// Returns:
// • membrane-normal X at given local Y
//
// Used by:
// • cleftGeometry.js (boundary construction)
// • Debug visualization
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
// • Cyan dashed curve
// • Visual reference ONLY
// • NOT a constraint
//
function drawPostSynapseBoundaryDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;
  if (typeof window.getPostSynapticMembraneX !== "function") return;

  const H    = 140;
  const step = 4;

  push();
  stroke(80, 220, 255, 200);
  strokeWeight(2);
  noFill();

  drawingContext.setLineDash([6, 6]);

  beginShape();
  for (let y = -H; y <= H; y += step) {
    vertex(
      window.getPostSynapticMembraneX(y),
      y
    );
  }
  endShape();

  drawingContext.setLineDash([]);
  pop();
}


// -----------------------------------------------------
// 🔒 SANITY CHECK — CONTRACT LOCK
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 postSynapse contract: GEOMETRY ONLY (cleft-ready)");
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.drawPostSynapse = drawPostSynapse;
window.drawPostSynapseBoundaryDebug = drawPostSynapseBoundaryDebug;
