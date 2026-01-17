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
// 🔧 DEBUG CONFIG (TUNABLE, RUNTIME-SAFE)
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
// ASTROCYTIC ENDFOOT (DRAW ONLY)
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
// 🔑 ASTROCYTE BOUNDARY SAMPLER (FIXED & FLIPPED)
// =====================================================
//
// Returns Y position of the *astrocyte membrane facing
// the synaptic cleft* (LOWER boundary)
//
window.getAstrocyteBoundaryY = function (x) {

  if (!Number.isFinite(x)) {
    return ASTRO_Y_OFFSET + 65;
  }

  // Normalize lateral distance
  const t = constrain(Math.abs(x) / 220, 0, 1);

  // 🔑 LOWER MEMBRANE CURVE (FLIPPED)
  // Matches the drawn bottom contour
  const yLocal =
    65 -               // bottom-most rim
    45 * (t * t);      // curvature upward toward center

  return ASTRO_Y_OFFSET + yLocal;
};

// =====================================================
// 🧪 DEBUG DRAW — BOUNDARY VISUALIZATION
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();

  // -----------------------------
  // Boundary curve
  // -----------------------------
  stroke(...D.color, D.alpha);
  strokeWeight(D.lineWeight);
  noFill();

  beginShape();
  for (let x = -220; x <= 220; x += D.sampleStep) {
    vertex(x, window.getAstrocyteBoundaryY(x));
  }
  endShape();

  // -----------------------------
  // Sample points
  // -----------------------------
  if (D.drawPoints) {
    noStroke();
    fill(...D.color, 220);

    for (let x = -200; x <= 200; x += D.sampleStep * 4) {
      const y = window.getAstrocyteBoundaryY(x);
      circle(x, y, D.pointSize);
    }
  }

  // -----------------------------
  // Normals (optional)
  // -----------------------------
  if (D.drawNormals) {
    stroke(...D.color, 180);
    strokeWeight(1);

    for (let x = -180; x <= 180; x += 40) {
      const y  = window.getAstrocyteBoundaryY(x);
      const y2 = window.getAstrocyteBoundaryY(x + 1);

      const dx = 1;
      const dy = y2 - y;
      const mag = Math.hypot(dx, dy) || 1;

      const nx = -dy / mag;
      const ny =  dx / mag;

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
