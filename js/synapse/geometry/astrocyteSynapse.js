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
// ASTROCYTE EXTENT (AUTHORITATIVE)
// =====================================================
const ASTRO_X_MIN = -220;
const ASTRO_X_MAX =  220;

// =====================================================
// 🔧 DEBUG CONFIG
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // Red = intended geometry
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // Blue = physics / constraint truth
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  sampleStep: 6,
  drawPoints: true,
  pointSize: 4
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
// 🔑 ASTROCYTE MEMBRANE — LOCAL CURVATURE
// =====================================================
//
// This defines the membrane shape in LOCAL space only.
// No offsets. No physics. Geometry only.
//
function getAstrocyteBoundaryLocalY(x) {

  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  const t = Math.abs(x) / ASTRO_X_MAX;

  // LOWER membrane curvature (local space)
  return 65 - 45 * (t * t);
}

// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE (AUTHORITATIVE)
// =====================================================
//
// THIS IS THE CONSTRAINT PLANE.
// Analogous to SYNAPSE_FUSION_PLANE_X.
//
// • World space
// • Single source of truth
// • Used by ALL physics
//
window.getAstrocyteBoundaryY = function (x) {

  const yLocal = getAstrocyteBoundaryLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};

// =====================================================
// 🔴 DEBUG DRAW — MEMBRANE (RED, GEOMETRY)
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
// 🔵 DEBUG DRAW — MEMBRANE (BLUE, CONSTRAINT)
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
