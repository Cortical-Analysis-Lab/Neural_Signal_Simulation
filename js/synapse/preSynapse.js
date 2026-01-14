console.log("🟡 preSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// PRESYNAPTIC GEOMETRY — SINGLE SOURCE OF TRUTH
// =====================================================
//
// AUTHORITATIVE SPATIAL CONTRACT:
// • Vesicle center stops at STOP_X (membrane-normal)
// • Visual fusion / occlusion occurs at FUSION_PLANE_X
// • All downstream files MUST reference these values
// • Curvature MUST match neuronShape.js exactly
//
// =====================================================


// -----------------------------------------------------
// TERMINAL GEOMETRY
// -----------------------------------------------------

window.SYNAPSE_TERMINAL_CENTER_Y = 0;
window.SYNAPSE_TERMINAL_RADIUS   = 130;


// -----------------------------------------------------
// VESICLE GEOMETRY
// -----------------------------------------------------

// Kinematic stop (vesicle center halts at membrane-normal offset)
window.SYNAPSE_VESICLE_STOP_X = 16;

// Cytosolic reserve offset (for recycling return)
window.SYNAPSE_BACK_OFFSET_X = 60;

// Vesicle dimensions
window.SYNAPSE_VESICLE_RADIUS = 10;
window.SYNAPSE_VESICLE_STROKE = 4;

// -----------------------------------------------------
// VISUAL FUSION / OCCLUSION PLANE
// -----------------------------------------------------
//
// IMPORTANT:
// • This is NOT an absolute X coordinate
// • This is an OFFSET along the membrane normal
// • Actual fusion plane position is:
//
//   membraneX(y) + SYNAPSE_FUSION_PLANE_X
//
// -----------------------------------------------------

window.SYNAPSE_FUSION_PLANE_X =
  window.SYNAPSE_VESICLE_STOP_X -
  window.SYNAPSE_VESICLE_RADIUS * 1.65;


// -----------------------------------------------------
// POPULATION
// -----------------------------------------------------

window.SYNAPSE_MAX_VESICLES = 7;


// -----------------------------------------------------
// DEBUG FLAGS
// -----------------------------------------------------

// NOTE:
// • When false, NO planes or guides are drawn
// • Geometry is still used internally
window.SHOW_SYNAPSE_DEBUG = false;


// -----------------------------------------------------
// CONSOLE VERIFICATION
// -----------------------------------------------------

console.log("▶ SYNAPSE_VESICLE_STOP_X  =", window.SYNAPSE_VESICLE_STOP_X);
console.log("▶ SYNAPSE_FUSION_PLANE_X  =", window.SYNAPSE_FUSION_PLANE_X);
console.log("▶ SYNAPSE_VESICLE_RADIUS  =", window.SYNAPSE_VESICLE_RADIUS);
console.log("▶ SYNAPSE_TERMINAL_RADIUS =", window.SYNAPSE_TERMINAL_RADIUS);


// =====================================================
// PRESYNAPTIC AP PATH (VISUAL ONLY)
// =====================================================

window.PRESYNAPTIC_AP_PATH = [
  { x: 153.1, y:  4.7 },
  { x: 170.5, y: -5.1 },
  { x: 181.1, y: -20.5 },
  { x: 200.1, y: -22.9 },
  { x: 214.9, y: -16.9 },
  { x: 219.3, y:   3.7 },
  { x: 219.7, y:  30.1 },
  { x: 215.9, y:  49.7 },
  { x: 204.7, y:  57.5 },
  { x: 186.5, y:  57.9 },
  { x: 171.9, y:  43.1 },
  { x: 170.5, y:  29.1 },
  { x: 153.5, y:  28.7 }
];

window.AP_PATH_SCALE  = 6.0;
window.AP_PATH_OFFSET = { x: -120, y: 0 };

window.calibratePath = function (path) {
  return path.map(p => ({
    x: p.x * window.AP_PATH_SCALE + window.AP_PATH_OFFSET.x,
    y: p.y * window.AP_PATH_SCALE + window.AP_PATH_OFFSET.y
  }));
};


// =====================================================
// PRESYNAPTIC DRAW (GEOMETRY ONLY)
// =====================================================
//
// RULES:
// • This file owns ALL presynaptic geometry
// • Rotation happens HERE and only here
// • Vesicles, fusion, and recycling depend on this
//
// DEBUG ADDITIONS:
// • Verifies recycling draw space
// • Confirms seed presence
// • Visual origin marker
//
// =====================================================

window.drawPreSynapse = function () {

  // -----------------------------------------------
  // DEBUG: function entry
  // -----------------------------------------------
  if (frameCount % 120 === 0) {
    console.log("🧠 drawPreSynapse() frame", frameCount);
  }

  push();

  // ---------------------------------------------------
  // CANONICAL ORIENTATION (DO NOT CHANGE)
  // ---------------------------------------------------
  rotate(PI);

  // ---------------------------------------------------
  // DEBUG: rotated origin marker
  // ---------------------------------------------------
  if (window.SHOW_SYNAPSE_DEBUG) {
    push();
    noStroke();
    fill(255, 0, 0, 180);
    circle(0, 0, 10); // MUST appear centered on terminal
    pop();
  }

  // ---------------------------------------------------
  // TERMINAL GEOMETRY (AUTHORITATIVE SHAPE)
  // ---------------------------------------------------
  drawTNeuronShape(1);

  // ---------------------------------------------------
  // DEBUG: CURVED STOP + FUSION PLANES
  // ---------------------------------------------------
  drawVesicleStopPlaneDebug();

  // ---------------------------------------------------
  // ♻️ ENDOCYTOSIS BUDDING (MEMBRANE-OWNED)
  // ---------------------------------------------------
  if (typeof drawVesicleRecycling === "function") {

    // DEBUG: seed count
    if (frameCount % 60 === 0) {
      console.log(
        "♻️ drawVesicleRecycling() called | seeds =",
        window.endocytosisSeeds?.length ?? "N/A"
      );
    }

    drawVesicleRecycling();
  } else {
    console.warn("⚠️ drawVesicleRecycling not defined");
  }

  // ---------------------------------------------------
  // VESICLES (GEOMETRY + CONTENTS)
  // ---------------------------------------------------
  drawSynapseVesicleGeometry?.();

  // ---------------------------------------------------
  // DEBUG: VESICLE CENTERS
  // ---------------------------------------------------
  if (
    window.SHOW_SYNAPSE_DEBUG &&
    typeof drawVesicleCenters === "function"
  ) {
    drawVesicleCenters();
  }

  // ---------------------------------------------------
  // TERMINAL AP (VISUAL ONLY)
  // ---------------------------------------------------
  const calibratedPath = calibratePath(window.PRESYNAPTIC_AP_PATH);
  drawTerminalAP?.(calibratedPath);

  if (window.apActive === true && window.SHOW_SYNAPSE_DEBUG) {
    drawAPDebugDots(calibratedPath);
  }

  pop();
};


// =====================================================
// DEBUG: STOP PLANE + FUSION PLANE (CURVED)
// =====================================================
//
// IMPORTANT:
// • These curves are NOT straight lines
// • They follow the membrane face exactly
// • They are visualizations ONLY
//
// =====================================================

window.DEBUG_PLANE_HEIGHT = 140;

window.drawVesicleStopPlaneDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  const H    = window.DEBUG_PLANE_HEIGHT;
  const step = 3;

  push();
  strokeWeight(2);
  noFill();

  // -------------------------
  // 🔵 Vesicle STOP curve
  // -------------------------
  stroke(80, 180, 255, 220);
  beginShape();
  for (let y = -H; y <= H; y += step) {
    const membraneX = window.getSynapticMembraneX(y);
    vertex(
      membraneX + window.SYNAPSE_VESICLE_STOP_X,
      y
    );
  }
  endShape();

  // -------------------------
  // 🔴 Fusion / knife curve
  // -------------------------
  stroke(255, 90, 90, 220);
  beginShape();
  for (let y = -H; y <= H; y += step) {
    const membraneX = window.getSynapticMembraneX(y);
    vertex(
      membraneX + window.SYNAPSE_FUSION_PLANE_X,
      y
    );
  }
  endShape();

  pop();
};


// =====================================================
// DEBUG: AP PATH DOTS
// =====================================================

window.drawAPDebugDots = function (path) {

  const pulse = 0.5 + 0.5 * sin(frameCount * 0.2);

  push();
  blendMode(ADD);
  noStroke();

  for (const p of path) {
    fill(80, 255, 120, 120 * pulse);
    circle(p.x, p.y, 18);

    fill(160, 255, 190, 220 * pulse);
    circle(p.x, p.y, 6);
  }

  blendMode(BLEND);
  pop();
};


// =====================================================
// MEMBRANE SURFACE SAMPLER (AUTHORITATIVE)
// =====================================================
//
// Returns membrane-normal X offset at Y
// MUST match neuronShape.js synaptic face exactly
//
// =====================================================

window.getSynapticMembraneX = function (y) {

  const barHalf = 140;
  const rBar    = 80;

  // ---------------------------------------------------
  // TOP ROUNDED CORNER
  // ---------------------------------------------------
  if (y < -barHalf + rBar) {
    const dy = y + barHalf - rBar;
    return rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------------------------------------------
  // BOTTOM ROUNDED CORNER
  // ---------------------------------------------------
  if (y > barHalf - rBar) {
    const dy = y - (barHalf - rBar);
    return rBar - Math.sqrt(
      Math.max(0, rBar * rBar - dy * dy)
    );
  }

  // ---------------------------------------------------
  // FLAT SYNAPTIC FACE
  // ---------------------------------------------------
  return 0;
};
