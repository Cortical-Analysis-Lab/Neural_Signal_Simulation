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
// HALO DYNAMICS (SUBTLE, CONTEXTUAL)
// -----------------------------------------------------
const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;
const HALO_NA_RELAX   = 0.95;
const HALO_K_RELAX    = 0.80;

// -----------------------------------------------------
// Na⁺ WAVE (INVISIBLE AP DRIVEN)
// -----------------------------------------------------
const AXON_NA_WAVE_SPEED    = 1.6;
const AXON_NA_WAVE_RADIUS   = 28;
const AXON_NA_WAVE_LIFETIME = 28;
const AXON_NA_WAVE_COUNT    = 2;
const NA_APPROACH_DECAY     = 0.99;

// -----------------------------------------------------
// K⁺ EFFLUX (VISIBLE AP DRIVEN)
// -----------------------------------------------------
const AXON_K_FLUX_SPEED     = 1.6;
const AXON_K_FLUX_LIFETIME  = 40;
const AXON_K_SPAWN_COUNT    = 3;
const AXON_K_PHASE_STEP     = 0.045;

let lastAxonKPhase = -Infinity;

// =====================================================
// AXON Na⁺ WAVE — DRIVEN BY *PASSED-IN* AP PHASE
// =====================================================
function triggerAxonNaWave(apPhase) {

  if (!neuron?.axon?.path) return;
  if (apPhase == null) return;

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

// =====================================================
// AXON K⁺ EFFLUX — DRIVEN BY VISIBLE AP
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

  // outward membrane normal
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
  // Na⁺ WAVE (leading)
  // ------------------------------
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

  // ------------------------------
  // K⁺ EFFLUX (trailing)
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

  // ------------------------------
  // STATIC HALOS (context only)
  // ------------------------------
  fill(getColor("sodium", 110));

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

  fill(getColor("potassium", 120));

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

  pop();
}

// =====================================================
// INITIALIZATION (HALOS ONLY)
// =====================================================
function initAxonIons() {

  ecsIons.AxonNaStatic.length = 0;
  ecsIons.AxonKStatic.length  = 0;

  if (!neuron?.axon?.path) return;

  const path = neuron.axon.path;

  function spawnHalo(target, count) {

    for (let i = 0; i < count; i++) {

      const t   = i / count;
      const idx = Math.floor(t * (path.length - 2));

      const p1 = path[idx];
      const p2 = path[idx + 1];

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

      target.push({
        x: x0, y: y0,
        x0, y0,
        vx: 0, vy: 0
      });
    }
  }

  spawnHalo(ecsIons.AxonNaStatic, 8);
  spawnHalo(ecsIons.AxonKStatic,  4);
}

// =====================================================
// EXPORTS
// =====================================================
window.triggerAxonNaWave   = triggerAxonNaWave;
window.triggerAxonKEfflux = triggerAxonKEfflux;
window.drawAxonIons       = drawAxonIons;
window.initAxonIons       = initAxonIons;
