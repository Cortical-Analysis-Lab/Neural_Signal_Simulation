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
  
};
// Axonal K⁺ efflux particles (AP-coupled)
window.ecsIons.AxonKFlux = [];
window.ecsIons.AxonNaWave = [];

const ION_TEXT_SIZE_NA = 10;
const ION_TEXT_SIZE_K  = 11;

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

// Static halo emphasis
const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;

// Relaxation
const HALO_NA_RELAX = 0.95;
const HALO_K_RELAX  = 0.80;

// ------------------
// SOMA FLUX CONSTANTS
// ------------------
const NA_FLUX_SPEED     = 2;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;

const ION_VEL_DECAY     = 0.965;

// -----------------------------------------------------
// AXONAL Na⁺ WAVE (LEADING, DETACHED FROM HALO)
// -----------------------------------------------------
const AXON_NA_WAVE_SPEED    = 1.6;
const AXON_NA_WAVE_LIFETIME = 18;
const AXON_NA_WAVE_COUNT    = 3;

const AXON_NA_SPAWN_INTERVAL = 0.04;

let lastAxonNaWavePhase = -Infinity;

// -----------------------------------------------------
// AXONAL K⁺ EFFLUX (AP-LOCKED)
// -----------------------------------------------------
const AXON_K_FLUX_SPEED    = 1.6;
const AXON_K_FLUX_LIFETIME = 40;
const AXON_K_SPAWN_COUNT   = 3;

// -----------------------------------------------------
// AXONAL K⁺ PHASE GATING
// -----------------------------------------------------
let lastAxonKPhase = -Infinity;
const AXON_K_PHASE_STEP = 0.045;

// =====================================================
// AXONAL Na⁺ WAVE SPAWNER (PREDICTIVE)
// =====================================================
const AXON_NA_LEAD_SEGMENTS = 25; 

function triggerAxonNaWave() {
  if (!window.axonNaActive) return;
  if (!neuron?.axon?.path) return;
  if (window.currentAxonAPPhase == null) return;

  const path = neuron.axon.path;

  // -----------------------------
  // AP position (authoritative)
  // -----------------------------
  const apIdx = floor(
    window.currentAxonAPPhase * (path.length - 2)
  );

  // -----------------------------
  // Na⁺ lead (AIS-biased early)
  // -----------------------------
  const lead =
    window.currentAxonAPPhase < 0.08
      ? AXON_NA_LEAD_SEGMENTS * 0.35
      : AXON_NA_LEAD_SEGMENTS;

  const naIdx = apIdx + floor(lead);
  if (naIdx < 0 || naIdx >= path.length - 1) return;

  const p1 = path[naIdx];
  const p2 = path[naIdx + 1];
  if (!p1 || !p2) return;

  // -----------------------------
  // Geometry
  // -----------------------------
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  const tx = dx / len;
  const ty = dy / len;

  // inward membrane normal
  const nx = -ty;
  const ny =  tx;

  // -----------------------------
  // Spawn Na⁺ particles
  // -----------------------------
    const normalStrength   = 1.2;
    const backwardStrength = 0.6;
    
    for (let i = 0; i < AXON_NA_WAVE_COUNT; i++) {
      const side = i % 2 === 0 ? 1 : -1;
    
      ecsIons.AxonNaWave.push({
        x: p1.x + nx * AXON_HALO_RADIUS * side,
        y: p1.y + ny * AXON_HALO_RADIUS * side,
    
        // inward + backward (mirror of K⁺)
        vx: (-nx * normalStrength * side - tx * backwardStrength) * AXON_NA_WAVE_SPEED,
        vy: (-ny * normalStrength * side - ty * backwardStrength) * AXON_NA_WAVE_SPEED,
    
        life: AXON_NA_WAVE_LIFETIME
      });
    }

}


// =====================================================
// 🧠 SOMA ION TRIGGERS (UNCHANGED)
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

  function triggerAxonKEfflux(apPhase) {
    if (!neuron?.axon?.path || apPhase == null) return;
  
    const path = neuron.axon.path;
    const idx  = floor(apPhase * (path.length - 2));
    const p1   = path[idx];
    const p2   = path[idx + 1];
  
    if (!p1 || !p2) return;
  
    // Tangent
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
  
    // Membrane normal (outward)
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


// =====================================================
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  const apPhase = window.currentAxonAPPhase;

  // ==============================
  // ECS BASELINE
  // ==============================
  textSize(ION_TEXT_SIZE_NA);
  fill(getColor("sodium", 120));
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  textSize(ION_TEXT_SIZE_K);
  fill(getColor("potassium", 130));
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  // ==============================
  // RESET PHASE GATES ON NEW AP
  // ==============================
  if (apPhase != null && apPhase < lastAxonKPhase) {
    lastAxonKPhase = -Infinity;
  }

  if (apPhase != null && apPhase < lastAxonNaWavePhase) {
    lastAxonNaWavePhase = -Infinity;
  }

  // ==============================
  // 🟡 Na⁺ PRE-DEPOLARIZATION WAVE
  // Spatially LEADS AP (index-based)
  // ==============================
  if (
    apPhase != null &&
    abs(apPhase - lastAxonNaWavePhase) > AXON_NA_SPAWN_INTERVAL
  ) {
    triggerAxonNaWave();
    lastAxonNaWavePhase = apPhase;
  }


  // ---- DRAW Na⁺ WAVE ----
  fill(getColor("sodium", 140));
  ecsIons.AxonNaWave = ecsIons.AxonNaWave.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ==============================
  // 🔴 AXONAL K⁺ EFFLUX (TRAILS AP)
  // ==============================
  if (
    apPhase != null &&
    abs(apPhase - lastAxonKPhase) > AXON_K_PHASE_STEP
  ) {
    triggerAxonKEfflux(apPhase);
    lastAxonKPhase = apPhase;
  }

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

  // ==============================
  // AXON HALOS (STATIC CONTEXT)
  // ==============================
  fill(getColor("sodium", 120));
  ecsIons.AxonNaStatic.forEach(p => {
    p.vx += (p.x - p.x0) * HALO_NA_PERTURB;
    p.vy += (p.y - p.y0) * HALO_NA_PERTURB;
    p.vx += (p.x0 - p.x) * 0.06;
    p.vy += (p.y0 - p.y) * 0.06;
    p.vx *= HALO_NA_RELAX;
    p.vy *= HALO_NA_RELAX;
    p.x += p.vx;
    p.y += p.vy;
    text("Na⁺", p.x, p.y);
  });

  fill(getColor("potassium", 130));
  ecsIons.AxonKStatic.forEach(p => {
    p.vx += (p.x - p.x0) * HALO_K_PUSH * 0.01;
    p.vy += (p.y - p.y0) * HALO_K_PUSH * 0.01;
    p.vx += (p.x0 - p.x) * 0.008;
    p.vy += (p.y0 - p.y) * 0.008;
    p.vx *= HALO_K_RELAX;
    p.vy *= HALO_K_RELAX;
    p.x += p.vx;
    p.y += p.vy;
    text("K⁺", p.x, p.y);
  });

  // ==============================
  // 🧠 SOMA FLUXES (UNCHANGED)
  // ==============================
  fill(getColor("sodium", 120));
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = Math.hypot(p.x, p.y) || 1;
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    fill(getColor("potassium", map(p.life, 0, K_FLUX_LIFETIME, 0, 180)));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}



// =====================================================
// INITIALIZATION (REQUIRED)
// =====================================================
function initExtracellularIons() {

  // clear all ECS arrays safely
  Object.values(window.ecsIons).forEach(arr => {
    if (Array.isArray(arr)) arr.length = 0;
  });

  // ------------------
  // ECS BASELINE
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
      y: random(b.ymin, b.ymax)
    });
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnECSIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnECSIon("K");

  // ------------------
  // AXON STATIC HALOS
  // ------------------
  if (!neuron?.axon?.path) return;

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

      const r = random(AXON_HALO_RADIUS, AXON_HALO_RADIUS + AXON_HALO_THICKNESS);

      const x0 = p1.x + nx * r * side;
      const y0 = p1.y + ny * r * side;

      ecsIons[type].push({
        x: x0, y: y0,
        x0, y0,
        vx: 0, vy: 0
      });
    }
  }

  spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
  spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
}


window.initExtracellularIons = initExtracellularIons;
