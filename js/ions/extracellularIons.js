// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS ONLY)
// Teaching-first, event-based ion flux
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {
  Na: [],
  K: [],
  NaFlux: [],
  KFlux: []
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
  Na: [245, 215, 90],    // yellow
  K:  [255, 140, 190]   // pink
};

// -----------------------------------------------------
// FLUX PARAMETERS (FAST + OBVIOUS)
// -----------------------------------------------------
const NA_SUCTION_SPEED   = 3.8;
const K_EXPULSION_SPEED  = 4.2;

const NA_FLUX_LIFETIME   = 18;   // frames
const K_FLUX_LIFETIME   = 40;

const K_EXPULSION_RADIUS = 20;

// =====================================================
// ECS BOUNDS — ARTERY THIRD REMOVED
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
// EXCLUSION TESTS
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
// INITIALIZATION — STATIC ECS ONLY
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;
  ecsIons.NaFlux.length = 0;
  ecsIons.KFlux.length  = 0;

  const b = getECSBounds();

  function spawnIon(type) {
    let tries = 0;
    while (tries++ < 1200) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);
      if (!validECSPosition(x, y)) continue;

      ecsIons[type].push({
        x, y,
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
// NEURON-1 ION FLUX EVENTS
// =====================================================

// EPSP → Na⁺ influx (COPY ions, baseline remains)
function triggerNaInfluxNeuron1() {

  // spawn burst of Na⁺ copies around soma
  for (let i = 0; i < 14; i++) {
    ecsIons.NaFlux.push({
      x: random(-120, 120),
      y: random(-120, 120),
      life: NA_FLUX_LIFETIME
    });
  }
}

// IPSP → K⁺ efflux (blast outward, then fade)
function triggerKEffluxNeuron1() {

  for (let i = 0; i < 16; i++) {

    const angle = random(TWO_PI);

    ecsIons.KFlux.push({
      x: random(-K_EXPULSION_RADIUS, K_EXPULSION_RADIUS),
      y: random(-K_EXPULSION_RADIUS, K_EXPULSION_RADIUS),
      vx: cos(angle) * K_EXPULSION_SPEED,
      vy: sin(angle) * K_EXPULSION_SPEED,
      life: K_FLUX_LIFETIME
    });
  }
}

// =====================================================
// DRAWING — STATIC + FLUX
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -------------------------
  // STATIC Na⁺ (background)
  // -------------------------
  fill(...ION_COLOR.Na, 120);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => {
    const wob = sin(state.time * 0.002 + p.phase) * 0.4;
    text("Na⁺", p.x + wob, p.y - wob);
  });

  // -------------------------
  // STATIC K⁺ (background)
  // -------------------------
  fill(...ION_COLOR.K, 130);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => {
    const wob = cos(state.time * 0.002 + p.phase) * 0.3;
    text("K⁺", p.x - wob, p.y + wob);
  });

  // -------------------------
  // Na⁺ FLUX (FAST INWARD)
  // -------------------------
  fill(...ION_COLOR.Na, ION_ALPHA.Na);
  ecsIons.NaFlux = ecsIons.NaFlux.filter(p => {
    p.life--;

    const dx = -p.x;
    const dy = -p.y;
    const d  = max(1, sqrt(dx*dx + dy*dy));

    p.x += (dx / d) * NA_SUCTION_SPEED;
    p.y += (dy / d) * NA_SUCTION_SPEED;

    text("Na⁺", p.x, p.y);

    return p.life > 0;
  });

  // -------------------------
  // K⁺ FLUX (FAST OUTWARD + FADE)
  // -------------------------
  ecsIons.KFlux = ecsIons.KFlux.filter(p => {
    p.life--;

    p.x += p.vx;
    p.y += p.vy;

    const alpha = map(p.life, 0, K_FLUX_LIFETIME, 0, ION_ALPHA.K);
    fill(...ION_COLOR.K, alpha);

    text("K⁺", p.x, p.y);

    return p.life > 0;
  });

  pop();
}
