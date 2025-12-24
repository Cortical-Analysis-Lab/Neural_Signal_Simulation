console.log("🩸 bloodContents v1 (clean, lumen-safe) loaded");

// =====================================================
// BLOOD CONTENTS — SYMBOLIC PARTICLES (V1)
// =====================================================
// DESIGN RULES (HARD):
// - NO plasma background
// - NO fill strokes
// - NO alpha accumulation
// - NO vasomotion coupling
// - PARTICLES MUST REMAIN DISCRETE
// =====================================================

// Public container
const bloodParticles = [];

// -----------------------------------------------------
// VISUAL COUNTS (LOW ON PURPOSE)
// -----------------------------------------------------
const BLOOD_COUNTS = {
  rbc: 12,     // dominant but sparse
  water: 6,    // tracer only
  glucose: 0   // disabled for now
};

// -----------------------------------------------------
// Initialize particles (EVEN + STAGGERED)
// -----------------------------------------------------
function initBloodContents() {
  bloodParticles.length = 0;

  // =========================
  // RBCs
  // =========================
  for (let i = 0; i < BLOOD_COUNTS.rbc; i++) {
    bloodParticles.push({
      type: "rbc",

      // evenly staggered
      t: (i + 0.5) / BLOOD_COUNTS.rbc,

      // fixed radial lanes (prevents clustering)
      lane: map(i % 3, 0, 2, -0.55, 0.55),

      size: 7,

      // visual oxygenation state ONLY
      sat: i % 4 === 0 ? 0.35 : 0.95,

      phase: random(TWO_PI)
    });
  }

  // =========================
  // Water tracers (SPARSE)
  // =========================
  for (let i = 0; i < BLOOD_COUNTS.water; i++) {
    bloodParticles.push({
      type: "water",

      t: (i + 0.5) / BLOOD_COUNTS.water,
      lane: random(-0.7, 0.7),

      size: 2,
      phase: random(TWO_PI)
    });
  }
}

// -----------------------------------------------------
// Update motion (STRICTLY LINEAR FLOW)
// -----------------------------------------------------
function updateBloodContents() {
  const speed = 0.0003;

  bloodParticles.forEach(p => {
    p.t += speed;
    if (p.t > 1) p.t -= 1;

    // minimal lateral freedom (NO diffusion)
    p.phase += 0.008;
    p.lane += 0.00025 * sin(p.phase);

    p.lane = constrain(p.lane, -0.7, 0.7);
  });
}

// -----------------------------------------------------
// Required no-op hooks (main.js expects these)
// -----------------------------------------------------
function updateSupplyWaves() {}
function updatePressureWaves() {}

// -----------------------------------------------------
// DRAW — DISCRETE PARTICLES ONLY
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  // 🔑 CRITICAL: prevent additive blending artifacts
  blendMode(BLEND);

  bloodParticles.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    // =========================
    // RBCs (SOLID, NO GLOW)
    // =========================
    if (p.type === "rbc") {
      const c = lerpColor(
        getColor("rbcDeoxy"),
        getColor("rbcOxy"),
        p.sat
      );

      fill(red(c), green(c), blue(c), 190);
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Water tracers (FAINT)
    // =========================
    if (p.type === "water") {
      fill(160, 210, 255, 60);
      ellipse(pos.x, pos.y, p.size);
    }
  });
}
