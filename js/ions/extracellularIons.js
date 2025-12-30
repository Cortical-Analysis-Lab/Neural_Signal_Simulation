// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS + AXON)
// Teaching-first, artery-excluded ECS (AUTHORITATIVE)
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (reload-safe)
// -----------------------------------------------------
window.ecsIons = {
  Na: [],
  K: [],
  NaFlux: [],
  KFlux: [],
  AxonNaStatic: [],
  AxonKStatic: [],
  AxonKFlux: [],
  AxonNaWave: []
};

// -----------------------------------------------------
// CONSTANTS & TUNING
// -----------------------------------------------------
const ION_TEXT_SIZE_NA = 10;
const ION_TEXT_SIZE_K  = 11;

const ECS_ION_COUNTS = { Na: 260, K: 160 };
const AXON_STATIC_NA_COUNT = 8;
const AXON_STATIC_K_COUNT  = 4;

const AXON_HALO_RADIUS    = 16;
const AXON_HALO_THICKNESS = 4;

const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;
const HALO_NA_RELAX = 0.95;
const HALO_K_RELAX  = 0.80;

const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;

const ION_VEL_DECAY     = 0.965;

const AXON_NA_WAVE_SPEED    = 0.9;
const AXON_NA_WAVE_LIFETIME = 28;
const AXON_NA_WAVE_COUNT    = 3;
const AXON_NA_PHASE_STEP    = 0.045;
const AXON_NA_LEAD_SEGMENTS = 30; // 🔥 5× knob for predictive Na+ lead

const AXON_K_FLUX_SPEED    = 1.6;
const AXON_K_FLUX_LIFETIME = 40;
const AXON_K_SPAWN_COUNT   = 3;
const AXON_K_PHASE_STEP    = 0.045;

let lastAxonNaWavePhase = -Infinity;
let lastAxonKPhase = -Infinity;

// =====================================================
// AXONAL Na⁺ WAVE SPAWNER (PREDICTIVE)
// =====================================================
function triggerAxonNaWave() {
  if (!window.neuron?.axon?.path) return;
  if (window.currentAxonAPPhase == null) return;

  const path = window.neuron.axon.path;

  // 🔑 CURRENT AP POSITION
  const apIdx = Math.floor(
    window.currentAxonAPPhase * (path.length - 2)
  );

  // 🔑 PUSH Na⁺ AHEAD SPATIALLY
  const naIdx = apIdx + AXON_NA_LEAD_SEGMENTS;

  if (naIdx <= 0 || naIdx >= path.length - 1) return;

  const p1 = path[naIdx];
  const p2 = path[naIdx + 1];

  if (!p1 || !p2) return;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  // Membrane normal (inward)
  const nx = -dy / len;
  const ny =  dx / len;

  for (let i = 0; i < AXON_NA_WAVE_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;

    window.ecsIons.AxonNaWave.push({
      x: p1.x + nx * AXON_HALO_RADIUS * side,
      y: p1.y + ny * AXON_HALO_RADIUS * side,
      vx: -nx * AXON_NA_WAVE_SPEED * side,
      vy: -ny * AXON_NA_WAVE_SPEED * side,
      life: AXON_NA_WAVE_LIFETIME
    });
  }
}

// =====================================================
// AXONAL K⁺ EFFLUX SPAWNER
// =====================================================
function triggerAxonKEfflux(apPhase) {
  if (!window.neuron?.axon?.path || apPhase == null) return;

  const path = window.neuron.axon.path;
  const idx  = Math.floor(apPhase * (path.length - 2));
  const p1   = path[idx];
  const p2   = path[idx + 1];

  if (!p1 || !p2) return;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  // Membrane normal (outward)
  const nx = -dy / len;
  const ny =  dx / len;

  for (let i = 0; i < AXON_K_SPAWN_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    window.ecsIons.AxonKFlux.push({
      x: p1.x + nx * AXON_HALO_RADIUS * side,
      y: p1.y + ny * AXON_HALO_RADIUS * side,
      vx: nx * AXON_K_FLUX_SPEED * side,
      vy: ny * AXON_K_FLUX_SPEED * side,
      life: AXON_K_FLUX_LIFETIME
    });
  }
}

// =====================================================
// SOMA ION TRIGGERS
// =====================================================
function triggerNaInfluxNeuron1() {
  for (let i = 0; i < 14; i++) {
    window.ecsIons.NaFlux.push({
      x: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      y: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      life: NA_FLUX_LIFETIME
    });
  }
}

function triggerKEffluxNeuron1() {
  for (let i = 0; i < 16; i++) {
    const a = random(TWO_PI);
    window.ecsIons.KFlux.push({
      x: random(-K_SPAWN_RADIUS, K_SPAWN_RADIUS),
      y: random(-K_SPAWN_RADIUS, K_SPAWN_RADIUS),
      vx: cos(a) * K_FLUX_SPEED,
      vy: sin(a) * K_FLUX_SPEED,
      life: K_FLUX_LIFETIME
    });
  }
}

// =====================================================
// MAIN DRAWING & PHYSICS LOOP
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  const apPhase = window.currentAxonAPPhase;

  // 1. BASELINE ECS RENDERING
  textSize(ION_TEXT_SIZE_NA);
  fill(100, 180, 255, 120); // Sodium blue
  window.ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  textSize(ION_TEXT_SIZE_K);
  fill(255, 160, 60, 130);  // Potassium orange
  window.ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  // 2. PHASE GATE RESET (When signal cycles)
  if (apPhase != null && apPhase < lastAxonKPhase) {
    lastAxonKPhase = -Infinity;
    lastAxonNaWavePhase = -Infinity;
  }

  // 3. Na⁺ PRE-DEPOLARIZATION WAVE
  if (apPhase != null && Math.abs(apPhase - lastAxonNaWavePhase) > AXON_NA_PHASE_STEP) {
    triggerAxonNaWave();
    lastAxonNaWavePhase = apPhase;
  }

  fill(100, 180, 255, 140);
  window.ecsIons.AxonNaWave = window.ecsIons.AxonNaWave.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    p.vx *= ION_VEL_DECAY; p.vy *= ION_VEL_DECAY;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // 4. AXONAL K⁺ EFFLUX
  if (apPhase != null && Math.abs(apPhase - lastAxonKPhase) > AXON_K_PHASE_STEP) {
    triggerAxonKEfflux(apPhase);
    lastAxonKPhase = apPhase;
  }

  fill(255, 160, 60, 130);
  window.ecsIons.AxonKFlux = window.ecsIons.AxonKFlux.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    p.vx *= ION_VEL_DECAY; p.vy *= ION_VEL_DECAY;
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  // 5. AXON HALOS (STATIC SPRING PHYSICS)
  fill(100, 180, 255, 120);
  window.ecsIons.AxonNaStatic.forEach(p => {
    p.vx += (p.x - p.x0) * HALO_NA_PERTURB;
    p.vy += (p.y - p.y0) * HALO_NA_PERTURB;
    p.vx += (p.x0 - p.x) * 0.06;
    p.vy += (p.y0 - p.y) * 0.06;
    p.vx *= HALO_NA_RELAX; p.vy *= HALO_NA_RELAX;
    p.x += p.vx; p.y += p.vy;
    text("Na⁺", p.x, p.y);
  });

  fill(255, 160, 60, 130);
  window.ecsIons.AxonKStatic.forEach(p => {
    p.vx += (p.x - p.x0) * HALO_K_PUSH * 0.01;
    p.vy += (p.y - p.y0) * HALO_K_PUSH * 0.01;
    p.vx += (p.x0 - p.x) * 0.008;
    p.vy += (p.y0 - p.y) * 0.008;
    p.vx *= HALO_K_RELAX; p.vy *= HALO_K_RELAX;
    p.x += p.vx; p.y += p.vy;
    text("K⁺", p.x, p.y);
  });

  // 6. SOMA FLUXES
  fill(100, 180, 255, 120);
  window.ecsIons.NaFlux = window.ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = Math.hypot(p.x, p.y) || 1;
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  window.ecsIons.KFlux = window.ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    p.vx *= ION_VEL_DECAY; p.vy *= ION_VEL_DECAY;
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

// =====================================================
// INITIALIZATION
// =====================================================
function initExtracellularIons() {
  Object.values(window.ecsIons).forEach(arr => {
    if (Array.isArray(arr)) arr.length = 0;
  });

  // ECS Baseline Spawn
  const b = { xmin: -width * 0.9, xmax: width * 0.9, ymin: -height * 0.9, ymax: height * 0.9 };
  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) {
    window.ecsIons.Na.push({ x: random(b.xmin, b.xmax), y: random(b.ymin, b.ymax) });
  }
  for (let i = 0; i < ECS_ION_COUNTS.K; i++) {
    window.ecsIons.K.push({ x: random(b.xmin, b.xmax), y: random(b.ymin, b.ymax) });
  }

  // Static Axon Halos
  if (!window.neuron?.axon?.path) return;
  const path = window.neuron.axon.path;

  const spawnHalo = (type, count) => {
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const idx = Math.floor(t * (path.length - 2));
      const p1 = path[idx];
      const p2 = path[idx + 1];
      const len = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const nx = -(p2.y - p1.y) / len;
      const ny =  (p2.x - p1.x) / len;
      const side = i % 2 === 0 ? 1 : -1;
      const r = random(AXON_HALO_RADIUS, AXON_HALO_RADIUS + AXON_HALO_THICKNESS);

      window.ecsIons[type].push({
        x: p1.x + nx * r * side,
        y: p1.y + ny * r * side,
        x0: p1.x + nx * r * side,
        y0: p1.y + ny * r * side,
        vx: 0, vy: 0
      });
    }
  };

  spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
  spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
}

// Attach to global window
window.initExtracellularIons = initExtracellularIons;
window.drawExtracellularIons = drawExtracellularIons;
window.triggerNaInfluxNeuron1 = triggerNaInfluxNeuron1;
window.triggerKEffluxNeuron1 = triggerKEffluxNeuron1;
