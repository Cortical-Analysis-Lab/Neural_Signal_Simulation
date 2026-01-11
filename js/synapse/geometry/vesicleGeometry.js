console.log("🧬 vesicleGeometry loaded — FUSION KNIFE OCCLUSION");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// VISUAL STRATEGY:
// • Vesicle slides OVER membrane
// • Fusion plane acts as a visual "knife"
// • Cleft-facing hemisphere is clipped
// • Vesicle interior fill covers membrane
// • Geometry erases ONLY after full traversal
//
// =====================================================


// -----------------------------------------------------
// SAFETY: DEFINE FUSION PLANE IF MISSING
// -----------------------------------------------------
if (window.SYNAPSE_FUSION_PLANE_X == null) {
  window.SYNAPSE_FUSION_PLANE_X =
    window.SYNAPSE_VESICLE_STOP_X -
    window.SYNAPSE_VESICLE_RADIUS * 1.65;
}


// -----------------------------------------------------
// COLORS (PURE VISUAL)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor(alpha = 80) {
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

  if (typeof window.drawVesiclePoolsDebug === "function") {
    window.drawVesiclePoolsDebug();
  }

  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();

  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES — TRUE KNIFE OCCLUSION
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const knifeX  = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    // =================================================
    // MEMBRANE MERGE — SPATIAL ERASURE
    // =================================================
    if (v.state === "MEMBRANE_MERGE") {

      const crossFrac =
        (knifeX - (v.x - r)) / (2 * r);

      // Fully erased → draw NOTHING
      if (crossFrac >= 1) continue;

      const visibleFrac = constrain(1 - crossFrac, 0, 1);
      const theta = HALF_PI * visibleFrac;

      // ---- INTERIOR (covers membrane) ----
      noStroke();
      fill(vesicleFillColor(90 * visibleFrac));

      beginShape();
      for (let a = -theta; a <= theta; a += 0.06) {
        vertex(
          v.x + cos(a) * r,
          v.y + sin(a) * r
        );
      }
      vertex(v.x - r, v.y);
      endShape(CLOSE);

      // ---- MEMBRANE OUTLINE ----
      stroke(vesicleBorderColor());
      strokeWeight(
        lerp(strokeW, strokeW * 0.25, crossFrac)
      );
      noFill();

      beginShape();
      for (let a = -theta; a <= theta; a += 0.06) {
        vertex(
          v.x + cos(a) * r,
          v.y + sin(a) * r
        );
      }
      endShape();

      continue;
    }

    // =================================================
    // NORMAL VESICLE
    // =================================================
    stroke(vesicleBorderColor());
    strokeWeight(strokeW);
    fill(vesicleFillColor());
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS — ERASE WITH VESICLE
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r      = window.SYNAPSE_VESICLE_RADIUS;
  const knifeX = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;

    if (v.state === "MEMBRANE_MERGE") {

      const crossFrac =
        (knifeX - (v.x - r)) / (2 * r);

      if (crossFrac >= 1) continue;

      const alpha = 255 * (1 - crossFrac);
      fill(ntFillColor(alpha));
      noStroke();

      for (const p of v.nts) {
        circle(v.x + p.x, v.y + p.y, 3);
      }

      continue;
    }

    // Normal
    fill(ntFillColor());
    noStroke();
    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES (STRICTLY PRESYNAPTIC)
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
// DEBUG: VESICLE CENTERS
// -----------------------------------------------------
window.drawVesicleCenters = function () {
  push();
  fill(255, 0, 0);
  noStroke();
  for (const v of window.synapseVesicles || []) {
    if (Number.isFinite(v.x) && Number.isFinite(v.y)) {
      circle(v.x, v.y, 4);
    }
  }
  pop();
};


// -----------------------------------------------------
// EXPORT
// -----------------------------------------------------
window.drawSynapseVesicleGeometry = drawSynapseVesicleGeometry;
