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
  AxonNaCopies: []
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

// Static halo emphasis
const HALO_NA_PERTURB = 0.04;
const HALO_K_PUSH     = 1.6;

// Relaxation
const HALO_NA_RELAX = 0.95;
const HALO_K_RELAX  = 0.80;

// -----------------------------------------------------
// BILATERAL Na⁺ COPY CONTROL
// -----------------------------------------------------
const NA_COPY_SPEED = 0.02;
const NA_CENTER_EPS = 1.2;
const NA_COPY_LIFE = Infinity;


// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };

const ION_COLOR = {
  Na: [245, 215, 90],
  K:  [255, 140, 190]
};

// -----------------------------------------------------
// SOMA PARAMETERS (AUTHORITATIVE)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// =====================================================
// GEOMETRY — closest point on axon centerline
// =====================================================
function closestPointOnAxon(x, y) {
  if (!neuron?.axon?.path) return null;

  let best = null;
  let bestD = Infinity;

  for (let i = 0; i < neuron.axon.path.length; i++) {
    const p = neuron.axon.path[i];
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 < bestD) {
      bestD = d2;
      best = p;
    }
  }
  return best;
}

// =====================================================
// INITIALIZATION
// =====================================================
function initExtracellularIons() {

  Object.values(ecsIons).forEach(arr => arr.length = 0);

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
      y: random(b.ymin, b.ymax),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnECSIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnECSIon("K");

  // ------------------
  // AXON STATIC HALO
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
        vx: 0, vy: 0,
        lastAPPhase: -Infinity,
        hasCopy: false
      });
    }
  }

  spawnHalo("AxonNaStatic", AXON_STATIC_NA_COUNT);
  spawnHalo("AxonKStatic",  AXON_STATIC_K_COUNT);
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

// =====================================================
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ------------------
  // ECS BASELINE
  // ------------------
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => text("Na⁺", p.x, p.y));

  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => text("K⁺", p.x, p.y));

  const apPhase = window.currentAxonAPPhase;

  // ------------------
  // AXON Na⁺ HALO + COPY
  // ------------------
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaStatic.forEach(p => {

    if (
      apPhase != null &&
      abs(apPhase - p.lastAPPhase) > 0.06 &&
      !p.hasCopy
    ) {
      ecsIons.AxonNaCopies.push({
        x: p.x,
        y: p.y,
        life: NA_COPY_LIFE,
        source: p,          // ← link back to halo ion
      });

      p.hasCopy = true;
      p.lastAPPhase = apPhase;
    }

    if (apPhase != null) {
      p.vx += (p.x - p.x0) * HALO_NA_PERTURB;
      p.vy += (p.y - p.y0) * HALO_NA_PERTURB;
    }

    p.vx += (p.x0 - p.x) * 0.06;
    p.vy += (p.y0 - p.y) * 0.06;
    p.vx *= HALO_NA_RELAX;
    p.vy *= HALO_NA_RELAX;
    p.x += p.vx;
    p.y += p.vy;

    text("Na⁺", p.x, p.y);
  });

    ecsIons.AxonNaCopies = ecsIons.AxonNaCopies.filter(p => {
    if (!p.stopped) {
      const target = closestPointOnAxon(p.x, p.y);
      if (target) {
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const d  = Math.hypot(dx, dy);
  
        if (d < NA_CENTER_EPS) {
          p.stopped = true;
  
          if (p.source) {
            p.source.hasCopy = false;
            p.source.lastAPPhase = -Infinity;
          }
        } else {
          p.x += dx * NA_COPY_SPEED;
          p.y += dy * NA_COPY_SPEED;
        }
      }
    }
  
    text("Na⁺", p.x, p.y);
    return !p.stopped;
  });


  // ------------------
  // AXON K⁺ HALO
  // ------------------
  fill(...ION_COLOR.K, 150);
  ecsIons.AxonKStatic.forEach(p => {

    if (apPhase != null) {
      p.vx += (p.x - p.x0) * HALO_K_PUSH * 0.01;
      p.vy += (p.y - p.y0) * HALO_K_PUSH * 0.01;
    }

    p.vx += (p.x0 - p.x) * 0.008;
    p.vy += (p.y0 - p.y) * 0.008;
    p.vx *= HALO_K_RELAX;
    p.vy *= HALO_K_RELAX;
    p.x += p.vx;
    p.y += p.vy;

    text("K⁺", p.x, p.y);
  });

  // ------------------
  // 🧠 SOMA Na⁺ INFLUX (RESTORED)
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
  // 🧠 SOMA K⁺ EFFLUX (RESTORED)
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
