
// =====================================================
// AXON IONS — HALOS, Na⁺ WAVE, K⁺ EFFLUX
// =====================================================
console.log("🧬 axonIons loaded");

window.ecsIons = window.ecsIons || {};
ecsIons.AxonNaStatic = [];
ecsIons.AxonKStatic  = [];
ecsIons.AxonNaWave   = [];
ecsIons.AxonKFlux    = [];

const AXON_HALO_RADIUS    = 28;
const AXON_HALO_THICKNESS = 4;

const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;
const HALO_NA_RELAX   = 0.95;
const HALO_K_RELAX    = 0.80;

const AXON_NA_WAVE_SPEED    = 1.6;
const AXON_NA_WAVE_RADIUS   = 28;
const AXON_NA_WAVE_LIFETIME = 28;
const AXON_NA_WAVE_COUNT    = 2;
const NA_APPROACH_DECAY     = 0.99;

const AXON_K_FLUX_SPEED     = 1.6;
const AXON_K_FLUX_LIFETIME  = 40;
const AXON_K_SPAWN_COUNT    = 3;

const AXON_NA_LEAD_SEGMENTS = 40;
const AXON_K_PHASE_STEP     = 0.045;

let lastAxonKPhase = -Infinity;

function triggerAxonNaWave() {
  if (!neuron?.axon?.path || window.preAxonAPPhase == null) return;

  const path = neuron.axon.path;
  const idx  = floor(window.preAxonAPPhase * (path.length - 2));
  if (idx <= 0 || idx >= path.length - 1) return;

  const p1 = path[idx];
  const p2 = path[idx + 1];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  const nx = -dy / len;
  const ny =  dx / len;

  for (let i = 0; i < AXON_NA_WAVE_COUNT; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    ecsIons.AxonNaWave.push({
      x: p1.x + nx * AXON_NA_WAVE_RADIUS * side,
      y: p1.y + ny * AXON_NA_WAVE_RADIUS * side,
      vx: -nx * AXON_NA_WAVE_SPEED * side,
      vy: -ny * AXON_NA_WAVE_SPEED * side,
      axonIdx: idx,
      life: AXON_NA_WAVE_LIFETIME
    });
  }
}

function triggerAxonKEfflux(apPhase) {
  if (!neuron?.axon?.path || apPhase == null) return;

  const path = neuron.axon.path;
  const idx  = floor(apPhase * (path.length - 2));
  const p1   = path[idx];
  const p2   = path[idx + 1];

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

function drawAxonIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  fill(getColor("sodium", 140));
  ecsIons.AxonNaWave = ecsIons.AxonNaWave.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NA_APPROACH_DECAY;
    p.vy *= NA_APPROACH_DECAY;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

window.triggerAxonNaWave = triggerAxonNaWave;
window.triggerAxonKEfflux = triggerAxonKEfflux;
window.drawAxonIons = drawAxonIons;
