console.log("🧬 vesicleGeometry loaded — HARD ERASE FIXED");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// FINAL RULES:
// • Vesicle drawn as full circle
// • Alpha fades as center crosses fusion plane
// • Vesicle ERASES once center passes knife − radius
//
// =====================================================


// -----------------------------------------------------
// SAFETY: DEFINE FUSION PLANE
// -----------------------------------------------------
if (window.SYNAPSE_FUSION_PLANE_X == null) {
  window.SYNAPSE_FUSION_PLANE_X =
    window.SYNAPSE_VESICLE_STOP_X -
    window.SYNAPSE_VESICLE_RADIUS * 1.65;
}


// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor(alpha = 90) {
  return color(245, 225, 140, alpha);
}

function ntFillColor(alpha = 255) {
  return color(185, 120, 255, alpha);
}

function protonColor() {
  return color(255, 90, 90);
}

function atpColor(alpha = 255) {
  return color(120, 200, 255, alpha);
}


// -----------------------------------------------------
// MAIN DRAW ENTRY
// -----------------------------------------------------
function drawSynapseVesicleGeometry() {
  push();
  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();
  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES — CORRECT ERASE LOGIC
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const knifeX  = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    // ---------------------------------------------
    // MEMBRANE MERGE — HARD ERASE CONDITION
    // ---------------------------------------------
    if (v.state === "MEMBRANE_MERGE") {

      // ✅ THIS IS THE FIX
      if (v.x < knifeX - r) continue;

      // Fade as center crosses knife
      const fadeFrac = constrain(
        (v.x - knifeX + r) / (2 * r),
        0,
        1
      );

      stroke(vesicleBorderColor());
      strokeWeight(lerp(strokeW, strokeW * 0.25, 1 - fadeFrac));
      fill(vesicleFillColor(90 * fadeFrac));

      ellipse(v.x, v.y, r * 2);
      continue;
    }

    // ---------------------------------------------
    // NORMAL VESICLE
    // ---------------------------------------------
    stroke(vesicleBorderColor());
    strokeWeight(strokeW);
    fill(vesicleFillColor());
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS — MATCH ERASE
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r      = window.SYNAPSE_VESICLE_RADIUS;
  const knifeX = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;

    if (v.state === "MEMBRANE_MERGE") {

      if (v.x < knifeX - r) continue;

      const fadeFrac = constrain(
        (v.x - knifeX + r) / (2 * r),
        0,
        1
      );

      fill(ntFillColor(255 * fadeFrac));
      noStroke();

      for (const p of v.nts) {
        circle(v.x + p.x, v.y + p.y, 3);
      }
      continue;
    }

    fill(ntFillColor());
    noStroke();
    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES
// -----------------------------------------------------
function drawPrimingParticles() {

  const ALLOWED = new Set(["PRIMING", "PRIMED", "LOADING"]);

  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {
    if (!h.target || !ALLOWED.has(h.target.state)) continue;
    push();
    translate(h.x, h.y);
    rotate(-PI);
    text("H⁺", 0, 0);
    pop();
  }

  textSize(10);
  for (const a of window.synapseATP || []) {
    if (!a.target || !ALLOWED.has(a.target.state)) continue;
    fill(atpColor(a.alpha ?? 255));
    push();
    translate(a.x, a.y);
    rotate(-PI);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", 0, 0);
    pop();
  }
}


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.drawSynapseVesicleGeometry = drawSynapseVesicleGeometry;
