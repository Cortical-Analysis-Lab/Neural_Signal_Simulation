console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Draw vesicle membranes
// ✔ Draw neurotransmitter contents
// ✔ Draw priming particles (H⁺, ATP, ADP + Pi)
// ✔ Visualize membrane fusion + merge
//
// NON-RESPONSIBILITIES:
// ✘ Motion
// ✘ State transitions
// ✘ Constraints
// ✘ Chemistry logic
// ✘ Pool / release ownership
//
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
// DOCK PLANE — RENDER-SPACE ONLY
// (DOES NOT CONTROL PHYSICS)
// -----------------------------------------------------
function getRenderDockX() {
  return window.__synapseFlipped
    ? -window.SYNAPSE_DOCK_X
    : window.SYNAPSE_DOCK_X;
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
// SEALED → OMEGA FUSION → COLLAPSE
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r       = window.SYNAPSE_VESICLE_RADIUS;
  const strokeW = window.SYNAPSE_VESICLE_STROKE;
  const dockX   = getRenderDockX();

  // ---------------------------------------------------
  // OPTIONAL DEBUG — TRUE DOCK PLANE (VISUAL ONLY)
  // ---------------------------------------------------
  if (window.SHOW_SYNAPSE_DEBUG) {
    push();
    stroke(0, 180, 255);
    strokeWeight(2);
    line(dockX, -300, dockX, 300);
    pop();
  }

  stroke(vesicleBorderColor());

  for (const v of vesicles) {

    if (v.x == null || v.y == null) continue;

    // -------------------------------------------------
    // FILL OPACITY BY STATE (VISUAL CUE ONLY)
    // -------------------------------------------------
    let fillAlpha = 40;
    if (v.state === "PRIMING" || v.state === "LOADING") fillAlpha = 70;
    if (v.state === "LOADED") fillAlpha = 95;

    fill(vesicleFillColor(fillAlpha));

    // =================================================
    // MEMBRANE MERGE — TRUE OMEGA FUSION (NO GAP)
    // =================================================
    if (
      v.state === "MEMBRANE_MERGE" &&
      Number.isFinite(v.flatten)
    ) {

      const t = constrain(v.flatten, 0, 1);

      // Rightmost edge is always dock plane (render-only)
      const currentR = r * (1 - t);
      const cx       = dockX - currentR;

      // Omega opening after half-merge
      const openFrac  = t < 0.5 ? 0 : map(t, 0.5, 1, 0, 1);
      const openAngle = openFrac * PI;

      strokeWeight(lerp(strokeW, strokeW * 0.35, t));
      noFill();

      arc(
        cx,
        v.y,
        currentR * 2,
        currentR * 2,
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
// NEUROTRANSMITTER CONTENTS (VESICLE-LOCAL)
// -----------------------------------------------------
function drawVesicleContents() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

  const r     = window.SYNAPSE_VESICLE_RADIUS;
  const dockX = getRenderDockX();

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || v.nts.length === 0) continue;
    if (v.x == null || v.y == null) continue;

    // =================================================
    // MEMBRANE MERGE — LUMEN OPENS
    // =================================================
    if (
      v.state === "MEMBRANE_MERGE" &&
      Number.isFinite(v.flatten)
    ) {

      const t = constrain(v.flatten, 0, 1);
      const currentR = r * (1 - t);
      const cx       = dockX - currentR;

      if (t < 0.5) {
        for (const p of v.nts) {
          circle(cx + p.x, v.y + p.y, 3);
        }
      } else {
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
// OPTIONAL DEBUG HELPERS (READ-ONLY)
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
