console.log("🧬 vesicleGeometry loaded");

// =====================================================
// VESICLE GEOMETRY & RENDERING (READ-ONLY, WORLD SPACE)
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Draw vesicle membranes
// ✔ Draw neurotransmitter contents
// ✔ Draw priming particles (H⁺, ATP, ADP + Pi)
// ✔ Visualize membrane fusion + merge
// ✔ Optional debug overlays
//
// COORDINATE CONTRACT:
// • Presynaptic LOCAL space
// • +X → toward membrane / fusion plane
// • NO flips
// • NO transforms
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
// MAIN DRAW ENTRY POINT
// -----------------------------------------------------
function drawSynapseVesicleGeometry() {
  push();

  drawVesiclePoolsDebug();
  drawVesicleMembranes();
  drawVesicleContents();
  drawPrimingParticles();

  pop();
}


// -----------------------------------------------------
// DEBUG: VESICLE POOLS (READ-ONLY)
// -----------------------------------------------------
function drawVesiclePoolsDebug() {

  if (!window.SHOW_SYNAPSE_DEBUG) return;
  if (typeof getReservePoolRect !== "function") return;
  if (typeof getLoadedPoolRect  !== "function") return;

  const reserve = getReservePoolRect();
  const loaded  = getLoadedPoolRect();

  push();
  rectMode(CORNERS);
  noStroke();

  fill(poolBlue(45));
  rect(reserve.xMin, reserve.yMin, reserve.xMax, reserve.yMax);

  fill(poolBlueDark(65));
  rect(loaded.xMin, loaded.yMin, loaded.xMax, loaded.yMax);

  noFill();
  stroke(boundaryOrange(220));
  strokeWeight(2);

  rect(reserve.xMin, reserve.yMin, reserve.xMax, reserve.yMax);
  rect(loaded.xMin, loaded.yMin, loaded.xMax, loaded.yMax);

  stroke(255, 80, 80, 200);
  line(
    window.SYNAPSE_VESICLE_STOP_X,
    -400,
    window.SYNAPSE_VESICLE_STOP_X,
     400
  );

  pop();
}


// -----------------------------------------------------
// VESICLE MEMBRANES
// -----------------------------------------------------
function drawVesicleMembranes() {

  const vesicles = window.synapseVesicles;
  if (!Array.isArray(vesicles)) return;

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

    if (v.state === "MEMBRANE_MERGE" && Number.isFinite(v.flatten)) {

      const t = constrain(v.flatten, 0, 1);
      const currentR = r * (1 - t);
      const cx = dockX - currentR;

      const openFrac  = t < 0.5 ? 0 : map(t, 0.5, 1, 0, 1);
      const openAngle = openFrac * PI;

      strokeWeight(lerp(strokeW, strokeW * 0.35, t));
      noFill();

      arc(cx, v.y, currentR * 2, currentR * 2, -openAngle, openAngle);
      continue;
    }

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
  const dockX = window.SYNAPSE_VESICLE_STOP_X;

  fill(ntFillColor());
  noStroke();

  for (const v of vesicles) {

    if (!Array.isArray(v.nts) || v.nts.length === 0) continue;
    if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;

    if (v.state === "MEMBRANE_MERGE" && Number.isFinite(v.flatten)) {

      const t = constrain(v.flatten, 0, 1);
      const currentR = r * (1 - t);
      const cx = dockX - currentR;
      const spill = t < 0.5 ? 0 : map(t, 0.5, 1, 0, 18);

      for (const p of v.nts) {
        circle(cx + p.x + spill, v.y + p.y, 3);
      }
      continue;
    }

    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }
}


// -----------------------------------------------------
// PRIMING PARTICLES (STRICTLY PRESYNAPTIC)
// -----------------------------------------------------
function drawPrimingParticles() {

  // ONLY vesicles actively loading may show chemistry
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

    text("H⁺", h.x, h.y);
  }

  // --- ATP / ADP + Pi ---
  textSize(10);
  textAlign(CENTER, CENTER);

  for (const a of window.synapseATP || []) {

    const v = a.target;
    if (!v || !ALLOWED_STATES.has(v.state)) continue;

    fill(atpColor(a.alpha ?? 255));
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
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
