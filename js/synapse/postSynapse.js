console.log("🟡 postSynapse loaded");

// =====================================================
// POSTSYNAPTIC NEURON — GEOMETRY ONLY (HARD CONTRACT)
// =====================================================
//
// 🔒 CONTRACT (ENFORCED):
// • DRAWING ONLY — NO PHYSICS
// • NO COLLISION LOGIC
// • NO BOUNDARY SAMPLERS
// • NO POSITIONING / TRANSLATION INTO WORLD SPACE
// • NO SIDE EFFECTS
//
// 🚫 This file MUST NOT:
//   - define getPostSynapseBoundaryX/Y
//   - reference POST_X, CLEFT_DEPTH, membraneX
//   - interact with synapticNTs
//
// ✅ Any NT interaction MUST be implemented elsewhere
//    using explicit, sampled membrane geometry
//
// =====================================================


// -----------------------------------------------------
// 🔐 EXPLICIT PHYSICS DISABLE FLAG
// -----------------------------------------------------
// Used by synapticBurst.js to assert no hidden slabs
//
window.POSTSYNAPSE_HAS_PHYSICS = false;


// -----------------------------------------------------
// DRAW — POSTSYNAPTIC NEURON (LOCAL SPACE ONLY)
// -----------------------------------------------------
function drawPostSynapse() {
  push();

  // ---------------------------------------------------
  // ORIENTATION
  // ---------------------------------------------------
  // Faces neuron toward synaptic cleft (LEFT)
  // NOTE: SynapseView is responsible for placement
  //
  scale(+1, 1);


  // ---------------------------------------------------
  // NEURON BODY (PURE GEOMETRY)
  // ---------------------------------------------------
  // drawTNeuronShape(sign) is assumed to be:
  // • deterministic
  // • geometry-only
  // • side-effect free
  //
  drawTNeuronShape(+1);


  // ---------------------------------------------------
  // POSTSYNAPTIC DENSITY (PSD)
  // ---------------------------------------------------
  push();

  // Small inset toward synaptic cleft
  // (purely visual — NOT a boundary)
  translate(8, 0);

  drawPSDReceptors();

  pop();


  pop();
}


// -----------------------------------------------------
// 🔒 SANITY CHECK (DEV MODE ONLY)
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 postSynapse contract: GEOMETRY ONLY");
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.drawPostSynapse = drawPostSynapse;
