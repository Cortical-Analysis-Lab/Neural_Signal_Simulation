console.log("🩸 bloodContents v1 (clean) loaded");

// =====================================================
// BLOOD CONTENTS — SYMBOLIC PARTICLES (V1)
// =====================================================
// GOALS:
// ✔ Even distribution
// ✔ No lumen fill
// ✔ No accumulation
// ✔ Smooth flow
// ✔ Teaching-first visuals
// =====================================================

// Public container
const bloodParticles = [];

// -----------------------------------------------------
// VISUAL COUNTS (INTENTIONAL, LOW)
// -----------------------------------------------------
const BLOOD_COUNTS = {
  rbc: 14,     // dominant visual elements
  water: 10,   // sparse tracers
  glucose: 0   // off for now
};

// -----------------------------------------------------
// Initialize particles (even spacing)
// -----------------------------------------------------
function initBloodContents() {
  bloodParticles.length = 0;

  // =========================
  // RBCs
  // =========================
  for (let i = 0; i < BLOOD_COUNTS.rbc; i++) {
    bloodParticles.push({
      type: "rbc",

      // Evenly spaced along vessel
      t: (i + 0.5) / BLOOD_COUNTS.rbc,

      // Small radial spread
      lane: map(i % 4, 0, 3, -0.6, 0.6),

      size: 7,

      // Oxygenation state (visual only)
      sat: i % 3 === 0 ? 0.35 : 0.95,

      // Motion phase
      phase: random(TWO_PI)
    });
  }

  // =========================
  // Water tracers
  // =========================
  for (let i = 0; i < BLOOD_COUNTS.water; i++) {
    bloodParticles.push({
      type: "water",

      t: (i + 0.5) / BLOOD_COUNTS.water,
      lane: random(-0.75, 0.75),
      size: 2,

      phase: random(TWO_PI)
    });
  }
}

// -----------------------------------------------------
// Update particle motion (smooth, continuous)
// -----------------------------------------------------
function updateBloodContents() {
  const speed = 0.00035; // 🔑 global flow speed

  bloodParticles.forEach(p => {

    // Forward motion
    p.t += speed;
    if (p.t > 1) p.t -= 1;

    // Gentle lateral oscillation
    p.phase += 0.01;
    p.lane += 0.0003 * sin(p.phase);

    // Soft containment
    p.lane = constrain(p.lane, -0.85, 0.85);
  });
}

// -----------------------------------------------------
// Required no-op hooks (used by main.js)
// -----------------------------------------------------
function updateSupplyWaves() {}
function updatePressureWaves() {}

// -----------------------------------------------------
// Draw particles (NO PLASMA, NO FILL)
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  bloodParticles.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    // =========================
    // RBCs
    // =========================
    if (p.type === "rbc") {
      const c = lerpColor(
        getColor("rbcDeoxy"),
        getColor("rbcOxy"),
        p.sat
      );

      fill(red(c), green(c), blue(c), 200);
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Water tracers
    // =========================
    if (p.type === "water") {
      fill(160, 210, 255, 80);
      ellipse(pos.x, pos.y, p.size);
    }
  });
}
