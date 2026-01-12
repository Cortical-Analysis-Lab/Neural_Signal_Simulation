console.log("🧬 vesicleGeometry loaded — HARD ERASE + OPTIONAL CLIP");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// FINAL RULES (LOCKED):
// • Vesicle drawn as full circle
// • Alpha fades strictly with v.flatten
// • Vesicle ERASES when v.flatten >= 1
// • Geometry NEVER infers biology or position
// • Geometry MAY honor externally-provided clipX
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
// VESICLE MEMBRANES — ERASE + OPTIONAL CLIP
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    // ---------------------------------------------
    // FUSING / MERGING
    // ---------------------------------------------
    if (v.state === "FUSING" || v.state === "MEMBRANE_MERGE") {

      // 🔑 Absolute erase
      if (v.flatten >= 1) continue;

      const fade = constrain(1 - v.flatten, 0, 1);

      push();

      // 🔪 OPTIONAL CLIP (AUTHORITATIVE FROM BIOLOGY)
      if (Number.isFinite(v.clipX)) {
        clip(
          -width,
          -height,
          v.clipX + width,
          height * 2
        );
      }

      stroke(vesicleBorderColor());
      strokeWeight(
        lerp(strokeW, strokeW * 0.25, v.flatten)
      );
      fill(vesicleFillColor(90 * fade));

      ellipse(v.x, v.y, r * 2);

      pop();
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
// NEUROTRANSMITTER CONTENTS — MATCH CLIP
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;

    if (v.state === "FUSING" || v.state === "MEMBRANE_MERGE") {

      if (v.flatten >= 1) continue;

      const fade = constrain(1 - v.flatten, 0, 1);

      push();

      if (Number.isFinite(v.clipX)) {
        clip(
          -width,
          -height,
          v.clipX + width,
          height * 2
        );
      }

      fill(ntFillColor(255 * fade));
      noStroke();

      for (const p of v.nts) {
        circle(v.x + p.x, v.y + p.y, 3);
      }

      pop();
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
// PRIMING PARTICLES (STRICTLY PRESYNAPTIC)
// -----------------------------------------------------
function drawPrimingParticles() {

  const ALLOWED = new Set(["PRIMING", "PRIMED", "LOADING"]);

  // H⁺
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

  // ATP / ADP + Pi
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
