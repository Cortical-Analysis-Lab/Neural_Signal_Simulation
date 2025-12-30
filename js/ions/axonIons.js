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
// AXON HALO GEOMETRY
// -----------------------------------------------------
const AXON_HALO_RADIUS    = 28;
const AXON_HALO_THICKNESS = 4;

// -----------------------------------------------------
// HALO DYNAMICS
// -----------------------------------------------------
const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;
const HALO_NA_RELAX   = 0.95;
const HALO_K_RELAX    = 0.80;

// -----------------------------------------------------
// Na⁺ WAVE — TEACHING KNOBS
// -----------------------------------------------------
const AXON_NA_WAVE_SPEED    = 1.6;
const AXON_NA_WAVE_RADIUS   = 28;
const AXON_NA_WAVE_LIFETIME = 28;

const AXON_NA_WAVE_COUNT = 0.2;        // per side
const AXON_NA_MAX_PER_SIDE = 1;      // density clamp (per side)
const AXON_NA_MIDLINE_RADIUS = 6;    // axon core cutoff

const NA_APPROACH_DECAY = 0.99;

// -----------------------------------------------------
// K⁺ EFFLUX (VISIBLE AP)
// -----------------------------------------------------
const AXON_K_FLUX_SPEED     = 1.6;
const AXON_K_FLUX_LIFETIME  = 40;
const AXON_K_SPAWN_COUNT    = 3;
const AXON_K_PHASE_STEP     = 0.045;

let lastAxonKPhase = -Infinity;

// =====================================================
// AXON Na⁺ WAVE — DRIVEN BY INVISIBLE AP PHASE
// =====================================================
function triggerAxonNaWave(apPhase) {

  if (!neuron?.axon?.path || apPhase == null) return;

  const path = neuron.axon.path;
  const idx  = Math.floor(apPhase * (path.length - 2));
  if (idx <= 0 || idx >= path.length - 1) return;

  const p1 = path[idx];
  const p2 = path[idx + 1];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  // inward membrane normal
  const nx = -dy / len;
  const ny =  dx / len;

  // -----------------------------------------------
  // Bilateral spawning (LEFT + RIGHT)
  // -----------------------------------------------
  [-1, +1].forEach(side => {

    // density clamp PER SIDE
    const existing = ecsIons.AxonNaWave.filter(
      p => p.axonIdx === idx && p.side === side
    );
    if (existing.length >= AXON_NA_MAX_PER_SIDE) return;

    for (let i = 0; i < AXON_NA_WAVE_COUNT; i++) {

      ecsIons.AxonNaWave.push({
        x: p1.x + nx * AXON_NA_WAVE_RADIUS * side,
        y: p1.y + ny * AXON_NA_WAVE_RADIUS * side,

        vx: -nx * AXON_NA_WAVE_SPEED * side,
        vy: -ny * AXON_NA_WAVE_SPEED * side,

        axonIdx: idx,
        side,
        life: AXON_NA_WAVE_LIFETIME
      });
    }
  });
}

// =====================================================
// AXON K⁺ EFFLUX — VISIBLE AP
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

  // Na⁺ wave
  fill(getColor("sodium", 140));

  ecsIons.AxonNaWave = ecsIons.AxonNaWave.filter(p => {

    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NA_APPROACH_DECAY;
    p.vy *= NA_APPROACH_DECAY;

    const center = neuron.axon.path[p.axonIdx];
    if (dist(p.x, p.y, center.x, center.y) < AXON_NA_MIDLINE_RADIUS) return false;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // K⁺ efflux
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
}

// =====================================================
// EXPORTS
// =====================================================
window.triggerAxonNaWave   = triggerAxonNaWave;
window.triggerAxonKEfflux = triggerAxonKEfflux;
window.drawAxonIons       = drawAxonIons;
window.initAxonIons       = initAxonIons;
