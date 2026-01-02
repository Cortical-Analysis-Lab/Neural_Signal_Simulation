console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING
// =====================================================
//
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
// COLORS (PURE VISUAL)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor(alpha = 40) {
  return color(245, 225, 140, alpha);
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

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;

  strokeWeight(strokeW);

  for (const v of vesicles) {

    // Defensive guard
    if (v.x == null || v.y == null) continue;

    // Subtle visual cue for loading states
    let fillAlpha = 40;
    if (v.state === "priming" || v.state === "loading") {
      fillAlpha = 70;
    } else if (v.state === "loaded") {
      fillAlpha = 95;
    }

    stroke(vesicleBorderColor());
    fill(vesicleFillColor(fillAlpha));
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!v.nts || v.nts.length === 0) continue;
    if (v.x == null || v.y == null) continue;

    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES (H⁺, ATP, ADP + Pi)
// -----------------------------------------------------
function drawPrimingParticles() {

  const vesicles = window.synapseVesicles || [];

  // -------- H⁺ --------
  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {

    // Skip orphaned particles
    if (!vesicles.includes(h.target)) continue;

    text("H⁺", h.x, h.y);
  }

  // -------- ATP / ADP + Pi --------
  textSize(10);
  textAlign(CENTER, CENTER);

  for (const a of window.synapseATP || []) {

    if (!vesicles.includes(a.target)) continue;

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
    if (v.x != null && v.y != null) {
      circle(v.x, v.y, 4);
    }
  }
  pop();
};
