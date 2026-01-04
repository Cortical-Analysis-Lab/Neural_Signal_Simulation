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
// ✔ DEBUG: visualize vesicle pools & boundaries
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

// --- DEBUG COLORS ---
function poolBlue(alpha = 50) {
  return color(80, 160, 255, alpha);
}

function poolBlueDark(alpha = 70) {
  return color(40, 120, 220, alpha);
}

function boundaryOrange(alpha = 200) {
  return color(255, 170, 60, alpha);
}


// -----------------------------------------------------
// DOCK PLANE — RENDER-SPACE ONLY
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

  // 🔵 DEBUG POOL OVERLAY (BEHIND EVERYTHING)
  drawVesiclePoolsDebug();

  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();

  pop();
}


// -----------------------------------------------------
// DEBUG: VESICLE POOLS & BOUNDARIES (READ-ONLY)
// -----------------------------------------------------
function drawVesiclePoolsDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  push();
  rectMode(CORNERS);

  const stopX = window.SYNAPSE_VESICLE_STOP_X;

  // ---------------------------------------------------
  // RESERVE POOL (LIGHT BLUE)
  // ---------------------------------------------------
  noStroke();
  fill(poolBlue(45));
  rect(
    -120, -36,
     -40,  36
  );

  // ---------------------------------------------------
  // LOADED POOL (DARKER BLUE)
  // ---------------------------------------------------
  fill(poolBlueDark(65));
  rect(
    -40,
    -26,
     stopX,
     26
  );

  // ---------------------------------------------------
  // ORANGE BOUNDARIES (AUTHORITATIVE LIMITS)
  // ---------------------------------------------------
  noFill();
  stroke(boundaryOrange(220));
  strokeWeight(2);

  // Reserve pool boundary
  rect(
    -120, -36,
     -40,  36
  );

  // Loaded pool boundary
  rect(
    -40,
    -26,
     stopX,
     26
  );

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

  // Optional debug: true dock plane
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

    let fillAlpha = 40;
    if (v.state === "PRIMING" || v.state === "LOADING") fillAlpha = 70;
    if (v.state === "LOADED") fillAlpha = 95;

    fill(vesicleFillColor(fillAlpha));

    // -------- MEMBRANE MERGE --------
    if (
      v.state === "MEMBRANE_MERGE" &&
      Number.isFinite(v.flatten)
    ) {

      const t = constrain(v.flatten, 0, 1);
      const currentR = r * (1 - t);
      const cx       = dockX - currentR;

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

    // -------- SEALED --------
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
          circle(cx + p.x + spill, v.y + p.y, 3);
        }
      }

      continue;
    }

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

  // --- H⁺ ---
  fill(protonColor());
  textSize(12);
  textAlign(CENTER, CENTER);

  for (const h of window.synapseH || []) {
    if (!vesicles.includes(h.target)) continue;
    text("H⁺", h.x, h.y);
  }

  // --- ATP / ADP + Pi ---
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
