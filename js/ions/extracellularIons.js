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
const ION_ALPHA    = { Na: 150, K: 170 };

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
// EXCLUSION TESTS
// =====================================================

// ---- HARD ARTERY EXCLUSION (LEFT THIRD) ----
function pointInArteryThird(x) {
  return x < -width * 0.33;
}

// ---- Neuron somas ----
function pointNearSomas(x, y) {
  const somas = [
    { x: 0, y: 0, r: neuron.somaRadius + 34 },
    { x: neuron2?.soma?.x ?? 0,
      y: neuron2?.soma?.y ?? 0,
      r: (neuron2?.somaRadius ?? 0) + 32 },
    { x: neuron3?.soma?.x ?? 0,
      y: neuron3?.soma?.y ?? 0,
      r: (neuron3?.somaRadius ?? 0) + 30 }
  ];
  return somas.some(s => dist(x, y, s.x, s.y) < s.r);
}

// ---- Dendrites ----
function pointNearDendrites(x, y) {
  const branches = [
    ...(neuron?.dendrites || []),
    ...(neuron2?.dendrites || []),
    ...(neuron3?.dendrites || [])
  ];
  for (let b of branches) {
    for (let p of b) {
      if (dist(x, y, p.x, p.y) < p.r + 16) return true;
    }
  }
  return false;
}

// ---- Axons ----
function pointNearAxons(x, y) {
  if (!neuron?.axon?.path) return false;
  for (let p of neuron.axon.path) {
    if (dist(x, y, p.x, p.y) < 20) return true;
  }
  return false;
}

// ---- Voltage trace ----
function pointNearVoltageTrace(x, y) {
  return (
    abs(x) < 240 &&
    abs(y - height * 0.28) < 130
  );
}

// ---- MASTER ECS VALIDITY ----
function validECSPosition(x, y) {
  return !(
    pointInArteryThird(x) ||
    pointNearSomas(x, y) ||
    pointNearDendrites(x, y) ||
    pointNearAxons(x, y) ||
    pointNearVoltageTrace(x, y)
  );
}

// =====================================================
// INITIALIZATION — NEURON-BIASED SAMPLING
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;

  const b = getECSBounds();

  function nearestNeuronDistance(x, y) {
    const d1 = dist(x, y, 0, 0);
    const d2 = neuron2?.soma
      ? dist(x, y, neuron2.soma.x, neuron2.soma.y)
      : Infinity;
    const d3 = neuron3?.soma
      ? dist(x, y, neuron3.soma.x, neuron3.soma.y)
      : Infinity;
    return min(d1, d2, d3);
  }

  function spawnIon(type) {
    let tries = 0;

    while (tries++ < 1600) {
      const x = random(b.xmin, b.xmax);
      const y = random(b.ymin, b.ymax);

      if (!validECSPosition(x, y)) continue;

      // ------------------------------------
      // Strong perineuronal ECS bias
      // ------------------------------------
      const d = nearestNeuronDistance(x, y);

      const acceptProb = constrain(
        map(d, 60, 360, 1.0, 0.35),
        0.35, 1.0
      );

      if (random() > acceptProb) continue;

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

  console.log(
    `🧂 ECS ions initialized → Na⁺:${ecsIons.Na.length}, K⁺:${ecsIons.K.length}`
  );
}

// =====================================================
// DRAWING — TEXT IONS
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // ---- Na⁺ ----
  fill(120, 170, 255, ION_ALPHA.Na);
  textSize(ION_TEXT_SIZE.Na);
  ecsIons.Na.forEach(p => {
    const wob = sin(state.time * 0.002 + p.phase) * 0.6;
    text("Na⁺", p.x + wob, p.y - wob);
  });

  // ---- K⁺ ----
  fill(255, 180, 90, ION_ALPHA.K);
  textSize(ION_TEXT_SIZE.K);
  ecsIons.K.forEach(p => {
    const wob = cos(state.time * 0.002 + p.phase) * 0.4;
    text("K⁺", p.x - wob, p.y + wob);
  });

  pop();
}
