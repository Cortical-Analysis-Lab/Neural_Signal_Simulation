console.log("🟡 postSynapse loaded");

// =====================================================
// POSTSYNAPTIC NEURON — GEOMETRY ONLY (HARD CONTRACT)
// =====================================================
//
// 🔒 CONTRACT (ENFORCED):
// • DRAWING ONLY — NO PHYSICS
// • NO COLLISION LOGIC
// • NO BOUNDARY SAMPLERS (FOR PHYSICS)
// • NO POSITIONING / TRANSLATION INTO WORLD SPACE
// • NO SIDE EFFECTS
//
// ✅ DEBUG VISUALIZATION IS ALLOWED
//
// =====================================================


// -----------------------------------------------------
// 🔐 EXPLICIT PHYSICS DISABLE FLAG
// -----------------------------------------------------
window.POSTSYNAPSE_HAS_PHYSICS = false;


// -----------------------------------------------------
// DRAW — POSTSYNAPTIC NEURON (LOCAL SPACE ONLY)
// -----------------------------------------------------
function drawPostSynapse() {
  push();

  // Faces synaptic cleft (LEFT)
  scale(+1, 1);

  // Neuron body (pure geometry)
  drawTNeuronShape(+1);

  // Postsynaptic density (visual only)
  push();
  translate(8, 0);
  drawPSDReceptors();
  pop();

  pop();
}


// =====================================================
// 🟦 DEBUG DRAW — POSTSYNAPTIC MEMBRANE (VISUAL ONLY)
// =====================================================
//
// • Geometry-derived
// • NO physics meaning
// • Matches neuronShape.js exactly
// • Safe to compare against NT paths
//
// =====================================================
function drawPostSynapseBoundaryDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;
  if (typeof window.getSynapticMembraneX !== "function") return;

  const H    = 140;
  const step = 4;

  push();
  stroke(80, 220, 255, 200);   // cyan
  strokeWeight(2);
  noFill();

  // Dashed appearance (visual cue: NOT a constraint)
  drawingContext.setLineDash([6, 6]);

  beginShape();
  for (let y = -H; y <= H; y += step) {
    const x = window.getSynapticMembraneX(y);
    vertex(x, y);
  }
  endShape();

  drawingContext.setLineDash([]);
  pop();
}


// -----------------------------------------------------
// 🔒 SANITY CHECK (DEV MODE ONLY)
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 postSynapse contract: GEOMETRY ONLY (debug draw allowed)");
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.drawPostSynapse = drawPostSynapse;
window.drawPostSynapseBoundaryDebug = drawPostSynapseBoundaryDebug;
