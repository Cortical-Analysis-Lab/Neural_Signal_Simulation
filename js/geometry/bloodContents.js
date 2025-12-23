console.log("🩸 bloodContents loaded");

// =====================================================
// BLOOD CONTENTS — RBCs + Molecules (ARTERY ONLY)
// =====================================================

// Public container
const bloodContents = [];

// -----------------------------------------------------
// Metabolic supply waves (arterial enrichment)
// -----------------------------------------------------
const supplyWaves = [];

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
  supplyWaves.length = 0;

  // =========================
  // RBCs (with hemoglobin)
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.rbc; i++) {
    const sat = random(0.85, 0.98); // arterial baseline

    bloodContents.push({
      type: "rbc",
      t: random(),                  // 0 → 1 along artery
      lane: random(-0.8, 0.8),
      size: 7,

      sat,
      targetSat: sat,

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
      size: 4,

      avail: 1.0,
      targetAvail: 1.0
    });
  }
}

// -----------------------------------------------------
// Trigger upstream metabolic supply wave
// -----------------------------------------------------
function triggerSupplyWave(strength = 1.0) {
  supplyWaves.push({
    t: 0,            // starts upstream
    strength,
    age: 0
  });
}

// -----------------------------------------------------
// Update supply wave propagation
// -----------------------------------------------------
function updateSupplyWaves() {
  for (let i = supplyWaves.length - 1; i >= 0; i--) {
    const w = supplyWaves[i];

    w.t += 0.01;     // slower than particles → enrichment packet
    w.age++;

    if (w.t > 1.2 || w.age > 300) {
      supplyWaves.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Update — pulsed advection + extraction + enrichment
// -----------------------------------------------------
function updateBloodContents() {
  const pulse = getCardiacPulse();
  const flow  = getHemodynamicScale();

  bloodContents.forEach(p => {

    // -------------------------
    // Continuous blood flow
    // -------------------------
    const baseSpeed =
      p.type === "rbc"     ? 0.0020 :
      p.type === "water"   ? 0.0030 :
      p.type === "glucose" ? 0.0025 :
      0.002;

    p.t += baseSpeed * flow * (0.6 + 0.6 * pulse);
    if (p.t > 1) p.t -= 1;

    // -------------------------
    // Oxygen (hemoglobin)
    // -------------------------
    if (p.type === "rbc") {
      p.sat += (p.targetSat - p.sat) * 0.06;
      p.oxyCount = floor(4 + 6 * p.sat);
    }

    // -------------------------
    // Glucose availability
    // -------------------------
    if (p.type === "glucose") {
      p.avail += (p.targetAvail - p.avail) * 0.05;
    }

    // -------------------------
    // Apply supply waves
    // -------------------------
    supplyWaves.forEach(w => {
      const d = abs(p.t - w.t);
      if (d > 0.08) return;

      const boost = (1 - d / 0.08) * w.strength;

      if (p.type === "rbc") {
        p.targetSat = min(1.0, p.targetSat + 0.25 * boost);
      }

      if (p.type === "glucose") {
        p.targetAvail = min(1.0, p.targetAvail + 0.35 * boost);
      }
    });
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
// Glucose extraction near Neuron 1 (call on firing)
// -----------------------------------------------------
function extractGlucoseNearNeuron1() {
  const RADIUS = 120;

  bloodContents.forEach(p => {
    if (p.type !== "glucose") return;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    if (dist(pos.x, pos.y, neuron.x, neuron.y) < RADIUS) {
      p.targetAvail = max(0.2, p.targetAvail - 0.2);
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

      // ---- Oxygen cargo ----
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
    // Water
    // =========================
    if (p.type === "water") {
      fill(getColor("water", 120));
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Glucose
    // =========================
    if (p.type === "glucose") {
      fill(getColor("glucose", 200 * p.avail));
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size, 2);
    }
  });
}
