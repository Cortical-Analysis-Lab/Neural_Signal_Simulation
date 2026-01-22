console.log("🟣 astrocyteSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// COLORS
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
// 🔧 DEBUG CONFIG (VISUAL ONLY)
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // Red = geometry intent
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // Blue = membrane surface (constraint reference)
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  sampleStep: 6
};

// =====================================================
// ASTROCYTIC ENDFOOT (DRAW ONLY — VISUAL SHAPE)
// =====================================================
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
// 🔑 ASTROCYTE MEMBRANE — LOCAL GEOMETRY
// =====================================================
//
// • Defines the LOWER astrocyte membrane in LOCAL space
// • NO offsets
// • NO physics
// • Geometry only
//
function getAstrocyteMembraneLocalY(x) {

  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  const t = Math.abs(x) / ASTRO_X_MAX;

  // Authoritative membrane curvature
  return 65 - 45 * (t * t);
}

// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE SAMPLER (AUTHORITATIVE)
// =====================================================
//
// 🔒 SINGLE SOURCE OF TRUTH
// Analogous to getSynapticMembraneX(y)
//
// • Returns membrane Y at world X
// • Defines allowed half-space for NTs
// • NTs must satisfy: y >= membraneY
//
window.getAstrocyteMembraneY = function (x) {

  const yLocal = getAstrocyteMembraneLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};

// =====================================================
// 🔑 ASTROCYTE MEMBRANE — PENETRATION HELPER
// =====================================================
//
// Utility for elastic confinement (USED ELSEWHERE)
//
// Returns:
//   > 0  → penetration depth into astrocyte
//   = 0  → exactly on membrane
//   < 0  → safely below membrane
//
window.getAstrocytePenetration = function (x, y) {

  const yMem = window.getAstrocyteMembraneY(x);
  if (yMem === null) return null;

  return yMem - y;
};

// =====================================================
// 🔴 DEBUG DRAW — GEOMETRY (RED)
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
    const y = getAstrocyteMembraneLocalY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  pop();
}

// =====================================================
// 🔵 DEBUG DRAW — MEMBRANE SURFACE (BLUE)
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
    const y = window.getAstrocyteMembraneY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  pop();
}

// =====================================================
// EXPORTS
// =====================================================
window.drawAstrocyteSynapse              = drawAstrocyteSynapse;
window.drawAstrocyteBoundaryDebug        = drawAstrocyteBoundaryDebug;
window.drawAstrocytePhysicsBoundaryDebug = drawAstrocytePhysicsBoundaryDebug;

window.ASTRO_X_MIN    = ASTRO_X_MIN;
window.ASTRO_X_MAX    = ASTRO_X_MAX;
window.ASTRO_Y_OFFSET = ASTRO_Y_OFFSET;
