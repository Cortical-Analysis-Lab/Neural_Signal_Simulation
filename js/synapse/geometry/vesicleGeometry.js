console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING
// -----------------------------------------------------
// RESPONSIBILITIES:
// • Draw vesicle membranes
// • Draw neurotransmitter contents
// • Draw priming particles (H⁺, ATP, ADP+Pi)
// • Maintain correct draw order
//
// NON-RESPONSIBILITIES:
// ✘ No motion
// ✘ No state transitions
// ✘ No membrane constraints
// ✘ No chemistry logic
// =====================================================


// -----------------------------------------------------
// REQUIRED GLOBAL SOURCES (READ-ONLY)
// -----------------------------------------------------
// window.synapseVesicles   (array of vesicles)
// window.synapseH          (H+ particles)
// window.synapseATP        (ATP / ADP particles)
//
// window.SYNAPSE_VESICLE_RADIUS
// window.SYNAPSE_VESICLE_STROKE
// -----------------------------------------------------


// -----------------------------------------------------
// COLORS (PURE VISUAL)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor() {
  return color(245, 225, 140, 40);
}

function ntFillColor() {
  return color(185, 120, 255, 210);
}

function protonColor() {
  return color(255, 90, 90);
}

function atpColor(alpha = 255) {
  return color(120, 200, 255, alpha);
}


// -----------------------------------------------------
// MAIN DRAW ENTRY POINT
// -----------------------------------------------------
function drawSynapseVesicleGeometry() {
  push();

  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();

  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES
// -----------------------------------------------------
function drawVesicleMembranes() {
  const r = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;

  strokeWeight(strokeW);
  stroke(vesicleBorderColor());
  fill(vesicleFillColor());

  for (const v of window.synapseVesicles || []) {
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS
// -----------------------------------------------------
function drawVesicleContents() {
  fill(ntFillColor());
  noStroke();

  for (const v of window.synapseVesicles || []) {
    if (!v.nts || v.nts.length === 0) continue;

    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES (H⁺, ATP, ADP + Pi)
// -----------------------------------------------------
function drawPrimingParticles() {

  // -------- H⁺ --------
  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {
    text("H⁺", h.x, h.y);
  }

  // -------- ATP / ADP + Pi --------
  textSize(10);
  textAlign(CENTER, CENTER);

  for (const a of window.synapseATP || []) {
    fill(atpColor(a.alpha ?? 255));
    text(
      a.state === "ATP" ? "ATP" : "ADP + Pi",
      a.x,
      a.y
    );
  }
}


// -----------------------------------------------------
// OPTIONAL DEBUG HELPERS (SAFE)
// -----------------------------------------------------
window.drawVesicleCenters = function () {
  push();
  fill(255, 0, 0);
  noStroke();
  for (const v of window.synapseVesicles || []) {
    circle(v.x, v.y, 4);
  }
  pop();
};
