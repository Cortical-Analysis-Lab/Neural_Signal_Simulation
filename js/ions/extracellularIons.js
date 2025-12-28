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
  AxonKFlux: []
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
// (Na⁺ LOCKED — K⁺ RESTORED)
// -----------------------------------------------------
const NA_FLUX_SPEED     = 0.9;     // 🔒 DO NOT CHANGE
const NA_FLUX_LIFETIME  = 80;
const NA_SPAWN_RADIUS   = 140;

// 🔥 K⁺ far expulsion (approved)
const K_FLUX_SPEED      = 2.2;
const K_FLUX_LIFETIME   = 160;
const K_SPAWN_RADIUS    = 28;
const ION_VEL_DECAY     = 0.965;

// ---- Axon-specific lifetimes ----
const AXON_NA_LIFETIME  = 60;
const AXON_K_LIFETIME  = 140;

// =====================================================
// ECS WORLD BOUNDS — ARTERY THIRD REMOVED
// =====================================================
function getECSBounds() {
  return {
    xmin: -width * 0.9,
    xmax:  width * 0.9,
    ymin: -height * 0.9,
    ymax:  height * 0.9
  };
}

// =====================================================
// EXCLUSION TESTS (STATIC ECS ONLY)
// =====================================================
function pointInArteryThird(x) {
  return x < -width * 0.33;
}

function pointNearVoltageTrace(x, y) {
  return abs(x) < 240 && abs(y - height * 0.28) < 130;
}

function validECSPosition(x, y) {
  return !(pointInArteryThird(x) || pointNearVoltageTrace(x, y));
}

// =====================================================
// INITIALIZATION — BASELINE ECS
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;
  ecsIons.NaFlux.length = 0;
  ecsIons.KFlux.length  = 0;
  ecsIons.AxonNaFlux.length = 0;
  ecsIons.AxonKFlux.length  = 0;

  const b = getECSBounds();

  function spawnIon(type) {
    let tries = 0;
    while (tries++ < 1200) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);
      if (!validECSPosition(x, y)) continue;

      ecsIons[type].push({
        x,
        y,
        phase: random(TWO_PI)
      });
      return;
    }
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnIon("K");

  console.log("🧂 ECS baseline ions initialized");
}

// =====================================================
// SOMA ION FLUX (UNCHANGED — APPROVED VERSION)
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
// AXON ION FLUX (NEW — TRIGGERED BY axonSpike.js)
// =====================================================
function triggerAxonNaInflux(x, y) {
  ecsIons.AxonNaFlux.push({
    x,
    y,
    life: AXON_NA_LIFETIME
  });
}

function triggerAxonKEfflux(x, y) {
  const a = random(TWO_PI);
  ecsIons.AxonKFlux.push({
    x,
    y,
    vx: cos(a) * K_FLUX_SPEED,
    vy: sin(a) * K_FLUX_SPEED,
    life: AXON_K_LIFETIME
  });
}

// Make globally visible
window.triggerAxonNaInflux = triggerAxonNaInflux;
window.triggerAxonKEfflux = triggerAxonKEfflux;

// =====================================================
// DRAWING — BASELINE + SOMA + AXON
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
  // SOMA K⁺ FLUX
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
  // AXON Na⁺ FLUX (INWARD)
  // -------------------------
  fill(...ION_COLOR.Na, 150);
  ecsIons.AxonNaFlux = ecsIons.AxonNaFlux.filter(p => {
    p.life--;
    const d = max(1, sqrt(p.x*p.x + p.y*p.y));
    p.x -= (p.x / d) * 0.25;
    p.y -= (p.y / d) * 0.25;
    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -------------------------
  // AXON K⁺ FLUX (OUTWARD)
  // -------------------------
  ecsIons.AxonKFlux = ecsIons.AxonKFlux.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= ION_VEL_DECAY;
    p.vy *= ION_VEL_DECAY;
    const a = map(p.life, 0, AXON_K_LIFETIME, 0, ION_ALPHA.K);
    fill(...ION_COLOR.K, a);
    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}
