console.log("🟣 astrocyteSynapse loaded");

// =====================================================
// COLORS
// =====================================================
const ASTRO_PURPLE = window.COLORS?.astrocyte ?? [185, 145, 220];

// =====================================================
// ASTROCYTE POSITION (AUTHORITATIVE)
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
// 🔑 ASTROCYTE MEMBRANE SAMPLER (PHYSICS ONLY)
// =====================================================
//
// Returns the Y position of the *lower astrocyte membrane*
// that faces the synaptic cleft.
//
// IMPORTANT:
// • Finite in X
// • No clamping outside bounds
// • NO side effects
//
window.getAstrocyteBoundaryY = function (x) {

  // Outside astrocyte → no membrane
  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  // Normalize lateral distance
  const t = Math.abs(x) / ASTRO_X_MAX;

  // LOWER membrane curvature
  // Matches drawn contour exactly
  const yLocal =
    65 -                // rim
    45 * (t * t);       // dome rise toward center

  return ASTRO_Y_OFFSET + yLocal;
};

// =====================================================
// 🧪 DEBUG DRAW — MEMBRANE VISUALIZATION
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();

  stroke(...D.color, D.alpha);
  strokeWeight(D.lineWeight);
  noFill();

  // ---- boundary curve ----
  beginShape();
  for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep) {
    const y = window.getAstrocyteBoundaryY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  // ---- sample points ----
  if (D.drawPoints) {
    noStroke();
    fill(...D.color, 220);

    for (let x = ASTRO_X_MIN; x <= ASTRO_X_MAX; x += D.sampleStep * 4) {
      const y = window.getAstrocyteBoundaryY(x);
      if (y !== null) circle(x, y, D.pointSize);
    }
  }

  // ---- normals (optional) ----
  if (D.drawNormals) {
    stroke(...D.color, 180);
    strokeWeight(1);

    for (let x = ASTRO_X_MIN + 40; x <= ASTRO_X_MAX - 40; x += 40) {
      const y1 = window.getAstrocyteBoundaryY(x - 1);
      const y2 = window.getAstrocyteBoundaryY(x + 1);
      if (y1 === null || y2 === null) continue;

      const dx = 2;
      const dy = y2 - y1;
      const mag = Math.hypot(dx, dy) || 1;

      const nx = -dy / mag;
      const ny =  dx / mag;

      const y = window.getAstrocyteBoundaryY(x);

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
window.ASTRO_X_MIN               = ASTRO_X_MIN;
window.ASTRO_X_MAX               = ASTRO_X_MAX;
