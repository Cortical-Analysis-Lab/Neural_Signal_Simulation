// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS + AXON)
// Teaching-first, artery-excluded ECS (AUTHORITATIVE)
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = {
  Na: [], K: [],
  NaFlux: [], KFlux: [],
  AxonNaFlux: [], AxonKFlux: [],
  AxonNaStatic: [], AxonKStatic: []
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };
const AXON_STATIC_NA_COUNT = 8;
const AXON_STATIC_K_COUNT  = 4;

// -----------------------------------------------------
// 🔧 HALO CONTROLS (ONLY TUNING YOU NEED)
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 16; // 14–18 sweet spot
const AXON_HALO_THICKNESS = 4;

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };
const ION_ALPHA    = { Na: 170, K: 185 };

const ION_COLOR = {
  Na: [245, 215, 90],
  K:  [255, 140, 190]
};

// -----------------------------------------------------
// SOMA PARAMETERS (LOCKED)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// -----------------------------------------------------
// AXON PARAMETERS (APPROVED)
// -----------------------------------------------------
const AXON_NA_SPEED     = 1.8;
const AXON_NA_LIFETIME  = 26;

const AXON_K_SPEED      = 2.0;
const AXON_K_LIFETIME   = 120;
const AXON_K_DECAY      = 0.97;

// =====================================================
// ECS EXCLUSION RULES (BASELINE ONLY)
// =====================================================
function inArteryThird(x) {
  return x < -width * 0.33;
}

function inVoltageTrace(x, y) {
  return abs(x) < 240 && abs(y - height * 0.28) < 130;
}

function validECS(x, y) {
  return !(inArteryThird(x) || inVoltageTrace(x, y));
}

// =====================================================
// INITIALIZATION — ECS + AXON HALO (EVENLY SPACED)
// =====================================================
function initExtracellularIons() {

  Object.values(ecsIons).forEach(arr => arr.length = 0);

  // ------------------
  // ECS baseline
  // ------------------
  const b = {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };

  function spawnECSIon(type) {
    let tries = 0;
    while (tries++ < 1400) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);
      if (!validECS(x, y)) continue;

      ecsIons[type].push({
        x, y, phase: random(TWO_PI)
      });
      return;
    }
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnECSIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnECSIon("K");

  // ------------------
  // AXON STATIC HALO — EVEN DISTRIBUTION
  // ------------------
  if (neuron?.axon?.path) {

    function spawnAxonStatic(type, count) {
      const path = neuron.axon.path;

      for (let i = 0; i < count; i++) {

        // evenly spaced along path
        const t   = i / count;
        const idx = floor(t * (path.length - 2));

        const p1 = path[idx];
        const p2 = path[idx + 1];

        const tx = p2.x - p1.x;
        const ty = p2.y - p1.y;
        const len = max(1, sqrt(tx*tx + ty*ty));

        // unit normal
        const nx = -ty / len;
        const ny =  tx / len;

        // bilateral placement
        const side = i % 2 === 0 ? 1 : -1;

        const r = random(
          AXON_HALO_RADIUS,
          AXON_HALO_RADIUS + AXON_HALO_THICKNESS
        );

        ecsIons[type].push({
          x: p1.x + nx * r * side,
          y: p1.y + ny * r * side,
          phase: random(TWO_PI)
        });
      }
    }

    spawnAxonStatic("AxonNaStatic", AXON_STATIC_NA_COUNT);
    spawnAxonStatic("AxonKStatic",  AXON_STATIC_K_COUNT);
  }

  console.log("🧂 ECS + axon halo initialized (even spacing)");
}

// =====================================================
// DRAWING — STATIC ONLY
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ECS baseline
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p =>
    text("Na⁺",
      p.x + sin(state.time * 0.0018 + p.phase) * 0.4,
      p.y - sin(state.time * 0.0018 + p.phase) * 0.4)
  );

  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p =>
    text("K⁺",
      p.x - cos(state.time * 0.0016 + p.phase) * 0.35,
      p.y + cos(state.time * 0.0016 + p.phase) * 0.35)
  );

  // Axon halo
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaStatic.forEach(p =>
    text("Na⁺",
      p.x + sin(state.time * 0.002 + p.phase) * 0.3,
      p.y - cos(state.time * 0.002 + p.phase) * 0.3)
  );

  fill(...ION_COLOR.K, 150);
  ecsIons.AxonKStatic.forEach(p =>
    text("K⁺",
      p.x - sin(state.time * 0.002 + p.phase) * 0.3,
      p.y + cos(state.time * 0.002 + p.phase) * 0.3)
  );

  pop();
}
