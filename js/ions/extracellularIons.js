// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS + AXON)
// Teaching-first, artery-excluded ECS (slow, readable)
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {
  Na: [],
  K: [],
  NaFlux: [],
  KFlux: [],
  AxonNaFlux: [],
  AxonKFlux: [],
  AxonNaPool: []   // 👈 fixed Na⁺ near axon
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = {
  Na: 260,
  K: 160
};

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };
const ION_ALPHA    = { Na: 170, K: 185 };

const ION_COLOR = {
  Na: [245, 215, 90],    // yellow
  K:  [255, 140, 190]   // pink
};

// -----------------------------------------------------
// MOTION PARAMETERS
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;    // 🔒 soma Na⁺ (locked)
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

// 🔒 K⁺ (unchanged)
const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// 🔑 AXON Na⁺ (MATCH K⁺ SPEED)
const AXON_NA_SPEED     = 2.2;
const AXON_NA_LIFETIME  = 70;

// =====================================================
// INITIALIZATION — BASELINE ECS + AXON Na⁺ POOL
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;
  ecsIons.NaFlux.length = 0;
  ecsIons.KFlux.length  = 0;
  ecsIons.AxonNaFlux.length = 0;
  ecsIons.AxonKFlux.length  = 0;
  ecsIons.AxonNaPool.length = 0;

  const b = {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };

  function validECSPosition(x, y) {
    return !(x < -width * 0.33 || abs(x) < 240 && abs(y - height * 0.28) < 130);
  }

  function spawnIon(type) {
    let tries = 0;
    while (tries++ < 1200) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);
      if (!validECSPosition(x, y)) continue;
      ecsIons[type].push({ x, y, phase: random(TWO_PI) });
      return;
    }
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnIon("K");

  // ---------------------------------------------------
  // FIXED Na⁺ POOL NEAR AXON (STATIC ECS)
  // ---------------------------------------------------
  if (neuron?.axon?.path) {
    neuron.axon.path.forEach(p => {
      if (random() < 0.25) {
        ecsIons.AxonNaPool.push({
          x: p.x + random(-14, 14),
          y: p.y + random(-14, 14),
          phase: random(TWO_PI)
        });
      }
    });
  }

  console.log("🧂 ECS baseline + axon Na⁺ pool initialized");
}

// =====================================================
// SOMA ION FLUX (UNCHANGED)
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
// AXON Na⁺ FLUX (DIRECTIONAL — KEY FIX)
// =====================================================
function triggerAxonNaInflux(x, y, dx, dy) {

  const d = max(1, sqrt(dx*dx + dy*dy));

  ecsIons.AxonNaFlux.push({
    x,
    y,
    vx: (dx / d) * AXON_NA_SPEED,
    vy: (dy / d) * AXON_NA_SPEED,
    life: AXON_NA_LIFETIME
  });
}

window.triggerAxonNaInflux = triggerAxonNaInflux;

// =====================================================
// DRAWING — ECS + SOMA + AXON
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -------------------------
  // BASELINE Na⁺
  // -------------------------
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => {
    const wob = sin(state.time * 0.0018 + p.phase) * 0.4;
    text("Na⁺", p.x + wob, p.y - wob);
  });

  // -------------------------
  // BASELINE K⁺
  // -------------------------
  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => {
    const wob = cos(state.time * 0.0016 + p.phase) * 0.35;
    text("K⁺", p.x - wob, p.y + wob);
  });

  // -------------------------
  // AXON Na⁺ POOL (STATIC)
  // -------------------------
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaPool.forEach(p => {
    const wob = sin(state.time * 0.002 + p.phase) * 0.25;
    text("Na⁺", p.x + wob, p.y - wob);
  });

  // -------------------------
  // SOMA Na⁺ FLUX
  // -------------------------
  fill(...ION_COLOR.Na, ION_ALPHA.Na);
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const dx = -p.x;
    const dy = -p.y;
    const d  = max(1, sqrt(dx*dx + dy*dy));
    p.x += (dx / d) * NA_FLUX_SPEED;
    p.y += (dy / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -------------------------
  // SOMA K⁺ FLUX (UNCHANGED)
  // -------------------------
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    const a = map(p.life, 0, K_FLUX_LIFETIME, 0, ION_ALPHA.K);
    fill(...ION_COLOR.K, a);
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  // -------------------------
  // AXON Na⁺ FLUX (FAST, DIRECTIONAL)
  // -------------------------
  fill(...ION_COLOR.Na, 170);
  ecsIons.AxonNaFlux = ecsIons.AxonNaFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}
