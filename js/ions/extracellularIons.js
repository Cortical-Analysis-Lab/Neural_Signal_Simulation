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
  AxonNaStatic: [], AxonKStatic: [],
  AxonNaInward: [] // ★ NEW: transient Na⁺ copies
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };
const AXON_STATIC_NA_COUNT = 8;
const AXON_STATIC_K_COUNT  = 4;

// -----------------------------------------------------
// HALO CONTROLS
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 16;
const AXON_HALO_THICKNESS = 4;

// --- AP → halo coupling ---
const HALO_AP_RADIUS     = 28;
const HALO_NA_PUSH       = -0.4;   // subtle (static)
const HALO_K_PUSH        =  1.4;   // ★ stronger outward
const HALO_RELAX         =  0.86;  // slower return

// --- Na⁺ inward copies ---
const AXON_NA_IN_SPEED   = 3.2;
const AXON_NA_IN_LIFE    = 18;

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
// SOMA PARAMETERS (UNCHANGED)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// =====================================================
// INITIALIZATION — ECS + AXON HALO
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
    ecsIons[type].push({
      x: random(b.xmin, b.xmax),
      y: random(b.ymin, b.ymax),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnECSIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnECSIon("K");

  // ------------------
  // AXON STATIC HALO
  // ------------------
  if (neuron?.axon?.path) {

    function spawnHalo(type, count) {
      const path = neuron.axon.path;

      for (let i = 0; i < count; i++) {

        const t   = i / count;
        const idx = floor(t * (path.length - 2));

        const p1 = path[idx];
        const p2 = path[idx + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = max(1, sqrt(dx*dx + dy*dy));

        const nx = -dy / len;
        const ny =  dx / len;
        const side = i % 2 === 0 ? 1 : -1;

        const r = random(
          AXON_HALO_RADIUS,
          AXON_HALO_RADIUS + AXON_HALO_THICKNESS
        );

        const x0 = p1.x + nx * r * side;
        const y0 = p1.y + ny * r * side;

        ecsIons[type].push({
          x: x0, y: y0,
          x0, y0,
          vx: 0, vy: 0,
          phase: random(TWO_PI)
        });
      }
    }

    spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
    spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
  }

  console.log("🧂 ECS + axon halo initialized");
}

// =====================================================
// 🧠 SOMA FLUX (UNCHANGED)
// =====================================================
function triggerNaInfluxNeuron1() {
  for (let i = 0; i < 14; i++) {
    ecsIons.NaFlux.push({
      x: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      y: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      life: NA_FLUX_LIFETIME
    });
  }
}

function triggerKEffluxNeuron1() {
  for (let i = 0; i < 16; i++) {
    const a = random(TWO_PI);
    ecsIons.KFlux.push({
      x: random(-K_SPAWN_RADIUS, K_SPAWN_RADIUS),
      y: random(-K_SPAWN_RADIUS, K_SPAWN_RADIUS),
      vx: cos(a) * K_FLUX_SPEED,
      vy: sin(a) * K_FLUX_SPEED,
      life: K_FLUX_LIFETIME
    });
  }
}

// =====================================================
// DRAWING — ECS + HALO + AXON + SOMA
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ---- ECS baseline ----
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

  // ---- AXON HALO (AP COUPLED) ----
  const apPhase = window.currentAxonAPPhase;
  const apPos =
    (apPhase != null && neuron?.axon?.path)
      ? neuron.axon.path[floor(apPhase * (neuron.axon.path.length - 1))]
      : null;

  function updateHalo(p, pushStrength, spawnNaCopy = false) {

    if (apPos) {
      const dx = p.x0 - apPos.x;
      const dy = p.y0 - apPos.y;
      const d  = sqrt(dx*dx + dy*dy);

      if (d < HALO_AP_RADIUS) {
        const f = 1 - d / HALO_AP_RADIUS;

        p.vx += (dx / max(d, 1)) * pushStrength * f;
        p.vy += (dy / max(d, 1)) * pushStrength * f;

        // ★ spawn Na⁺ inward copy
        if (spawnNaCopy) {
          ecsIons.AxonNaInward.push({
            x: p.x,
            y: p.y,
            vx: -(dx / max(d, 1)) * AXON_NA_IN_SPEED,
            vy: -(dy / max(d, 1)) * AXON_NA_IN_SPEED,
            life: AXON_NA_IN_LIFE
          });
        }
      }
    }

    p.vx += (p.x0 - p.x) * 0.03;
    p.vy += (p.y0 - p.y) * 0.03;

    p.vx *= HALO_RELAX;
    p.vy *= HALO_RELAX;

    p.x += p.vx;
    p.y += p.vy;
  }

  // ---- Na⁺ static + inward copies ----
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaStatic.forEach(p => {
    updateHalo(p, HALO_NA_PUSH, true);
    text("Na⁺", p.x, p.y);
  });

  ecsIons.AxonNaInward = ecsIons.AxonNaInward.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ---- K⁺ static (strong outward plume) ----
  fill(...ION_COLOR.K, 150);
  ecsIons.AxonKStatic.forEach(p => {
    updateHalo(p, HALO_K_PUSH, false);
    text("K⁺", p.x, p.y);
  });

  // ---- SOMA Na⁺ ----
  fill(...ION_COLOR.Na, ION_ALPHA.Na);
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = max(1, sqrt(p.x*p.x + p.y*p.y));
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ---- SOMA K⁺ ----
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    fill(...ION_COLOR.K, map(p.life, 0, K_FLUX_LIFETIME, 0, ION_ALPHA.K));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}
