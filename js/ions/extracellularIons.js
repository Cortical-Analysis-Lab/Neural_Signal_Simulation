// =====================================================
// EXTRACELLULAR IONS — Na+ / K+ (ECS ONLY)
// Teaching-first, geometry-aware distribution
// =====================================================
console.log("🧂 extracellularIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {
  Na: [],
  K: []
};

// -----------------------------------------------------
// TUNABLE COUNTS (BIOLOGICAL BIAS)
// -----------------------------------------------------
const ECS_ION_COUNTS = {
  Na: 320,   // higher extracellular abundance
  K: 180    // lower, more localized
};

// -----------------------------------------------------
// VISUAL PARAMETERS
// -----------------------------------------------------
const ION_RADIUS = {
  Na: 2.2,
  K: 2.8
};

const ION_ALPHA = {
  Na: 140,
  K: 160
};

// -----------------------------------------------------
// WORLD BOUNDS (WORLD SPACE, NOT SCREEN)
// -----------------------------------------------------
function getECSBounds() {
  return {
    xmin: -width * 0.65,
    xmax:  width * 0.65,
    ymin: -height * 0.65,
    ymax:  height * 0.65
  };
}

// =====================================================
// EXCLUSION TESTS (CRITICAL)
// =====================================================

// ---- Neuron somas ----
function pointNearSomas(x, y) {
  const somas = [
    { x: 0, y: 0, r: neuron.somaRadius + 28 },
    { x: neuron2?.soma?.x ?? 0,
      y: neuron2?.soma?.y ?? 0,
      r: (neuron2?.somaRadius ?? 0) + 26 },
    { x: neuron3?.soma?.x ?? 0,
      y: neuron3?.soma?.y ?? 0,
      r: (neuron3?.somaRadius ?? 0) + 24 }
  ];

  return somas.some(s =>
    dist(x, y, s.x, s.y) < s.r
  );
}

// ---- Dendrites (all neurons) ----
function pointNearDendrites(x, y) {
  const allBranches = [
    ...(neuron?.dendrites || []),
    ...(neuron2?.dendrites || []),
    ...(neuron3?.dendrites || [])
  ];

  for (let branch of allBranches) {
    for (let p of branch) {
      if (dist(x, y, p.x, p.y) < p.r + 10) return true;
    }
  }
  return false;
}

// ---- Axons ----
function pointNearAxons(x, y) {
  if (neuron?.axon?.path) {
    for (let p of neuron.axon.path) {
      if (dist(x, y, p.x, p.y) < 14) return true;
    }
  }
  return false;
}

// ---- Artery + NVU ----
function pointNearArtery(x, y) {
  if (!window.arteryPath?.length) return false;

  for (let p of arteryPath) {
    if (dist(x, y, p.x, p.y) < BASE_WALL_OFFSET + 55) {
      return true;
    }
  }
  return false;
}

// ---- Voltage trace exclusion (top-right UI region) ----
function pointNearVoltageTrace(x, y) {
  return (
    x > width * 0.18 &&
    y < -height * 0.25
  );
}

// ---- Master ECS validity test ----
function validECSPosition(x, y) {
  return !(
    pointNearSomas(x, y) ||
    pointNearDendrites(x, y) ||
    pointNearAxons(x, y) ||
    pointNearArtery(x, y) ||
    pointNearVoltageTrace(x, y)
  );
}

// =====================================================
// INITIALIZATION
// =====================================================
function initExtracellularIons() {

  ecsIons.Na.length = 0;
  ecsIons.K.length  = 0;

  const bounds = getECSBounds();

  function spawnIon(type) {
    let attempts = 0;

    while (attempts++ < 500) {
      const x = random(bounds.xmin, bounds.xmax);
      const y = random(bounds.ymin, bounds.ymax);

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

  console.log(
    `🧂 ECS ions initialized (Na+: ${ecsIons.Na.length}, K+: ${ecsIons.K.length})`
  );
}

// =====================================================
// DRAWING
// =====================================================
function drawExtracellularIons() {
  push();
  noStroke();

  // -------------------------
  // Na+ — diffuse, widespread
  // -------------------------
  fill(120, 170, 255, ION_ALPHA.Na);
  ecsIons.Na.forEach(p => {
    const wob =
      sin(state.time * 0.002 + p.phase) * 0.6;
    circle(
      p.x + wob,
      p.y - wob,
      ION_RADIUS.Na
    );
  });

  // -------------------------
  // K+ — slightly clustered
  // -------------------------
  fill(255, 180, 90, ION_ALPHA.K);
  ecsIons.K.forEach(p => {
    const wob =
      cos(state.time * 0.002 + p.phase) * 0.4;
    circle(
      p.x - wob,
      p.y + wob,
      ION_RADIUS.K
    );
  });

  pop();
}

// =====================================================
// OPTIONAL: DEBUG OVERLAY (OFF BY DEFAULT)
// =====================================================
function drawECSBoundsDebug() {
  const b = getECSBounds();
  push();
  noFill();
  stroke(255, 50);
  rect(b.xmin, b.ymin, b.xmax - b.xmin, b.ymax - b.ymin);
  pop();
}
