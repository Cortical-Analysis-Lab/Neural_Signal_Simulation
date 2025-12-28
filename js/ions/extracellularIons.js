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
  AxonNaFlux: [], AxonKFlux: []
};

// -----------------------------------------------------
// COUNTS
// -----------------------------------------------------
const ECS_ION_COUNTS = { Na: 260, K: 160 };

// -----------------------------------------------------
// VISUALS
// -----------------------------------------------------
const ION_TEXT_SIZE = { Na: 10, K: 11 };
const ION_ALPHA    = { Na: 170, K: 185 };

const ION_COLOR = {
  Na: [245, 215, 90],
  K:  [255, 140, 190]
};

// -----------------------------------------------------
// SOMA PARAMETERS (LOCKED)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// -----------------------------------------------------
// AXON PARAMETERS (RESTORED PERFECT)
// -----------------------------------------------------
const AXON_NA_SPEED     = 1.8;
const AXON_NA_LIFETIME  = 26;

const AXON_K_SPEED      = 2.0;
const AXON_K_LIFETIME   = 120;
const AXON_K_DECAY      = 0.97;

// =====================================================
// 🔒 ECS EXCLUSION RULES (ECS ONLY)
// =====================================================
function inArteryThird(x) {
  return x < -width * 0.33;
}

function inVoltageTrace(x, y) {
  return abs(x) < 240 && abs(y - height * 0.28) < 130;
}

function validECS(x, y) {
  return !(inArteryThird(x) || inVoltageTrace(x, y));
}

// =====================================================
// INITIALIZATION — BASELINE ECS ONLY
// =====================================================
function initExtracellularIons() {

  Object.values(ecsIons).forEach(arr => arr.length = 0);

  const b = {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };

  function spawnIon(type) {
    let tries = 0;
    while (tries++ < 1400) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);
      if (!validECS(x, y)) continue;

      ecsIons[type].push({
        x, y, phase: random(TWO_PI)
      });
      return;
    }
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnIon("K");

  console.log("🧂 ECS baseline ions initialized");
}

// =====================================================
// SOMA FLUX (UNCHANGED)
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
// AXON FLUX — MEMBRANE-BOUND (NO ECS EXCLUSION)
// =====================================================
function triggerAxonNaInflux(x, y, nx, ny) {

  ecsIons.AxonNaFlux.push({
    x,
    y,
    vx: -nx * AXON_NA_SPEED,
    vy: -ny * AXON_NA_SPEED,
    life: AXON_NA_LIFETIME
  });
}

function triggerAxonKEfflux(x, y, nx, ny) {

  ecsIons.AxonKFlux.push({
    x,
    y,
    vx: nx * AXON_K_SPEED,
    vy: ny * AXON_K_SPEED,
    life: AXON_K_LIFETIME
  });
}

window.triggerAxonNaInflux = triggerAxonNaInflux;
window.triggerAxonKEfflux = triggerAxonKEfflux;

// =====================================================
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ---- BASELINE ECS ----
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p =>
    text("Na⁺",
      p.x + sin(state.time * 0.0018 + p.phase) * 0.4,
      p.y - sin(state.time * 0.0018 + p.phase) * 0.4)
  );

  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p =>
    text("K⁺",
      p.x - cos(state.time * 0.0016 + p.phase) * 0.35,
      p.y + cos(state.time * 0.0016 + p.phase) * 0.35)
  );

  // ---- SOMA Na⁺ ----
  fill(...ION_COLOR.Na, ION_ALPHA.Na);
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;
    const d = max(1, sqrt(p.x*p.x + p.y*p.y));
    p.x += (-p.x / d) * NA_FLUX_SPEED;
    p.y += (-p.y / d) * NA_FLUX_SPEED;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ---- SOMA K⁺ ----
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    p.vx *= ION_VEL_DECAY; p.vy *= ION_VEL_DECAY;
    fill(...ION_COLOR.K, map(p.life, 0, K_FLUX_LIFETIME, 0, ION_ALPHA.K));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  // ---- AXON Na⁺ ----
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaFlux = ecsIons.AxonNaFlux.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // ---- AXON K⁺ (PERFECT RESTORED) ----
  ecsIons.AxonKFlux = ecsIons.AxonKFlux.filter(p => {
    p.life--;
    p.x += p.vx; p.y += p.vy;
    p.vx *= AXON_K_DECAY;
    p.vy *= AXON_K_DECAY;
    fill(...ION_COLOR.K, map(p.life, 0, AXON_K_LIFETIME, 0, ION_ALPHA.K));
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}
