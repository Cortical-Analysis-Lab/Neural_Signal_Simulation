console.log("🩸 bloodContents loaded");

// =====================================================
// BLOOD CONTENTS — SYMBOLIC (ARTERY ONLY)
// =====================================================
// Teaching-focused, NOT biologically quantitative
// =====================================================

const bloodContents = [];
const supplyWaves   = [];
const pressureWaves = [];

// -----------------------------------------------------
// VISUAL COUNTS (DISCRETE OBJECTS)
// -----------------------------------------------------
const BLOOD_DENSITY = {
  rbc:     0,  // main visual carriers
  water:   0,   // light-blue tracers only
  glucose: 0
};

// -----------------------------------------------------
// Initialize
// -----------------------------------------------------
function initBloodContents() {
  bloodContents.length = 0;
  supplyWaves.length = 0;
  pressureWaves.length = 0;

  // =========================
  // RBCs — DISCRETE STATE
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.rbc; i++) {
    bloodContents.push({
      type: "rbc",

      t: random(-0.2, 1),
      lane: random(-0.8, 0.8),   // 🔑 hard interior
      size: 7,

      oxygenated: random() < 0.8, // 🔑 binary state

      jitter: random(TWO_PI),
      drift: random(-0.4, 0.4)
    });
  }

  // =========================
  // Water — TRACE ONLY
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.water; i++) {
    bloodContents.push({
      type: "water",
      t: random(-0.2, 1),
      lane: random(-0.85, 0.85),
      size: 1.6,

      jitter: random(TWO_PI),
      drift: random(-0.3, 0.3)
    });
  }

  // =========================
  // Glucose — SYMBOLIC
  // =========================
  for (let i = 0; i < BLOOD_DENSITY.glucose; i++) {
    bloodContents.push({
      type: "glucose",
      t: random(-0.2, 1),
      lane: random(-0.7, 0.7),
      size: 4,

      jitter: random(TWO_PI),
      drift: random(-0.4, 0.4)
    });
  }
}

// -----------------------------------------------------
// Trigger waves
// -----------------------------------------------------
function triggerSupplyWave() {
  supplyWaves.push({ t: 0 });
}

function triggerPressureWave() {
  pressureWaves.push({ t: 0 });
}

// -----------------------------------------------------
// Update waves
// -----------------------------------------------------
function updateSupplyWaves() {
  supplyWaves.forEach(w => w.t += 0.004);
  while (supplyWaves.length && supplyWaves[0].t > 1.2) {
    supplyWaves.shift();
  }
}

function updatePressureWaves() {
  pressureWaves.forEach(w => w.t += 0.02);
  while (pressureWaves.length && pressureWaves[0].t > 1.2) {
    pressureWaves.shift();
  }
}

// -----------------------------------------------------
// Update motion (SMOOTH, CONTINUOUS)
// -----------------------------------------------------
function updateBloodContents() {
  const pulse = getCardiacPulse();
  const flow  = getHemodynamicScale();

  bloodContents.forEach(p => {

    const laminar = 0.4 + 0.6 * (1 - abs(p.lane));

    const baseSpeed =
      p.type === "rbc"   ? 0.00025 :
      p.type === "water" ? 0.00018 :
      p.type === "glucose" ? 0.00030 :
      0.00025;

    p.jitter += 0.01;
    const noise = 0.00004 * sin(p.jitter + p.drift);

    let pressurePush = 0;
    if (p.type === "rbc") {
      pressureWaves.forEach(w => {
        const d = abs(p.t - w.t);
        if (d < 0.08) pressurePush += 0.001 * (1 - d / 0.08);
      });
    }

    p.t += baseSpeed * laminar * flow * (0.6 + 0.6 * pulse)
         + noise
         + pressurePush;

    if (p.t > 1) p.t = random(-0.2, 0);

    // 🔑 HARD interior constraint
    p.lane += 0.0006 * sin(p.jitter * 0.7);
    p.lane = constrain(p.lane, -0.85, 0.85);

    // Supply wave re-oxygenates RBCs
    supplyWaves.forEach(w => {
      if (abs(p.t - w.t) < 0.08 && p.type === "rbc") {
        p.oxygenated = true;
      }
    });
  });
}

// -----------------------------------------------------
// Extraction (symbolic, pre-BBB)
// -----------------------------------------------------
function extractOxygenNearNeuron1() {
  const R = 120;

  bloodContents.forEach(p => {
    if (p.type !== "rbc") return;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    if (dist(pos.x, pos.y, neuron.x, neuron.y) < R) {
      p.oxygenated = false; // 🔑 visual flip
    }
  });
}

// -----------------------------------------------------
// Render — PARTICLES ONLY
// -----------------------------------------------------
function drawBloodContents() {
  noStroke();

  bloodContents.forEach(p => {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) return;

    // =========================
    // RBCs
    // =========================
    if (p.type === "rbc") {

      fill(
        p.oxygenated
          ? getColor("rbcOxy")
          : getColor("rbcDeoxy")
      );

      ellipse(pos.x, pos.y, p.size);

      // Oxygen dots only if oxygenated
      if (p.oxygenated) {
        fill(255);
        for (let i = 0; i < 4; i++) {
          const a = TWO_PI * i / 4;
          const r = p.size * 0.3;
          ellipse(pos.x + cos(a) * r, pos.y + sin(a) * r, 1.4);
        }
      }
    }

    // =========================
    // Water tracers
    // =========================
    if (p.type === "water") {
      fill(160, 210, 255);
      ellipse(pos.x, pos.y, p.size);
    }

    // =========================
    // Glucose
    // =========================
    if (p.type === "glucose") {
      fill(getColor("glucose"));
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size, 2);
    }
  });
}
