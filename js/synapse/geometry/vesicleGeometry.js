console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// VISUAL STRATEGY (IMPORTANT):
// • Vesicle slides OVER membrane
// • Cleft-facing hemisphere disappears first
// • No real fusion — pure occlusion illusion
// • Geometry responds ONLY to v.x and v.flatten
//
// =====================================================


// -----------------------------------------------------
// COLORS (PURE VISUAL)
// -----------------------------------------------------
function vesicleBorderColor() {
  return color(245, 225, 140);
}

function vesicleFillColor(alpha = 50) {
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

  drawVesiclePoolsDebug?.();
  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();

  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES — OCCLUSION-BASED FUSION
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const dockX   = window.SYNAPSE_VESICLE_STOP_X;

  stroke(vesicleBorderColor());

  for (const v of vesicles) {

    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    let fillAlpha = 40;
    if (v.state === "PRIMING" || v.state === "LOADING") fillAlpha = 70;
    if (v.state === "LOADED") fillAlpha = 95;

    fill(vesicleFillColor(fillAlpha));

    // =================================================
    // MEMBRANE MERGE — VISUAL OCCLUSION
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && Number.isFinite(v.flatten)) {

      const t = constrain(v.flatten, 0, 1);

      // How much of vesicle is "consumed" by membrane
      const clipX = map(t, 0, 1, v.x + r, v.x - r);

      strokeWeight(lerp(strokeW, strokeW * 0.3, t));
      noFill();

      push();
      beginShape();

      // Draw only cytosolic half, progressively removed
      for (let a = -HALF_PI; a <= HALF_PI; a += 0.12) {

        const px = v.x + cos(a) * r;
        const py = v.y + sin(a) * r;

        // Skip points that have crossed membrane
        if (px > clipX) continue;

        vertex(px, py);
      }

      endShape();
      pop();

      continue;
    }

    // =================================================
    // NORMAL VESICLE
    // =================================================
    strokeWeight(strokeW);
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS — SPILL THEN DISAPPEAR
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles || [];
  if (!vesicles.length) return;

  const r = window.SYNAPSE_VESICLE_RADIUS;

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || !v.nts.length) continue;
    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    // -------------------------------------------------
    // MEMBRANE MERGE
    // -------------------------------------------------
    if (v.state === "MEMBRANE_MERGE" && Number.isFinite(v.flatten)) {

      const t = constrain(v.flatten, 0, 1);
      const spill = t < 0.4 ? 0 : map(t, 0.4, 1, 0, 20);

      for (const p of v.nts) {

        const px = v.x + p.x + spill;
        const py = v.y + p.y;

        // NTs vanish as vesicle disappears
        if (px > v.x - r * t) continue;

        circle(px, py, 3);
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

  const ALLOWED_STATES = new Set([
    "PRIMING",
    "PRIMED",
    "LOADING"
  ]);

  // --- H⁺ ---
  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {

    const v = h.target;
    if (!v || !ALLOWED_STATES.has(v.state)) continue;

    push();
    translate(h.x, h.y);
    rotate(-PI);
    text("H⁺", 0, 0);
    pop();
  }

  // --- ATP / ADP + Pi ---
  textSize(10);
  textAlign(CENTER, CENTER);

  for (const a of window.synapseATP || []) {

    const v = a.target;
    if (!v || !ALLOWED_STATES.has(v.state)) continue;

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
