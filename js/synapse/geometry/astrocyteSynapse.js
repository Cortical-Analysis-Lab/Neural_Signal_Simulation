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
// ASTROCYTIC ENDFOOT (DRAW)
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
  curveVertex(-60, -120);
  curveVertex(0, -125);
  curveVertex(60, -120);
  curveVertex(160, -90);
  curveVertex(220, -30);
  curveVertex(200, 20);
  curveVertex(120, 55);
  curveVertex(0, 65);
  curveVertex(-120, 55);
  curveVertex(-200, 20);
  curveVertex(-220, -30);
  curveVertex(-200, -10);
  endShape();

  pop();
}

// =====================================================
// 🔑 ASTROCYTE BOUNDARY SAMPLER (AUTHORITATIVE)
// =====================================================
//
// Returns the Y position of the astrocyte membrane
// for a given X in synapse-local space
//
window.getAstrocyteBoundaryY = function (x) {

  // Approximate curved underside (matches drawing)
  const t = constrain(Math.abs(x) / 220, 0, 1);

  // Smooth dome curve
  const yLocal =
    -125 +            // deepest point
    55 * (t * t);     // rise toward edges

  return ASTRO_Y_OFFSET + yLocal;
};
