// =====================================================
// AXON IONS — HALOS, Na⁺ WAVE, K⁺ EFFLUX
// =====================================================
console.log("🧬 axonIons loaded");

// -----------------------------------------------------
// GLOBAL ECS STORAGE (RELOAD-SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};

ecsIons.AxonNaStatic = ecsIons.AxonNaStatic || [];
ecsIons.AxonKStatic  = ecsIons.AxonKStatic  || [];
ecsIons.AxonNaWave   = ecsIons.AxonNaWave   || [];
ecsIons.AxonKFlux    = ecsIons.AxonKFlux    || [];

// -----------------------------------------------------
// AXON HALO GEOMETRY (STATIC CONTEXT)
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 28;
const AXON_HALO_THICKNESS = 4;

// -----------------------------------------------------
// HALO DYNAMICS (BACKGROUND ONLY)
// -----------------------------------------------------
const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;
const HALO_NA_RELAX   = 0.95;
const HALO_K_RELAX    = 0.80;

// -----------------------------------------------------
// Na⁺ WAVE — TEACHING / TUNING KNOBS
// -----------------------------------------------------
const AXON_NA_WAVE_SPEED      = 1.6;   // inward velocity
const AXON_NA_WAVE_RADIUS    = 28;    // spawn distance from membrane
const AXON_NA_WAVE_LIFETIME  = 24;    // frames
const AXON_NA_MIDLINE_RADIUS = 6;     // kill at axon core
const NA_APPROACH_DECAY      = 0.99;

// -----------------------------------------------------
// K⁺ EFFLUX (VISIBLE AP ONLY)
// -----------------------------------------------------
const AXON_K_FLUX_SPEED     = 1.6;
const AXON_K_FLUX_LIFETIME  = 40;
const AXON_K_SPAWN_COUNT    = 3;
const AXON_K_PHASE_STEP     = 0.045;

let lastAxonKPhase = -Infinity;

// -----------------------------------------------------
// 🔑 Na⁺ WAVE GATES (CRITICAL)
// -----------------------------------------------------
let lastNaWaveIdx = -1;        // prevents per-frame respawn
let naWaveActiveLeft  = false;
let naWaveActiveRight = false;

// =====================================================
// AXON Na⁺ WAVE — DRIVEN BY INVISIBLE AP PHASE
// =====================================================
function triggerAxonNaWave(apPhase) {

  if (!neuron?.axon?.path || apPhase == null) return;

  const path = neuron.axon.path;
  const idx  = Math.floor(apPhase * (path.length - 2));
  if (idx <= 0 || idx >= path.length - 1) return;

  // ---------------------------------------------
  // SEGMENT GATE — only spawn on new segment
  // ---------------------------------------------
  if (idx === lastNaWaveIdx) return;
  lastNaWaveIdx = idx;

  const p1 = path[idx];
  const p2 = path[idx + 1];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  // inward membrane normal
  const nx = -dy / len;
  const ny =  dx / len;

  // ---------------------------------------------
  // LEFT SIDE (singleton)
  // ---------------------------------------------
  if (!naWaveActiveLeft) {
    ecsIons.AxonNaWave.push({
      x: p1.x - nx * AXON_NA_WAVE_RADIUS,
      y: p1.y - ny * AXON_NA_WAVE_RADIUS,
      vx:  nx * AXON_NA_WAVE_SPEED,
      vy:  ny * AXON_NA_WAVE_SPEED,
      side: -1,
      axonIdx: idx,
      life: AXON_NA_WAVE_LIFETIME
    });
    naWaveActiveLeft = true;
  }

  // ---------------------------------------------
  // RIGHT SIDE (singleton)
  // ---------------------------------------------
  if (!naWaveActiveRight) {
    ecsIons.AxonNaWave.push({
      x: p1.x + nx * AXON_NA_WAVE_RADIUS,
      y: p1.y + ny * AXON_NA_WAVE_RADIUS,
      vx: -nx * AXON_NA_WAVE_SPEED,
      vy: -ny * AXON_NA_WAVE_SPEED,
      side: +1,
      axonIdx: idx,
      life: AXON_NA_WAVE_LIFETIME
    });
    naWaveActiveRight = true;
  }
}

// =====================================================
// AXON K⁺ EFFLUX — VISIBLE AP ONLY
// =====================================================
function triggerAxonKEfflux(apPhase) {

  if (!neuron?.axon?.path || apPhase == null) return;
  if (Math.abs(apPhase - lastAxonKPhase) < AXON_K_PHASE_STEP) return;
  lastAxonKPhase = apPhase;

  const path = neuron.axon.path;
  const idx  = Math.floor(apPhase * (path.length - 2));
  if (idx <= 0 || idx >= path.length - 1) return;

  const p1 = path[idx];
  const p2 = path[idx + 1];

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

// =====================================================
// DRAW
// =====================================================
function drawAxonIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ------------------------------
  // Na⁺ WAVE (SINGLE PAIR)
  // ------------------------------
  fill(getColor("sodium", 140));

  ecsIons.AxonNaWave = ecsIons.AxonNaWave.filter(p => {

    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NA_APPROACH_DECAY;
    p.vy *= NA_APPROACH_DECAY;

    const center = neuron.axon.path[p.axonIdx];
    if (dist(p.x, p.y, center.x, center.y) < AXON_NA_MIDLINE_RADIUS) {
      if (p.side === -1) naWaveActiveLeft  = false;
      if (p.side === +1) naWaveActiveRight = false;
      return false;
    }

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ------------------------------
  // K⁺ EFFLUX
  // ------------------------------
  fill(getColor("potassium", 130));

  ecsIons.AxonKFlux = ecsIons.AxonKFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

// =====================================================
// INITIALIZATION
// =====================================================
function initAxonIons() {
  ecsIons.AxonNaStatic.length = 0;
  ecsIons.AxonKStatic.length  = 0;
  ecsIons.AxonNaWave.length   = 0;
  ecsIons.AxonKFlux.length    = 0;

  lastNaWaveIdx = -1;
  naWaveActiveLeft  = false;
  naWaveActiveRight = false;
}

// =====================================================
// EXPORTS
// =====================================================
window.triggerAxonNaWave   = triggerAxonNaWave;
window.triggerAxonKEfflux = triggerAxonKEfflux;
window.drawAxonIons       = drawAxonIons;
window.initAxonIons       = initAxonIons;
