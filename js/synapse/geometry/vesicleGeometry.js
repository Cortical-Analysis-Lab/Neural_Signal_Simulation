console.log("🧬 vesicleGeometry loaded — HARD ERASE FIXED");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// FINAL RULES (LOCKED):
// • Vesicle drawn as full circle
// • Alpha fades strictly with v.flatten
// • Vesicle ERASES when v.flatten >= 1
// • Geometry NEVER infers biology or position
//
// =====================================================


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
// VESICLE MEMBRANES — AUTHORITATIVE ERASE
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    // -------------------------------------------------
    // MEMBRANE MERGE — HARD ERASE (SINGLE SOURCE OF TRUTH)
    // -------------------------------------------------
    if (v.state === "MEMBRANE_MERGE" || v.state === "FUSING") {

      // 🔑 ABSOLUTE KILL CONDITION
      if (v.flatten >= 1) {
        continue;
      }

      const fade = constrain(1 - v.flatten, 0, 1);

      stroke(vesicleBorderColor());
      strokeWeight(
        lerp(strokeW, strokeW * 0.25, v.flatten)
      );
      fill(vesicleFillColor(90 * fade));

      ellipse(v.x, v.y, r * 2);
      continue;
    }

    // -------------------------------------------------
    // NORMAL VESICLE
    // -------------------------------------------------
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

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;

    // -------------------------------------------------
    // FUSING / MERGING — FADE WITH FLATTEN
    // -------------------------------------------------
    if (v.state === "MEMBRANE_MERGE" || v.state === "FUSING") {

      if (v.flatten >= 1) continue;

      const fade = constrain(1 - v.flatten, 0, 1);

      fill(ntFillColor(255 * fade));
      noStroke();

      for (const p of v.nts) {
        circle(v.x + p.x, v.y + p.y, 3);
      }
      continue;
    }

    // -------------------------------------------------
    // NORMAL
    // -------------------------------------------------
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
// EXPORT
// -----------------------------------------------------
window.drawSynapseVesicleGeometry = drawSynapseVesicleGeometry;
