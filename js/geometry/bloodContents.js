console.log("🩸 bloodContents loaded");

// =====================================================
// BLOOD CONTENTS — SYMBOLIC (ARTERY ONLY)
// =====================================================
// NOTE:
// - NO plasma background
// - Water = sparse tracers ONLY (for future BBB crossing)
// - RBCs dominate flow perception
// =====================================================

// Public container
const bloodContents = [];

// -----------------------------------------------------
// Chemical & mechanical waves
// -----------------------------------------------------
const supplyWaves   = [];
const pressureWaves = [];

// -----------------------------------------------------
// VISUAL DENSITY (INTENTIONALLY SPARSE)
// -----------------------------------------------------
const BLOOD_DENSITY = {
  rbc:     10,  // dominant visual carrier
  water:   0,  // 🔑 sparse tracers ONLY
  glucose: 0
};

// -----------------------------------------------------
// Initialize blood contents
// -----------------------------------------------------
function initBloodContents() {
  bloodContents.length = 0;
  supplyWaves.length = 0;
  pressureWaves.length = 0;

  // =========================
  // RBCs
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.rbc; i++) {
    const sat = random(0.85, 0.98);

    bloodContents.push({
      type: "rbc",
      t: random(-0.2, 1),
      lane: random(-0.85, 0.85),
      size: 7,

      sat,
      targetSat: sat,
      oxyCount: floor(4 + 6 * sat),

      jitter: random(TWO_PI),
      drift: random(-0.4, 0.4)
    });
  }

  // =========================
  // Water (TRACE MOLECULES)
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.water; i++) {
    bloodContents.push({
      type: "water",
      t: random(-0.2, 1),
      lane: random(-0.9, 0.9),
      size: 1.6,              // 🔑 very small

      jitter: random(TWO_PI),
      drift: random(-0.3, 0.3)
    });
  }

  // =========================
  // Glucose
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.glucose; i++) {
    bloodContents.push({
      type: "glucose",
      t: random(-0.2, 1),
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
// Trigger waves
// -----------------------------------------------------
function triggerSupplyWave(strength = 1.0) {
  supplyWaves.push({ t: 0, strength, age: 0 });
}

function triggerPressureWave(strength = 1.0) {
  pressureWaves.push({ t: 0, strength, age: 0 });
}

// -----------------------------------------------------
// Update waves
// -----------------------------------------------------
function updateSupplyWaves() {
  for (let i = supplyWaves.length - 1; i >= 0; i--) {
    const w = supplyWaves[i];
    w.t += 0.004;
    w.age++;
    if (w.t > 1.2 || w.age > 400) supplyWaves.splice(i, 1);
  }
}

function updatePressureWaves() {
  for (let i = pressureWaves.length - 1; i >= 0; i--) {
    const w = pressureWaves[i];
    w.t += 0.02;
    w.age++;
    if (w.t > 1.2 || w.age > 120) pressureWaves.splice(i, 1);
  }
}

// -----------------------------------------------------
// Update blood dynamics (SMOOTH + CONTINUOUS)
// -----------------------------------------------------
function updateBloodContents() {
  const pulse = getCardiacPulse();
  const flow  = getHemodynamicScale();

  bloodContents.forEach(p => {

    // ---- laminar profile ----
    const laneFactor = 1 - abs(p.lane);
    const laminar = 0.4 + 0.6 * laneFactor;

    // ---- base speeds ----
    const baseSpeed =
      p.type === "rbc"     ? 0.00025 :
      p.type === "glucose" ? 0.00030 :
      p.type === "water"   ? 0.00020 : // 🔑 water drifts more gently
      0.00025;

    // ---- organic jitter ----
    p.jitter += 0.01;
    const noiseDrift = 0.00004 * sin(p.jitter + p.drift);

    // ---- pressure only affects RBCs + glucose ----
    let pressurePush = 0;
    if (p.type !== "water") {
      pressureWaves.forEach(w => {
        const d = abs(p.t - w.t);
        if (d < 0.08) {
          pressurePush += (1 - d / 0.08) * w.strength * 0.0015;
        }
      });
    }

    const pulseMod = 0.5 + 0.5 * pulse;

    // ---- advance ----
    p.t += baseSpeed * laminar * flow * pulseMod
         + noiseDrift
         + pressurePush;

    if (p.t > 1) p.t = random(-0.2, 0);

    // ---- lateral freedom ----
    p.lane += 0.0006 * sin(p.jitter * 0.7);
    p.lane = constrain(p.lane, -1, 1);

    // ---- chemistry ----
    if (p.type === "rbc") {
      p.sat += (p.targetSat - p.sat) * 0.05;
      p.oxyCount = floor(4 + 6 * p.sat);
    }

    if (p.type === "glucose") {
      p.avail += (p.targetAvail - p.avail) * 0.05;
    }

    // ---- supply waves ----
    supplyWaves.forEach(w => {
      const d = abs(p.t - w.t);
      if (d > 0.1) return;

      const boost = (1 - d / 0.1) * w.strength;
      if (p.type === "rbc")     p.targetSat   = min(1.0, p.targetSat + 0.25 * boost);
      if (p.type === "glucose") p.targetAvail = min(1.0, p.targetAvail + 0.35 * boost);
    });
  });
}

// -----------------------------------------------------
// Render blood contents (NO PLASMA)
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
        fill(255, 255, 255, 200 * alphaMask);
        for (let i = 0; i < p.oxyCount; i++) {
          const a = TWO_PI * (i / p.oxyCount);
          const r = p.size * 0.3;
          ellipse(pos.x + cos(a) * r, pos.y + sin(a) * r, 1.4);
        }
      }
    }

    // =========================
    // Water (TRACE ONLY)
    // =========================
    if (p.type === "water") {
      fill(160, 210, 255, 70 * alphaMask);
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Glucose
    // =========================
    if (p.type === "glucose") {
      fill(getColor("glucose", 150 * p.avail * alphaMask));
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size, 2);
    }
  });
}
