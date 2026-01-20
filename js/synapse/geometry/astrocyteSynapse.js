console.log("🟣 astrocyteSynapse loaded — HARD CONSTRAINT MEMBRANE");

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
// ASTROCYTE MEMBRANE — WORLD SPACE (SINGLE SOURCE)
// =====================================================
//
// This function IS the membrane.
// • World-space Y
// • Used for physics AND drawing
// • Identical contract to fusion plane
//
function astrocyteMembraneY(x) {

  if (!Number.isFinite(x) || x < ASTRO_X_MIN || x > ASTRO_X_MAX) {
    return null;
  }

  const t = Math.abs(x) / ASTRO_X_MAX;

  // World-space membrane (concave downward)
  return -75 + (45 * (t * t));
}

// =====================================================
// EXPORT PHYSICS TRUTH (AUTHORITATIVE)
// =====================================================
window.getAstrocyteBoundaryY = astrocyteMembraneY;

// =====================================================
// 🔧 DEBUG CONFIG
// =====================================================
window.DEBUG_ASTROCYTE = window.DEBUG_ASTROCYTE ?? {
  enabled: true,
  color: [255, 80, 80],       // membrane
  alpha: 200,
  weight: 2,
  sampleStep: 6
};

// =====================================================
// ASTROCYTIC ENDFOOT (DRAW ONLY)
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

  // close shape upward (astrocyte body)
  curveVertex(ASTRO_X_MAX, -300);
  curveVertex(ASTRO_X_MIN, -300);
  endShape(CLOSE);

  pop();
}

// =====================================================
// 🔴 DEBUG DRAW — MEMBRANE (PHYSICS = DRAW)
// =====================================================
function drawAstrocyteBoundaryDebug() {

  const D = window.DEBUG_ASTROCYTE;
  if (!D.enabled) return;

  push();
  stroke(...D.color, D.alpha);
  strokeWeight(D.weight);
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
window.drawAstrocyteSynapse       = drawAstrocyteSynapse;
window.drawAstrocyteBoundaryDebug = drawAstrocyteBoundaryDebug;

window.ASTRO_X_MIN = ASTRO_X_MIN;
window.ASTRO_X_MAX = ASTRO_X_MAX;
