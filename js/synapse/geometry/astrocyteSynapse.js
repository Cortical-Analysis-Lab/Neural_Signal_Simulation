console.log("🟣 astrocyteSynapse loaded — HARD CONSTRAINT PLANE");

// =====================================================
// COLORS
// =====================================================
const ASTRO_PURPLE = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// ASTROCYTE EXTENT (AUTHORITATIVE)
// =====================================================
const ASTRO_X_MIN = -220;
const ASTRO_X_MAX =  220;

// =====================================================
// 🔧 DEBUG CONFIG (TUNABLE AT RUNTIME)
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // Red = intended geometry (same as physics now)
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // Blue = physics truth (same curve)
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  // Sampling
  sampleStep: 6,
  drawPoints: true,
  pointSize: 4
};

// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE (AUTHORITATIVE)
// =====================================================
//
// This is the ONLY membrane definition.
// Identical contract to fusion plane.
//
function astrocyteMembraneY(x) {

  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  const t = Math.abs(x) / ASTRO_X_MAX;

  // World-space membrane (concave down)
  return -75 + 45 * (t * t);
}

// =====================================================
// EXPORT PHYSICS TRUTH
// =====================================================
window.getAstrocyteBoundaryY = astrocyteMembraneY;

// =====================================================
// ASTROCYTIC ENDFOOT (DRAW ONLY — FILLS ABOVE MEMBRANE)
// =====================================================
function drawAstrocyteSynapse() {

  push();
  stroke(...ASTRO_PURPLE);
  fill(ASTRO_PURPLE[0], ASTRO_PURPLE[1], ASTRO_PURPLE[2], 45);

  beginShape();

  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += 6) {
    const y = astrocyteMembraneY(x);
    if (y !== null) curveVertex(x, y);
  }

  // close upward into astrocyte body
  curveVertex(ASTRO_X_MAX, -300);
  curveVertex(ASTRO_X_MIN, -300);
  endShape(CLOSE);

  pop();
}

// =====================================================
// 🔴 DEBUG DRAW — MEMBRANE (RED)
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();
  stroke(...D.color, D.alpha);
  strokeWeight(D.lineWeight);
  noFill();

  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    const y = astrocyteMembraneY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  pop();
}

// =====================================================
// 🔵 DEBUG DRAW — PHYSICS MEMBRANE (BLUE)
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
    const y = astrocyteMembraneY(x);
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

window.ASTRO_X_MIN = ASTRO_X_MIN;
window.ASTRO_X_MAX = ASTRO_X_MAX;
