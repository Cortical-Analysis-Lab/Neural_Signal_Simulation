// =====================================================
// BLOOD CONTENTS — SYMBOLIC PARTICLES (V0.1 / DIAGNOSTIC)
// =====================================================
// ✔ Discrete particles
// ✔ Even angular spacing
// ✔ No lumen fill
// ✔ No motion
// ✔ No accumulation
// ✔ Direct artery read (no API assumptions)
// =====================================================

console.log("🩸 bloodContents v0.1 (diagnostic) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// CONFIG — VISUAL ONLY
// -----------------------------------------------------

const BLOOD_CONFIG = {
  count: 18,
  radiusFracMin: 0.25,
  radiusFracMax: 0.75,
  size: 2.5
};

// -----------------------------------------------------
// INITIALIZE — ONE-TIME PLACEMENT
// -----------------------------------------------------

function initBloodContents() {
  bloodParticles.length = 0;

  // ---- DIRECT READ FROM ARTERY GEOMETRY ----
  if (!window.artery) {
    console.warn("🩸 bloodContents: artery not ready");
    return;
  }

  const cx = artery.center.x;
  const cy = artery.center.y;
  const innerR = artery.innerRadius;

  const N = BLOOD_CONFIG.count;

  for (let i = 0; i < N; i++) {

    const theta = (i / N) * TWO_PI;

    // Fixed radial bands → no lumen inference
    const rFrac = lerp(
      BLOOD_CONFIG.radiusFracMin,
      BLOOD_CONFIG.radiusFracMax,
      (i % 3) / 2
    );

    const r = innerR * rFrac;

    bloodParticles.push({
      x: cx + cos(theta) * r,
      y: cy + sin(theta) * r,
      size: BLOOD_CONFIG.size,
      color: colors.rbcOxy
    });
  }
}

// -----------------------------------------------------
// UPDATE — NO-OP (INTENTIONAL)
// -----------------------------------------------------

function updateBloodContents() {
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
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;

