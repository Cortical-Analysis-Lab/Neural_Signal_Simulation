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
  AxonNaCopies: []   // ★ bilateral Na⁺ convergence copies
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };
const AXON_STATIC_NA_COUNT = 8;
const AXON_STATIC_K_COUNT  = 4;

// -----------------------------------------------------
// AXON HALO GEOMETRY
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 16;
const AXON_HALO_THICKNESS = 4;

// -----------------------------------------------------
// AP → HALO COUPLING
// -----------------------------------------------------
const HALO_AP_RADIUS = 28;

// Static halo motion (minimal)
const HALO_NA_PERTURB = 0.06;   // visual emphasis only
const HALO_K_PUSH     = 1.6;    // strong outward plume

// Relaxation
const HALO_NA_RELAX = 0.95;
const HALO_K_RELAX  = 0.80;

// Bilateral Na⁺ copy motion
const NA_COPY_SPEED = 2.8;
const NA_COPY_LIFE  = 16;

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };

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
// INITIALIZATION
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
        const p1  = path[idx];
        const p2  = path[idx + 1];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;

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
          lastAPPhase: -Infinity
        });
      }
    }

    spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
    spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
  }
}

// =====================================================
// 🧠 SOMA ION FLUX (PRESERVED)
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
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ------------------
  // ECS baseline
  // ------------------
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  // ------------------
  // AP position + normal
  // ------------------
  const apPhase = window.currentAxonAPPhase;
  let apPos = null;
  let nx = 0, ny = 0;

  if (apPhase != null && neuron?.axon?.path) {
    const idx = floor(apPhase * (neuron.axon.path.length - 2));
    const p1  = neuron.axon.path[idx];
    const p2  = neuron.axon.path[idx + 1];

    apPos = p1;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;

    nx = -dy / len;
    ny =  dx / len;
  }

  // ------------------
  // Na⁺ STATIC HALO + BILATERAL COPIES
  // ------------------
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaStatic.forEach(p => {

    if (apPos && abs(apPhase - p.lastAPPhase) > 0.06) {

      const dx = p.x0 - apPos.x;
      const dy = p.y0 - apPos.y;
      const d  = Math.hypot(dx, dy);

      if (d < HALO_AP_RADIUS) {

        // subtle highlight only
        p.vx += -nx * HALO_NA_PERTURB;
        p.vy += -ny * HALO_NA_PERTURB;

        // ★ bilateral inward Na⁺ copies
        ecsIons.AxonNaCopies.push({
          x: p.x,
          y: p.y,
          vx: -nx * NA_COPY_SPEED,
          vy: -ny * NA_COPY_SPEED,
          life: NA_COPY_LIFE
        });

        p.lastAPPhase = apPhase;
      }
    }

    // strong tether
    p.vx += (p.x0 - p.x) * 0.06;
    p.vy += (p.y0 - p.y) * 0.06;

    p.vx *= HALO_NA_RELAX;
    p.vy *= HALO_NA_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("Na⁺", p.x, p.y);
  });

  // ------------------
  // Na⁺ CONVERGING COPIES
  // ------------------
  ecsIons.AxonNaCopies = ecsIons.AxonNaCopies.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ------------------
  // K⁺ STATIC HALO (OUTWARD PLUME)
  // ------------------
  fill(...ION_COLOR.K, 150);
  ecsIons.AxonKStatic.forEach(p => {

    if (apPos) {
      const dx = p.x0 - apPos.x;
      const dy = p.y0 - apPos.y;
      const d  = Math.hypot(dx, dy);

      if (d < HALO_AP_RADIUS) {
        p.vx += nx * HALO_K_PUSH;
        p.vy += ny * HALO_K_PUSH;
      }
    }

    // weak tether → plume persists
    p.vx += (p.x0 - p.x) * 0.008;
    p.vy += (p.y0 - p.y) * 0.008;

    p.vx *= HALO_K_RELAX;
    p.vy *= HALO_K_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("K⁺", p.x, p.y);
  });

  // ------------------
  // 🧠 SOMA Na⁺ INFLUX
  // ------------------
  fill(...ION_COLOR.Na, 170);
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = Math.hypot(p.x, p.y) || 1;
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ------------------
  // 🧠 SOMA K⁺ EFFLUX
  // ------------------
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    fill(...ION_COLOR.K, map(p.life, 0, K_FLUX_LIFETIME, 0, 180));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}
