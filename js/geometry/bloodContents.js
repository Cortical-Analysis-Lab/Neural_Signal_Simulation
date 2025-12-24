// =====================================================
// BLOOD CONTENTS — SYMBOLIC PARTICLES (V0 / DIAGNOSTIC)
// =====================================================
// GOALS:
// ✔ Even distribution
// ✔ Discrete particles only
// ✔ No lumen fill
// ✔ No motion
// ✔ No accumulation
// ✔ No blending
// ✔ Geometry-safe
//
// This file is intentionally minimal.
// Do NOT add realism here yet.
//
// =====================================================

console.log("🩸 bloodContents v0 (diagnostic) loaded");

// -----------------------------------------------------
// PUBLIC API (expected by main.js)
// -----------------------------------------------------

const bloodParticles = [];

// -----------------------------------------------------
// CONFIG — VISUAL ONLY
// -----------------------------------------------------

const BLOOD_CONFIG = {
  count: 18,            // small on purpose
  radiusFracMin: 0.20,  // stay well inside walls
  radiusFracMax: 0.75,
  size: 2.5
};

// -----------------------------------------------------
// INITIALIZE — ONE-TIME PARTICLE PLACEMENT
// -----------------------------------------------------

function initBloodContents() {
  bloodParticles.length = 0;

  const vessel = getActiveArtery(); // from artery.js
  if (!vessel) return;

  const cx = vessel.center.x;
  const cy = vessel.center.y;

  const innerR = vessel.innerRadius;

  const N = BLOOD_CONFIG.count;

  for (let i = 0; i < N; i++) {

    // Even angular spacing (prevents clustering)
    const theta = (i / N) * TWO_PI;

    // Fixed radial band — no sampling across lumen
    const rFrac = lerp(
      BLOOD_CONFIG.radiusFracMin,
      BLOOD_CONFIG.radiusFracMax,
      (i % 3) / 2
    );

    const r = innerR * rFrac;

    const x = cx + cos(theta) * r;
    const y = cy + sin(theta) * r;

    bloodParticles.push({
      x,
      y,
      size: BLOOD_CONFIG.size,
      color: colors.rbcOxy // from constants/colors.js
    });
  }
}

// -----------------------------------------------------
// UPDATE — NO-OP (INTENTIONAL)
// -----------------------------------------------------

function updateBloodContents() {
  // Diagnostic phase: absolutely no motion
  return;
}

// -----------------------------------------------------
// DRAW — DISCRETE PARTICLES ONLY
// -----------------------------------------------------

function drawBloodContents() {
  noStroke();

  for (const p of bloodParticles) {
    fill(p.color);
    circle(p.x, p.y, p.size);
  }
}

// -----------------------------------------------------
// EXPORTS (GLOBAL SCOPE EXPECTED)
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents   = drawBloodContents;
