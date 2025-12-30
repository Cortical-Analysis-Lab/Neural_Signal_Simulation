// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS + AXON)
// Teaching-first, artery-excluded ECS (AUTHORITATIVE)
// =====================================================
console.log("🧂 extracellularIons loaded");

/* =====================================================
   GLOBAL STORAGE & SHARED CONSTANTS
   ===================================================== */

// reload-safe global store
window.ecsIons = {
  Na: [],
  K: [],
  NaFlux: [],
  KFlux: [],
  AxonNaStatic: [],
  AxonKStatic: [],
  AxonNaWave: [],
  AxonKFlux: []
};

const ION_TEXT_SIZE_NA = 10;
const ION_TEXT_SIZE_K  = 11;

const ECS_ION_COUNTS = { Na: 260, K: 160 };

const AXON_HALO_RADIUS    = 16;
const AXON_HALO_THICKNESS = 4;

const ION_VEL_DECAY = 0.965;

/* =====================================================
   🟡 Na⁺ — CONSTANTS & STATE
   ===================================================== */

// soma Na⁺
const NA_FLUX_SPEED    = 2;
const NA_FLUX_LIFETIME = 80;
const NA_SPAWN_RADIUS  = 140;

// axonal Na⁺ wave
const AXON_NA_LEAD_SEGMENTS = 40;
const AXON_NA_WAVE_SPEED    = 1.6;
const AXON_NA_WAVE_LIFETIME = 18;
const AXON_NA_WAVE_COUNT    = 3;
const AXON_NA_RADIAL_JITTER = 1.5;
const AXON_NA_SPAWN_INTERVAL = 0.04;

let lastAxonNaWavePhase = -Infinity;

/* =====================================================
   🔴 K⁺ — CONSTANTS & STATE
   ===================================================== */

// soma K⁺
const K_FLUX_SPEED    = 2.2;
const K_FLUX_LIFETIME = 160;
const K_SPAWN_RADIUS  = 28;

// axonal K⁺ efflux
const AXON_K_FLUX_SPEED    = 1.6;
const AXON_K_FLUX_LIFETIME = 40;
const AXON_K_SPAWN_COUNT   = 3;

const AXON_K_PHASE_STEP = 0.045;
let lastAxonKPhase = -Infinity;

/* =====================================================
   🟡 Na⁺ — SPAWNERS
   ===================================================== */

function triggerNaInfluxNeuron1() {
  for (let i = 0; i < 14; i++) {
    ecsIons.NaFlux.push({
      x: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      y: random(-NA_SPAWN_RADIUS, NA_SPAWN_RADIUS),
      life: NA_FLUX_LIFETIME
    });
  }
}

function triggerAxonNaWave() {
  if (!neuron?.axon?.path) return;
  if (window.currentAxonAPPhase == null) return;

  const path = neuron.axon.path;
  const apIdx = floor(window.currentAxonAPPhase * (path.length - 2));
  const naIdx = apIdx + AXON_NA_LEAD_SEGMENTS;

  if (naIdx <= 0 || naIdx >= path.length - 1) return;

  const p1 = path[naIdx];
  const p2 = path[naIdx + 1];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  const nx = -dy / len;
  const ny =  dx / len;

  for (let i = 0; i < AXON_NA_WAVE_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const r = AXON_HALO_RADIUS +
              random(-AXON_NA_RADIAL_JITTER, AXON_NA_RADIAL_JITTER);

    ecsIons.AxonNaWave.push({
      x: p1.x + nx * r * side,
      y: p1.y + ny * r * side,
      vx: -nx * AXON_NA_WAVE_SPEED * side,
      vy: -ny * AXON_NA_WAVE_SPEED * side,
      axonIdx: naIdx,
      state: "approach",
      life: AXON_NA_WAVE_LIFETIME
    });
  }
}

/* =====================================================
   🔴 K⁺ — SPAWNERS
   ===================================================== */

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

function triggerAxonKEfflux(apPhase) {
  if (!neuron?.axon?.path || apPhase == null) return;

  const path = neuron.axon.path;
  const idx  = floor(apPhase * (path.length - 2));
  const p1   = path[idx];
  const p2   = path[idx + 1];

  if (!p1 || !p2) return;

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  const nx = -dy / len;
  const ny =  dx / len;

  for (let i = 0; i < AXON_K_SPAWN_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    ecsIons.AxonKFlux.push({
      x: p1.x + nx * AXON_HALO_RADIUS * side,
      y: p1.y + ny * AXON_HALO_RADIUS * side,
      vx: nx * AXON_K_FLUX_SPEED * side,
      vy: ny * AXON_K_FLUX_SPEED * side,
      life: AXON_K_FLUX_LIFETIME
    });
  }
}

/* =====================================================
   🟡 Na⁺ — DYNAMICS
   ===================================================== */

function updateAxonNaWave(apPhase, path) {
  if (!path || apPhase == null) return;

  fill(getColor("sodium", 140));

  ecsIons.AxonNaWave = ecsIons.AxonNaWave.filter(p => {
    const apIdx = floor(apPhase * (path.length - 2));

    if (p.state === "approach") {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= ION_VEL_DECAY;
      p.vy *= ION_VEL_DECAY;

      if (apIdx >= p.axonIdx - 1) p.state = "inflow";
      text("Na⁺", p.x, p.y);
      return true;
    }

    if (p.state === "inflow") {
      const c = path[p.axonIdx];
      p.x = lerp(p.x, c.x, 0.35);
      p.y = lerp(p.y, c.y, 0.35);
      text("Na⁺", p.x, p.y);
      return dist(p.x, p.y, c.x, c.y) >= 1.2;
    }

    return false;
  });
}

function updateNaFlux() {
  fill(getColor("sodium", 120));

  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = Math.hypot(p.x, p.y) || 1;
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });
}

/* =====================================================
   🔴 K⁺ — DYNAMICS
   ===================================================== */

function updateAxonKFlux() {
  fill(getColor("potassium", 130));

  ecsIons.AxonKFlux = ecsIons.AxonKFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });
}

function updateKFlux() {
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;

    fill(getColor("potassium",
      map(p.life, 0, K_FLUX_LIFETIME, 0, 180)
    ));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });
}

/* =====================================================
   RENDERING (CONDUCTOR)
   ===================================================== */

function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  const apPhase = window.currentAxonAPPhase;
  const path    = neuron?.axon?.path;

  textSize(ION_TEXT_SIZE_NA);
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  textSize(ION_TEXT_SIZE_K);
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  if (apPhase != null && apPhase < lastAxonKPhase) lastAxonKPhase = -Infinity;
  if (apPhase != null && apPhase < lastAxonNaWavePhase) lastAxonNaWavePhase = -Infinity;

  if (apPhase != null && abs(apPhase - lastAxonNaWavePhase) > AXON_NA_SPAWN_INTERVAL) {
    triggerAxonNaWave();
    lastAxonNaWavePhase = apPhase;
  }

  if (apPhase != null && abs(apPhase - lastAxonKPhase) > AXON_K_PHASE_STEP) {
    triggerAxonKEfflux(apPhase);
    lastAxonKPhase = apPhase;
  }

  updateAxonNaWave(apPhase, path);
  updateAxonKFlux();
  updateNaFlux();
  updateKFlux();

  pop();
}

/* =====================================================
   INITIALIZATION
   ===================================================== */

function initExtracellularIons() {
  Object.values(window.ecsIons).forEach(arr => Array.isArray(arr) && (arr.length = 0));

  const b = { xmin:-width*0.9, xmax:width*0.9, ymin:-height*0.9, ymax:height*0.9 };
  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) ecsIons.Na.push({ x:random(b.xmin,b.xmax), y:random(b.ymin,b.ymax) });
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) ecsIons.K.push({ x:random(b.xmin,b.xmax), y:random(b.ymin,b.ymax) });
}

window.initExtracellularIons = initExtracellularIons;
