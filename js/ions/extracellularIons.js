// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS ONLY)
// Teaching-first, artery-excluded ECS
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || { Na: [], K: [] };

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

// Na⁺ → yellow, K⁺ → pink
const ION_COLOR = {
  Na: [245, 215, 90],
  K:  [255, 140, 190]
};

// -----------------------------------------------------
// MOTION PARAMETERS
// -----------------------------------------------------
const SOMA_SUCTION_RADIUS   = 120;
const SOMA_ABSORB_RADIUS    = 0.85;   // × somaRadius
const K_SPAWN_RADIUS        = 26;

const NA_SUCTION_FORCE      = 0.9;

// 🔑 K⁺ efflux tuning (THIS IS THE CHANGE)
const K_EFFLUX_FORCE        = 1.35;   // stronger outward push
const K_VEL_DECAY           = 0.975;  // slower decay = farther travel
const K_MAX_DISTANCE        = 520;    // disappear after this distance
const K_LIFETIME            = 520;    // frames before fade-out

// =====================================================
// ECS BOUNDS
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
  return !(
    pointInArteryThird(x) ||
    pointNearVoltageTrace(x, y)
  );
}

// =====================================================
// INITIALIZATION
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;

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
        vx: 0,
        vy: 0,
        phase: random(TWO_PI),
        life: Infinity
      });
      return;
    }
  }

  for (let i = 0; i < ECS_ION_COUNTS.Na; i++) spawnIon("Na");
  for (let i = 0; i < ECS_ION_COUNTS.K;  i++) spawnIon("K");

  console.log(
    `🧂 ECS ions initialized → Na⁺:${ecsIons.Na.length}, K⁺:${ecsIons.K.length}`
  );
}

// =====================================================
// NEURON-1 EVENT HOOKS
// =====================================================

// EPSP → Na⁺ influx (unchanged)
function triggerNaInfluxNeuron1() {
  ecsIons.Na.forEach(p => {
    const d = dist(p.x, p.y, 0, 0);
    if (d < SOMA_SUCTION_RADIUS && d > 1) {
      p.vx += (-p.x / d) * NA_SUCTION_FORCE;
      p.vy += (-p.y / d) * NA_SUCTION_FORCE;
    }
  });
}

// IPSP → K⁺ efflux (UPDATED)
function triggerKEffluxNeuron1() {

  for (let i = 0; i < 18; i++) {

    // random radial direction
    const a = random(TWO_PI);
    const r = random(8, K_SPAWN_RADIUS);

    ecsIons.K.push({
      x: cos(a) * r,
      y: sin(a) * r,

      // 🔑 strong outward radial push
      vx: cos(a) * K_EFFLUX_FORCE,
      vy: sin(a) * K_EFFLUX_FORCE,

      phase: random(TWO_PI),
      life: K_LIFETIME
    });
  }
}

// =====================================================
// DRAWING — TEXT IONS
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -------------------------
  // Na⁺ (yellow, absorbed)
  // -------------------------
  fill(...ION_COLOR.Na, ION_ALPHA.Na);
  textSize(ION_TEXT_SIZE.Na);

  ecsIons.Na = ecsIons.Na.filter(p => {

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;

    const d = dist(p.x, p.y, 0, 0);
    if (d < neuron.somaRadius * SOMA_ABSORB_RADIUS) {
      return false; // absorbed
    }

    const wob = sin(state.time * 0.0018 + p.phase) * 0.4;
    text("Na⁺", p.x + wob, p.y - wob);
    return true;
  });

  // -------------------------
  // K⁺ (pink, strong efflux)
  // -------------------------
  textSize(ION_TEXT_SIZE.K);

  ecsIons.K = ecsIons.K.filter(p => {

    p.x += p.vx;
    p.y += p.vy;

    p.vx *= K_VEL_DECAY;
    p.vy *= K_VEL_DECAY;

    if (p.life !== Infinity) p.life--;

    const d = dist(p.x, p.y, 0, 0);

    // fade out as it disperses
    const alpha =
      p.life === Infinity
        ? ION_ALPHA.K
        : map(p.life, 0, K_LIFETIME, 0, ION_ALPHA.K);

    fill(...ION_COLOR.K, alpha);

    const wob = cos(state.time * 0.0016 + p.phase) * 0.35;
    text("K⁺", p.x - wob, p.y + wob);

    return (
      p.life > 0 &&
      d < K_MAX_DISTANCE
    );
  });

  pop();
}
