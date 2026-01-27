console.log("🟣 astrocyteSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// ASTROCYTE GEOMETRY — SINGLE SOURCE OF TRUTH
// =====================================================
//
// ✔ Geometry ONLY (NO physics)
// ✔ World-space membrane sampler
// ✔ Identical authority role to neuronShape.js
// ✔ Safe for NTs, vesicles, diffusion, uptake
//
// 🔒 HARD RULES:
// • NO motion
// • NO forces
// • NO NT logic
// • NO vesicle logic
// • NO clamping
//
// =====================================================


// =====================================================
// COLORS (VISUAL ONLY)
// =====================================================
const ASTRO_PURPLE = window.COLORS?.astrocyte ?? [185, 145, 220];


// =====================================================
// ASTROCYTE POSITION (WORLD SPACE OFFSET)
// =====================================================
const ASTRO_Y_OFFSET = -140;


// =====================================================
// ASTROCYTE EXTENT (AUTHORITATIVE DOMAIN)
// =====================================================
const ASTRO_X_MIN = -220;
const ASTRO_X_MAX =  220;


// =====================================================
// 🔑 MEMBRANE GEOMETRY (AUTHORITATIVE)
// =====================================================
//
// THIS curve is used by:
// • NT constraints
// • Visual membrane
// • Debug overlays
//
// There are NO other membrane definitions.
//
const ASTRO_MEMBRANE_BASE_Y   = 48;
const ASTRO_MEMBRANE_CURVATURE = 28;


// =====================================================
// 🔧 DEBUG CONFIG (VISUAL ONLY)
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // 🔴 Local membrane (visual reference)
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // 🔵 World membrane (physics truth)
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  sampleStep: 6
};


// =====================================================
// 🔑 ASTROCYTE MEMBRANE — LOCAL SPACE (THE ONE CURVE)
// =====================================================
//
// • LOCAL space
// • NO offsets
// • NO physics
//
function astrocyteMembraneLocalY(x) {

  if (!Number.isFinite(x)) return null;
  if (x < ASTRO_X_MIN || x > ASTRO_X_MAX) return null;

  const t = Math.abs(x) / ASTRO_X_MAX;

  return (
    ASTRO_MEMBRANE_BASE_Y -
    ASTRO_MEMBRANE_CURVATURE * (t * t)
  );
}


// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE SAMPLER (LOCKED)
// =====================================================
//
// 🔒 SINGLE SOURCE OF TRUTH
// All physics & NT logic must call THIS
//
window.getAstrocyteMembraneY = function (x) {

  const yLocal = astrocyteMembraneLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};


// =====================================================
// 🔑 ASTROCYTE MEMBRANE — PENETRATION QUERY
// =====================================================
window.getAstrocytePenetration = function (x, y) {

  const yMem = window.getAstrocyteMembraneY(x);
  if (yMem === null) return null;

  // >0 = inside astrocyte
  return yMem - y;
};


// =====================================================
// ASTROCYTIC ENDFOOT — FILL MASS ONLY (LOCAL SPACE)
// =====================================================
//
// ❗ NOT used for constraints
// ❗ Tissue bulk only
//
function drawAstrocyteSynapse() {

  push();
  translate(0, ASTRO_Y_OFFSET);

  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();
  curveVertex(-200, -10);
  curveVertex(-220, -30);
  curveVertex(-160, -90);
  curveVertex(-60,  -120);
  curveVertex(0,    -125);
  curveVertex(60,   -120);
  curveVertex(160,  -90);
  curveVertex(220,  -30);
  curveVertex(200,   20);
  curveVertex(120,   55);
  curveVertex(0,     65);
  curveVertex(-120,  55);
  curveVertex(-200,  20);
  curveVertex(-220, -30);
  curveVertex(-200, -10);
  endShape();

  pop();
}


// =====================================================
// 🟣 VISUAL MEMBRANE — EXACT PHYSICS CURVE
// =====================================================
//
// NTs touch THIS line
//
function drawAstrocyteMembrane() {

  push();
  translate(0, ASTRO_Y_OFFSET);

  stroke(...ASTRO_PURPLE);
  strokeWeight(4);
  noFill();

  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += 4) {
    vertex(x, astrocyteMembraneLocalY(x));
  }
  endShape();

  pop();
}


// =====================================================
// 🔴 DEBUG — LOCAL MEMBRANE (RED)
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();
  translate(0, ASTRO_Y_OFFSET);

  stroke(...D.color, D.alpha);
  strokeWeight(D.lineWeight);
  noFill();

  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    vertex(x, astrocyteMembraneLocalY(x));
  }
  endShape();

  pop();
}


// =====================================================
// 🔵 DEBUG — WORLD MEMBRANE (BLUE)
// =====================================================
function drawAstrocytePhysicsBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();
  stroke(...D.physicsColor, D.physicsAlpha);
  strokeWeight(D.physicsWeight);
  noFill();

  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    vertex(x, window.getAstrocyteMembraneY(x));
  }
  endShape();

  pop();
}


// =====================================================
// EXPORTS
// =====================================================
window.drawAstrocyteSynapse              = drawAstrocyteSynapse;
window.drawAstrocyteMembrane             = drawAstrocyteMembrane;
window.drawAstrocyteBoundaryDebug        = drawAstrocyteBoundaryDebug;
window.drawAstrocytePhysicsBoundaryDebug = drawAstrocytePhysicsBoundaryDebug;

window.ASTRO_X_MIN     = ASTRO_X_MIN;
window.ASTRO_X_MAX     = ASTRO_X_MAX;
window.ASTRO_Y_OFFSET  = ASTRO_Y_OFFSET;
