// =====================================================
// EXTRACELLULAR IONS — Na⁺ / K⁺ (ECS ONLY)
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
  Na: 260,   // higher extracellular abundance
  K: 160    // lower, more localized
};

// -----------------------------------------------------
// VISUAL PARAMETERS
// -----------------------------------------------------
const ION_TEXT_SIZE = {
  Na: 10,
  K: 11
};

const ION_ALPHA = {
  Na: 150,
  K: 170
};

// -----------------------------------------------------
// WORLD BOUNDS (FULL ECS DISPERSION)
// -----------------------------------------------------
function getECSBounds() {
  return {
    xmin: -width * 0.85,
    xmax:  width * 0.85,
    ymin: -height * 0.85,
    ymax:  height * 0.85
  };
}

// =====================================================
// EXCLUSION TESTS (CRITICAL)
// =====================================================

// ---- Neuron somas ----
function pointNearSomas(x, y) {
  const somas = [
    { x: 0, y: 0, r: neuron.somaRadius + 32 },
    { x: neuron2?.soma?.x ?? 0,
      y: neuron2?.soma?.y ?? 0,
      r: (neuron2?.somaRadius ?? 0) + 30 },
    { x: neuron3?.soma?.x ?? 0,
      y: neuron3?.soma?.y ?? 0,
      r: (neuron3?.somaRadius ?? 0) + 28 }
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
      if (dist(x, y, p.x, p.y) < p.r + 14) return true;
    }
  }
  return false;
}

// ---- Axons ----
function pointNearAxons(x, y) {
  if (neuron?.axon?.path) {
    for (let p of neuron.axon.path) {
      if (dist(x, y, p.x, p.y) < 18) return true;
    }
  }
  return false;
}

// ---- Artery + NVU (HARD EXCLUSION COLUMN) ----
function pointNearArtery(x, y) {
  // Artery is a vertical NVU column centered near the left side
  // Define a hard exclusion band in WORLD SPACE

  const arteryCenterX = arteryPath?.[0]?.x ?? -width * 0.35;

  // Horizontal half-width of entire NVU column
  const arteryHalfWidth = BASE_WALL_OFFSET + 150;

  // Vertical span (essentially full height)
  const arteryTop    = -height;
  const arteryBottom =  height;

  return (
    x > arteryCenterX - arteryHalfWidth &&
    x < arteryCenterX + arteryHalfWidth &&
    y > arteryTop &&
    y < arteryBottom
  );
}


// ---- Voltage trace (screen-anchored region) ----
function pointNearVoltageTrace(x, y) {
  // Voltage trace sits bottom-center in world space
  const traceCenterX = 0;
  const traceCenterY = height * 0.28;

  return (
    abs(x - traceCenterX) < 240 &&
    abs(y - traceCenterY) < 130
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

    while (attempts++ < 700) {
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
    `🧂 ECS ions initialized (Na⁺: ${ecsIons.Na.length}, K⁺: ${ecsIons.K.length})`
  );
}

// =====================================================
// DRAWING (TEXT-BASED IONS)
// =====================================================
function drawExtracellularIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -------------------------
  // Na⁺ — diffuse, widespread
  // -------------------------
  fill(120, 170, 255, ION_ALPHA.Na);
  textSize(ION_TEXT_SIZE.Na);

  ecsIons.Na.forEach(p => {
    const wob =
      sin(state.time * 0.002 + p.phase) * 0.6;

    text(
      "Na⁺",
      p.x + wob,
      p.y - wob
    );
  });

  // -------------------------
  // K⁺ — slightly clustered
  // -------------------------
  fill(255, 180, 90, ION_ALPHA.K);
  textSize(ION_TEXT_SIZE.K);

  ecsIons.K.forEach(p => {
    const wob =
      cos(state.time * 0.002 + p.phase) * 0.4;

    text(
      "K⁺",
      p.x - wob,
      p.y + wob
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
