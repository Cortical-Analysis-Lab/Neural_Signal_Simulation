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
  rbc: 70,
  water: 120,
  glucose: 18
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
    const sat = random(0.85, 0.98);

    bloodContents.push({
      type: "rbc",
      t: random(),
      lane: random(-0.85, 0.85),
      size: 7,

      sat,
      targetSat: sat,
      oxyCount: floor(4 + 6 * sat),

      // 🔑 organic motion
      jitter: random(TWO_PI),
      drift: random(-0.3, 0.3)
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
      size: 2,

      jitter: random(TWO_PI),
      drift: random(-0.4, 0.4)
    });
  }

  // =========================
  // Glucose
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.glucose; i++) {
    bloodContents.push({
      type: "glucose",
      t: random(),
      lane: random(-0.7, 0.7),
      size: 4,

      avail: 1.0,
      targetAvail: 1.0,

      jitter: random(TWO_PI),
      drift: random(-0.4, 0.4)
    });
  }
}

// -----------------------------------------------------
// Trigger upstream metabolic supply wave
// -----------------------------------------------------
function triggerSupplyWave(strength = 1.0) {
  supplyWaves.push({
    t: 0,
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
    w.t += 0.004;
    w.age++;

    if (w.t > 1.2 || w.age > 400) {
      supplyWaves.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Update — smooth advection + extraction + enrichment
// -----------------------------------------------------
function updateBloodContents() {
  const pulse = getCardiacPulse();
  const flow  = getHemodynamicScale();

  bloodContents.forEach(p => {

    // ---- laminar profile ----
    const laneFactor = 1 - abs(p.lane);
    const laminar = 0.4 + 0.6 * laneFactor;

    // ---- slow base speeds ----
    const baseSpeed =
      p.type === "rbc"     ? 0.00025 :
      p.type === "water"   ? 0.00035 :
      p.type === "glucose" ? 0.00030 :
      0.00025;

    // ---- organic noise ----
    p.jitter += 0.01;
    const noiseDrift = 0.00004 * sin(p.jitter + p.drift);
    const pulseMod  = 0.5 + 0.5 * pulse;

    p.t += baseSpeed * laminar * flow * pulseMod + noiseDrift;
    if (p.t > 1) p.t -= 1;

    // ---- subtle lateral motion ----
    p.lane += 0.0005 * sin(p.jitter * 0.7);
    p.lane = constrain(p.lane, -1, 1);

    // ---- oxygen dynamics ----
    if (p.type === "rbc") {
      p.sat += (p.targetSat - p.sat) * 0.05;
      p.oxyCount = floor(4 + 6 * p.sat);
    }

    // ---- glucose dynamics ----
    if (p.type === "glucose") {
      p.avail += (p.targetAvail - p.avail) * 0.05;
    }

    // ---- supply waves ----
    supplyWaves.forEach(w => {
      const d = abs(p.t - w.t);
      if (d > 0.1) return;

      const boost = (1 - d / 0.1) * w.strength;

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
// Oxygen extraction near Neuron 1
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
// Glucose extraction near Neuron 1
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
// Render blood contents (soft lumen masked)
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  bloodContents.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    const alphaMask = getLumenAlpha(p.lane);
    if (alphaMask <= 0) return;

    // =========================
    // RBCs
    // =========================
    if (p.type === "rbc") {
      const c = lerpColor(
        getColor("rbcDeoxy"),
        getColor("rbcOxy"),
        p.sat
      );

      fill(red(c), green(c), blue(c), 255 * alphaMask);
      ellipse(
        pos.x,
        pos.y,
        p.size * (1 + 0.08 * getCardiacPulse())
      );

      if (p.sat > 0.5) {
        fill(255, 255, 255, 220 * alphaMask);
        for (let i = 0; i < p.oxyCount; i++) {
          const a = TWO_PI * (i / p.oxyCount);
          const r = p.size * 0.3;
          ellipse(pos.x + cos(a) * r, pos.y + sin(a) * r, 1.5);
        }
      }
    }

    // =========================
    // Water
    // =========================
    if (p.type === "water") {
      fill(getColor("water", 60 * alphaMask));
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Glucose
    // =========================
    if (p.type === "glucose") {
      fill(getColor("glucose", 160 * p.avail * alphaMask));
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size, 2);
    }
  });
}
