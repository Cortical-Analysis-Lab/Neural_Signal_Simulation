console.log("🟣 astrocyteSynapse loaded");

// =====================================================
// COLORS
// =====================================================
const ASTRO_PURPLE = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// ASTROCYTE POSITION (WORLD / DRAW SPACE)
// =====================================================
const ASTRO_Y_OFFSET = -140;

// =====================================================
// ASTROCYTE EXTENT (AUTHORITATIVE FOR PHYSICS)
// =====================================================
const ASTRO_X_MIN = -220;
const ASTRO_X_MAX =  220;

// =====================================================
// 🔧 DEBUG CONFIG (TUNABLE AT RUNTIME)
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // Red = intended geometry
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // Blue = physics truth
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  // Sampling
  sampleStep: 6,
  drawPoints: true,
  pointSize: 4,

  // Normals
  drawNormals: false,
  normalLength: 10
};

// =====================================================
// ASTROCYTIC ENDFOOT (DRAW ONLY — NO PHYSICS)
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
// 🔑 ASTROCYTE MEMBRANE — LOCAL SHAPE (INTERNAL)
// =====================================================
function getAstrocyteBoundaryLocalY(x) {

  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  const t = Math.abs(x) / ASTRO_X_MAX;

  // LOWER membrane curvature (local space)
  return 65 - 45 * (t * t);
}

// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE (PHYSICS TRUTH)
// =====================================================
window.getAstrocyteBoundaryY = function (x) {

  const yLocal = getAstrocyteBoundaryLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};

// =====================================================
// 🔴 DEBUG DRAW — INTENDED MEMBRANE (RED)
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
    const y = getAstrocyteBoundaryLocalY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  pop();
}

// =====================================================
// 🔵 DEBUG DRAW — PHYSICS MEMBRANE (BLUE, AUTHORITATIVE)
// =====================================================
function drawAstrocytePhysicsBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;
  if (typeof window.getAstrocyteBoundaryY !== "function") return;

  push();

  stroke(...D.physicsColor, D.physicsAlpha);
  strokeWeight(D.physicsWeight);
  noFill();

  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    const y = window.getAstrocyteBoundaryY(x);
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
