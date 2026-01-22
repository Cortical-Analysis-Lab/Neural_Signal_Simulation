console.log("🟣 astrocyteSynapse loaded — GEOMETRY AUTHORITY");

// =====================================================
// ASTROCYTE GEOMETRY — SINGLE SOURCE OF TRUTH
// =====================================================
//
// ✔ Geometry ONLY (NO physics)
// ✔ World-space membrane sampler
// ✔ Identical authority role to neuronShape.js
// ✔ Safe for NTs, vesicles, diffusion, uptake
//
// 🔒 HARD RULES:
// • NO motion
// • NO forces
// • NO NT logic
// • NO vesicle logic
// • NO clamping
//
// =====================================================


// =====================================================
// COLORS (VISUAL ONLY)
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

  // 🔴 Geometry intent (local)
  color: [255, 80, 80],
  alpha: 190,
  lineWeight: 2,

  // 🔵 Membrane surface (world)
  physicsColor: [80, 160, 255],
  physicsAlpha: 220,
  physicsWeight: 2,

  sampleStep: 6
};


// =====================================================
// ASTROCYTIC ENDFOOT — DRAW ONLY (LOCAL SPACE)
// =====================================================
//
// ❗ Visual shape ONLY
// ❗ Does NOT define membrane truth
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
// 🔑 ASTROCYTE MEMBRANE — LOCAL GEOMETRY
// =====================================================
//
// 🔒 LOCAL SPACE ONLY
// 🔒 NO offsets
// 🔒 NO physics
//
// Defines the LOWER astrocyte membrane curvature
//
function getAstrocyteMembraneLocalY(x) {

  if (!Number.isFinite(x)) return null;
  if (x < ASTRO_X_MIN || x > ASTRO_X_MAX) return null;

  const t = Math.abs(x) / ASTRO_X_MAX;

  // Authoritative curvature (matches visual intent)
  return 65 - 45 * (t * t);
}


// =====================================================
// 🔑 ASTROCYTE MEMBRANE — WORLD SPACE SAMPLER (LOCKED)
// =====================================================
//
// 🔒 SINGLE SOURCE OF TRUTH
// Analogous to getSynapticMembraneX(y)
//
// Returns:
// • membrane Y at world X
// • defines half-space boundary
//
// NTs / particles must satisfy:
//     y >= membraneY
//
window.getAstrocyteMembraneY = function (x) {

  const yLocal = getAstrocyteMembraneLocalY(x);
  if (yLocal === null) return null;

  return yLocal + ASTRO_Y_OFFSET;
};


// =====================================================
// 🔑 ASTROCYTE MEMBRANE — PENETRATION QUERY
// =====================================================
//
// Utility helper (NO correction applied here)
//
// Returns:
//   > 0 → inside astrocyte (penetration depth)
//   = 0 → exactly on membrane
//   < 0 → safely outside (below membrane)
//
window.getAstrocytePenetration = function (x, y) {

  const yMem = window.getAstrocyteMembraneY(x);
  if (yMem === null) return null;

  return yMem - y;
};


// =====================================================
// 🔴 DEBUG DRAW — LOCAL GEOMETRY (RED)
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
// 🔵 DEBUG DRAW — WORLD MEMBRANE (BLUE)
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

window.ASTRO_X_MIN     = ASTRO_X_MIN;
window.ASTRO_X_MAX     = ASTRO_X_MAX;
window.ASTRO_Y_OFFSET  = ASTRO_Y_OFFSET;
