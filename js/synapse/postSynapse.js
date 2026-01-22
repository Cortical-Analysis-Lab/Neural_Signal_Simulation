console.log("🟡 postSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// POSTSYNAPTIC NEURON — GEOMETRY ONLY
// =====================================================
//
// 🔒 HARD CONTRACT (LOCKED):
// • Owns postsynaptic membrane GEOMETRY
// • Exposes membrane sampler (geometry space)
// • Draws neuron + PSD
// • Visual debug ONLY
//
// 🚫 THIS FILE MUST NOT:
// • Apply NT constraints
// • Define stop planes
// • Modify NT motion
// • Perform physics
//
// NT constraints are owned by NTmotion.js
//
// =====================================================


// -----------------------------------------------------
// DRAW — POSTSYNAPTIC NEURON (LOCAL SPACE)
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
// 🔑 POSTSYNAPTIC MEMBRANE SAMPLER (GEOMETRY ONLY)
// =====================================================
//
// MUST match neuronShape.js exactly
// Returns membrane-normal X at local Y
//
// Used by:
// • NTmotion.js (constraints)
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
// • Cyan dashed line
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
    const x = window.getPostSynapticMembraneX(y);
    vertex(x, y);
  }
  endShape();

  drawingContext.setLineDash([]);
  pop();
}


// -----------------------------------------------------
// 🔒 SANITY CHECK
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 postSynapse contract: GEOMETRY ONLY");
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.drawPostSynapse = drawPostSynapse;
window.drawPostSynapseBoundaryDebug = drawPostSynapseBoundaryDebug;
