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
// VESICLE MEMBRANES
// Sealed → docked → omega opening → collapse
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r         = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW   = window.SYNAPSE_VESICLE_STROKE;
  const membraneX = window.SYNAPSE_VESICLE_STOP_X;

  stroke(vesicleBorderColor());

  for (const v of vesicles) {

    if (v.y == null) continue;

    // -------------------------------
    // FILL OPACITY BY STATE
    // -------------------------------
    let fillAlpha = 40;
    if (v.state === "priming" || v.state === "loading") fillAlpha = 70;
    if (v.state === "loaded") fillAlpha = 95;

    fill(vesicleFillColor(fillAlpha));

    // =================================================
    // MEMBRANE MERGE — OMEGA FUSION
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && v.flatten != null) {

      const t = constrain(v.flatten, 0, 1);

      // -------------------------------------------------
      // 🔒 HARD ANCHOR TO MEMBRANE (NO GAP EVER)
      // Vesicle center collapses INTO membrane
      // -------------------------------------------------
      const cx = membraneX - r * (1 - t);

      // -------------------------------------------------
      // OMEGA OPENING — APPEARS HALFWAY
      // Faces synaptic cleft only
      // -------------------------------------------------
      const openFrac = t < 0.5 ? 0 : map(t, 0.5, 1, 0, 1);
      const openAngle = openFrac * PI;

      // -------------------------------------------------
      // Membrane thins as lipid merges
      // -------------------------------------------------
      strokeWeight(lerp(strokeW, strokeW * 0.35, t));
      noFill();

      arc(
        cx,
        v.y,
        r * 2,
        r * 2,
        -openAngle,
        openAngle
      );

      continue;
    }

    // =================================================
    // NORMAL SEALED VESICLE
    // =================================================
    strokeWeight(strokeW);
    ellipse(v.x, v.y, r * 2);
  }
}


// -----------------------------------------------------
// NEUROTRANSMITTER CONTENTS
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r         = window.SYNAPSE_VESICLE_RADIUS;
  const membraneX = window.SYNAPSE_VESICLE_STOP_X;

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!v.nts || v.nts.length === 0) continue;
    if (v.y == null) continue;

    // =================================================
    // MEMBRANE MERGE — SEALED → OPEN LUMEN
    // =================================================
    if (v.state === "MEMBRANE_MERGE" && v.flatten != null) {

      const t = constrain(v.flatten, 0, 1);
      const cx = membraneX - r * (1 - t);

      // -------------------------------
      // First half: sealed lumen
      // -------------------------------
      if (t < 0.5) {
        for (const p of v.nts) {
          circle(cx + p.x, v.y + p.y, 3);
        }
      }
      // -------------------------------
      // Second half: lumen open to cleft
      // NT spills OUTWARD
      // -------------------------------
      else {
        const spill = map(t, 0.5, 1.0, 0, 18);
        for (const p of v.nts) {
          circle(
            cx + p.x + spill,
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
