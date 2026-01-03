console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING
// =====================================================
//
// RESPONSIBILITIES:
// • Draw vesicle membranes
// • Draw neurotransmitter contents
// • Draw priming particles (H⁺, ATP, ADP+Pi)
// • Visualize membrane fusion + merge
//
// NON-RESPONSIBILITIES:
// ✘ Motion
// ✘ State transitions
// ✘ Constraints
// ✘ Chemistry logic
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
// VESICLE MEMBRANES (SEALED → OPEN → COLLAPSED)
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const membraneX = window.SYNAPSE_VESICLE_STOP_X;

  strokeWeight(strokeW);
  stroke(vesicleBorderColor());

  for (const v of vesicles) {

    if (v.x == null || v.y == null) continue;

    // -------------------------------
    // FILL OPACITY BY STATE
    // -------------------------------
    let fillAlpha = 40;
    if (v.state === "priming" || v.state === "loading") fillAlpha = 70;
    if (v.state === "loaded") fillAlpha = 95;

    fill(vesicleFillColor(fillAlpha));

    // =================================================
    // MEMBRANE MERGE — BIOLOGICALLY CORRECT
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && v.flatten != null) {

      const t = constrain(v.flatten, 0, 1);

      // ---- vesicle collapses INTO membrane (no gap)
      const centerX = membraneX - r * (1 - t);

      // ---- lumen opens only AFTER halfway
      const openFrac =
        t < 0.5 ? 0 : map(t, 0.5, 1.0, 0, 1);

      // ---- opening faces synaptic cleft only
      const openAngle = lerp(0.01, PI, openFrac);

      // ---- thinning membrane as it merges
      strokeWeight(lerp(strokeW, strokeW * 0.35, t));

      noFill();
      arc(
        centerX,
        v.y,
        r * 2,
        r * 2,
        -openAngle,
        openAngle
      );

      continue;
    }

    // =================================================
    // NORMAL VESICLE
    // =================================================
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

    // =================================================
    // MERGE — SEALED → OPEN LUMEN
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && v.flatten != null) {

      // First half: sealed vesicle
      if (v.flatten < 0.5) {
        for (const p of v.nts) {
          circle(v.x + p.x, v.y + p.y, 3);
        }
      }
      // Second half: lumen open to cleft
      else {
        const spill = map(v.flatten, 0.5, 1.0, 0, 12);
        for (const p of v.nts) {
          circle(
            v.x + p.x + spill,
            v.y + p.y,
            3
          );
        }
      }
      continue;
    }

    // =================================================
    // NORMAL CONTENTS
    // =================================================
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
