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
// DEBUG TOGGLE (SAFE, OPT-IN)
// =====================================================
// Enable in console when needed:
//   window.DEBUG_ASTROCYTE_BOUNDARY = true;
window.DEBUG_ASTROCYTE_BOUNDARY = window.DEBUG_ASTROCYTE_BOUNDARY ?? false;


// =====================================================
// ASTROCYTIC ENDFOOT (DRAW ONLY)
// =====================================================
// • Pure visual geometry
// • NO physics
// • NO NT logic
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
// 🔑 ASTROCYTE BOUNDARY SAMPLER (AUTHORITATIVE)
// =====================================================
//
// • Single source of truth for NT collisions
// • Synapse-local coordinates
// • Matches underside of drawn astrocyte
//
window.getAstrocyteBoundaryY = function (x) {

  if (!Number.isFinite(x)) {
    console.warn("⚠️ getAstrocyteBoundaryY received invalid x:", x);
    return ASTRO_Y_OFFSET - 125;
  }

  // Normalize X across astrocyte width
  const t = constrain(Math.abs(x) / 220, 0, 1);

  // Smooth dome approximation
  const yLocal =
    -125 +            // deepest point
    55 * (t * t);     // rise toward edges

  const yWorld = ASTRO_Y_OFFSET + yLocal;

  if (!Number.isFinite(yWorld)) {
    console.warn("⚠️ getAstrocyteBoundaryY produced NaN:", { x, yLocal });
    return ASTRO_Y_OFFSET - 125;
  }

  return yWorld;
};


// =====================================================
// 🧪 ASTROCYTE BOUNDARY DEBUG OVERLAY
// =====================================================
//
// • Visualizes collision boundary
// • Confirms alignment with astrocyte geometry
// • Zero cost when disabled
//
function drawAstrocyteBoundaryDebug() {

  if (!window.DEBUG_ASTROCYTE_BOUNDARY) return;
  if (typeof window.getAstrocyteBoundaryY !== "function") return;

  push();

  // Boundary curve
  stroke(255, 80, 80, 180);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let x = -220; x <= 220; x += 6) {
    vertex(x, window.getAstrocyteBoundaryY(x));
  }
  endShape();

  // Sample probes
  noStroke();
  fill(255, 80, 80);
  for (let x = -200; x <= 200; x += 40) {
    const y = window.getAstrocyteBoundaryY(x);
    circle(x, y, 4);
  }

  pop();
}


// =====================================================
// EXPORTS
// =====================================================
window.drawAstrocyteSynapse       = drawAstrocyteSynapse;
window.drawAstrocyteBoundaryDebug = drawAstrocyteBoundaryDebug;
