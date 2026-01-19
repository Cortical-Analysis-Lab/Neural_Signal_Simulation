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
//
// NTs should ONLY interact with astrocyte
// within this lateral span.
//
const ASTRO_X_MIN = -220;
const ASTRO_X_MAX =  220;

// =====================================================
// 🔧 DEBUG CONFIG (TUNABLE AT RUNTIME)
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,

  // Boundary curve
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

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
//
// Returns Y of LOWER astrocyte membrane
// in *LOCAL* synapse coordinates.
// Not exported.
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
// This is the ONLY sampler external systems should use.
// NT physics MUST use this.
//
window.getAstrocyteBoundaryY = function (x) {

  const yLocal = getAstrocyteBoundaryLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};

// =====================================================
// 🧪 DEBUG DRAW — MEMBRANE VISUALIZATION (RED LINE)
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();
  translate(0, ASTRO_Y_OFFSET);

  stroke(...D.color, D.alpha);
  strokeWeight(D.lineWeight);
  noFill();

  // ---- boundary curve ----
  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    const y = getAstrocyteBoundaryLocalY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  // ---- sample points ----
  if (D.drawPoints) {
    noStroke();
    fill(...D.color, 220);

    for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep * 4) {
      const y = getAstrocyteBoundaryLocalY(x);
      if (y !== null) circle(x, y, D.pointSize);
    }
  }

  // ---- normals (optional) ----
  if (D.drawNormals) {
    stroke(...D.color, 180);
    strokeWeight(1);

    for (let x = ASTRO_X_MIN + 40; x <= ASTRO_X_MAX - 40; x += 40) {
      const y1 = getAstrocyteBoundaryLocalY(x - 1);
      const y2 = getAstrocyteBoundaryLocalY(x + 1);
      if (y1 === null || y2 === null) continue;

      const dx = 2;
      const dy = y2 - y1;
      const mag = Math.hypot(dx, dy) || 1;

      const nx = -dy / mag;
      const ny =  dx / mag;

      const y = getAstrocyteBoundaryLocalY(x);

      line(
        x, y,
        x + nx * D.normalLength,
        y + ny * D.normalLength
      );
    }
  }

  pop();
}

// =====================================================
// EXPORTS
// =====================================================
window.drawAstrocyteSynapse       = drawAstrocyteSynapse;
window.drawAstrocyteBoundaryDebug = drawAstrocyteBoundaryDebug;

window.ASTRO_X_MIN   = ASTRO_X_MIN;
window.ASTRO_X_MAX   = ASTRO_X_MAX;
window.ASTRO_Y_OFFSET = ASTRO_Y_OFFSET;
