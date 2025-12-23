console.log("🩸 bloodContents loaded");

// =====================================================
// BLOOD CONTENTS — RBCs + Molecules (ARTERY ONLY)
// =====================================================

// Public container
const bloodContents = [];

// -----------------------------------------------------
// Visual / teaching-oriented densities (NOT molar)
// -----------------------------------------------------
const BLOOD_DENSITY = {
  rbc: 80,        // dominant carrier
  water: 220,     // plasma background
  glucose: 30     // rare metabolic fuel
};

// -----------------------------------------------------
// Initialize blood contents (called from initArtery)
// -----------------------------------------------------
function initBloodContents() {
  bloodContents.length = 0;

  // =========================
  // RBCs (with hemoglobin)
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.rbc; i++) {
    const sat = random(0.85, 0.98); // arterial baseline

    bloodContents.push({
      type: "rbc",

      // Normalized position along artery (0 → 1)
      t: random(),

      // Lateral offset within lumen
      lane: random(-0.8, 0.8),

      size: 7,

      // Hemoglobin saturation
      sat,
      targetSat: sat,

      // Oxygen cargo (visual only)
      oxyCount: floor(4 + 6 * sat)
    });
  }

  // =========================
  // Water (plasma)
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.water; i++) {
    bloodContents.push({
      type: "water",
      t: random(),
      lane: random(-1, 1),
      size: 2
    });
  }

  // =========================
  // Glucose
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.glucose; i++) {
    bloodContents.push({
      type: "glucose",
      t: random(),
      lane: random(-0.6, 0.6),
      size: 4
    });
  }
}

// -----------------------------------------------------
// Update — pulsed advection + saturation relaxation
// -----------------------------------------------------
function updateBloodContents() {
  const pulse = getCardiacPulse();
  const flow  = getHemodynamicScale();

  bloodContents.forEach(p => {

    // -------------------------
    // Flow speed by type
    // -------------------------
    const baseSpeed =
      p.type === "rbc"     ? 0.0020 :
      p.type === "water"   ? 0.0030 :
      p.type === "glucose" ? 0.0025 :
      0.002;

    p.t += baseSpeed * flow * (0.6 + 0.6 * pulse);

    if (p.t > 1) p.t -= 1;

    // -------------------------
    // Hemoglobin saturation dynamics
    // -------------------------
    if (p.type === "rbc") {
      p.sat += (p.targetSat - p.sat) * 0.06;
      p.oxyCount = floor(4 + 6 * p.sat);
    }
  });
}

// -----------------------------------------------------
// Oxygen extraction near Neuron 1 (call on firing)
// -----------------------------------------------------
function extractOxygenNearNeuron1() {
  const RADIUS = 120;

  bloodContents.forEach(p => {
    if (p.type !== "rbc") return;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    if (dist(pos.x, pos.y, neuron.x, neuron.y) < RADIUS) {
      p.targetSat = max(0.25, p.targetSat - 0.15);
    }
  });
}

// -----------------------------------------------------
// Apply metabolic supply waves (from hemodynamics logic)
// -----------------------------------------------------
function applyMetabolicWaves() {
  if (!window.metabolicWaves) return;

  bloodContents.forEach(p => {
    if (p.type !== "rbc") return;

    let boost = 0;

    window.metabolicWaves.forEach(w => {
      const d = abs(p.t - w.t0);
      if (d < 0.1) {
        boost += (1 - d / 0.1) * w.strength;
      }
    });

    if (boost > 0) {
      p.targetSat = min(1.0, p.targetSat + 0.3 * boost);
    }
  });
}

// -----------------------------------------------------
// Render blood contents (called from drawArtery)
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  bloodContents.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    // =========================
    // RBCs (HbO2 ↔ Hb)
    // =========================
    if (p.type === "rbc") {

      const rbcColor = lerpColor(
        getColor("rbcDeoxy"),
        getColor("rbcOxy"),
        p.sat
      );

      fill(rbcColor);
      ellipse(
        pos.x,
        pos.y,
        p.size * (1 + 0.1 * getCardiacPulse())
      );

      // ---- Oxygen cargo (white dots) ----
      if (p.sat > 0.5) {
        fill(getColor("oxygen"));

        for (let i = 0; i < p.oxyCount; i++) {
          const a = TWO_PI * (i / p.oxyCount);
          const r = p.size * 0.3;

          ellipse(
            pos.x + cos(a) * r,
            pos.y + sin(a) * r,
            1.8
          );
        }
      }
    }

    // =========================
    // Water (plasma)
    // =========================
    if (p.type === "water") {
      fill(getColor("water", 120));
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Glucose (green squares)
    // =========================
    if (p.type === "glucose") {
      fill(getColor("glucose"));
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size, 2);
    }
  });
}
