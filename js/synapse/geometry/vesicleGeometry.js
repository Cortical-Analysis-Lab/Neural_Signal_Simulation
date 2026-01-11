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
// • Disappears only after full traversal
//
// =====================================================


// -----------------------------------------------------
// SAFETY: DEFINE FUSION PLANE IF MISSING
// -----------------------------------------------------
if (window.SYNAPSE_FUSION_PLANE_X == null) {
  window.SYNAPSE_FUSION_PLANE_X =
    window.SYNAPSE_VESICLE_STOP_X +
    window.SYNAPSE_VESICLE_RADIUS * 0.65;
}


// -----------------------------------------------------
// COLORS (PURE VISUAL)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor(alpha = 70) {
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
// VESICLE MEMBRANES — INTERIOR OCCLUSION MODEL
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const knifeX  = window.SYNAPSE_FUSION_PLANE_X;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    let fillAlpha = 40;
    if (v.state === "PRIMING" || v.state === "LOADING") fillAlpha = 70;
    if (v.state === "LOADED") fillAlpha = 95;

    // =================================================
    // MEMBRANE MERGE — OCCLUSION + INTERIOR FILL
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && Number.isFinite(v.flatten)) {

      const t = constrain(v.flatten, 0, 1);

      // How far vesicle has crossed the knife
      const penetration = max(0, knifeX - (v.x - r));

      const eatenFrac = constrain(
        penetration / (2 * r),
        0,
        1
      );

      const clipX = v.x + r - eatenFrac * 2 * r;

      // ---- INTERIOR FILL (COVERS MEMBRANE) ----
      noStroke();
      fill(vesicleFillColor(85));

      beginShape();
      for (let a = -HALF_PI; a <= HALF_PI; a += 0.08) {
        const px = v.x + cos(a) * r;
        const py = v.y + sin(a) * r;
        if (px <= clipX) vertex(px, py);
      }
      vertex(v.x - r, v.y);
      endShape(CLOSE);

      // ---- MEMBRANE OUTLINE (REMAINING ARC) ----
      stroke(vesicleBorderColor());
      strokeWeight(lerp(strokeW, strokeW * 0.3, t));
      noFill();

      beginShape();
      for (let a = -HALF_PI; a <= HALF_PI; a += 0.08) {
        const px = v.x + cos(a) * r;
        const py = v.y + sin(a) * r;
        if (px <= clipX) vertex(px, py);
      }
      endShape();

      continue;
    }

    // =================================================
    // NORMAL VESICLE
    // =================================================
    stroke(vesicleBorderColor());
    strokeWeight(strokeW);
    fill(vesicleFillColor(fillAlpha));
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS — EXPOSED LUMEN
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r      = window.SYNAPSE_VESICLE_RADIUS;
  const knifeX = window.SYNAPSE_FUSION_PLANE_X;

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;

    // -------------------------------------------------
    // MEMBRANE MERGE — CONTENTS EXPOSED
    // -------------------------------------------------
    if (v.state === "MEMBRANE_MERGE") {

      for (const p of v.nts) {
        const px = v.x + p.x;
        if (px <= knifeX) {
          circle(px, v.y + p.y, 3);
        }
      }
      continue;
    }

    // -------------------------------------------------
    // NORMAL
    // -------------------------------------------------
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

  // --- H⁺ ---
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

  // --- ATP / ADP + Pi ---
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
// OPTIONAL DEBUG: VESICLE CENTERS
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
