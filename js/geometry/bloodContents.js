console.log("🩸 bloodContents BASELINE loaded");

// =====================================================
// BLOOD CONTENTS — ABSOLUTE BASELINE
// =====================================================
// PURPOSE:
// • Prove particle drawing is NOT causing lumen fill
// • No motion
// • No waves
// • No plasma
// • No coupling
// • Just dots inside artery
// =====================================================

// -----------------------------------------------------
// Public container
// -----------------------------------------------------
const bloodParticles = [];

// -----------------------------------------------------
// Visual counts (LOW, FIXED)
// -----------------------------------------------------
const BLOOD_COUNTS = {
  rbc: 8,
  water: 4
};

// -----------------------------------------------------
// Initialize particles (STATIC, EVEN)
// -----------------------------------------------------
function initBloodContents() {
  bloodParticles.length = 0;

  // ---- RBCs (circles) ----
  for (let i = 0; i < BLOOD_COUNTS.rbc; i++) {
    bloodParticles.push({
      type: "rbc",
      t: (i + 0.5) / BLOOD_COUNTS.rbc,
      lane: map(i % 4, 0, 3, -0.5, 0.5),
      size: 7,
      sat: i % 2 === 0 ? 0.9 : 0.3 // mix oxy/deoxy
    });
  }

  // ---- Water tracers (tiny dots) ----
  for (let i = 0; i < BLOOD_COUNTS.water; i++) {
    bloodParticles.push({
      type: "water",
      t: (i + 0.5) / BLOOD_COUNTS.water,
      lane: map(i % 2, 0, 1, -0.3, 0.3),
      size: 2
    });
  }
}

// -----------------------------------------------------
// REQUIRED hooks (NO-OP)
// main.js / hemodynamics.js expect these
// -----------------------------------------------------
function updateBloodContents() {}
function updateSupplyWaves() {}
function updatePressureWaves() {}

// -----------------------------------------------------
// Draw particles ONLY (no fills, no masks)
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  bloodParticles.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    // ---- RBCs ----
    if (p.type === "rbc") {
      const c = lerpColor(
        getColor("rbcDeoxy"),
        getColor("rbcOxy"),
        p.sat
      );
      fill(red(c), green(c), blue(c), 200);
      ellipse(pos.x, pos.y, p.size);
    }

    // ---- Water tracers ----
    if (p.type === "water") {
      fill(160, 210, 255, 120);
      ellipse(pos.x, pos.y, p.size);
    }
  });
}
