// =====================================================
// BLOOD CONTENTS — SYMBOLIC, FLOWING (RANDOMIZED MIX)
// =====================================================
// ✔ Continuous axial flow
// ✔ Randomized longitudinal + radial distribution
// ✔ Slight per-particle speed variation
// ✔ Fixed lumen
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.2 (randomized flow) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// PARTICLE COUNTS (SPARSE)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   20,
  rbcDeoxy: 12,
  water:    20,
  glucose:  12
};


// -----------------------------------------------------
// LANE CONSTRAINTS
// -----------------------------------------------------

const LANE_MIN = -0.55;
const LANE_MAX =  0.55;

// -----------------------------------------------------
// FLOW PARAMETERS
// -----------------------------------------------------

const BASE_FLOW_SPEED = 0.00018; // t-units / ms
const FLOW_JITTER     = 0.25;    // ±25%

// -----------------------------------------------------
// INITIALIZE — RANDOMIZED DISTRIBUTION
// -----------------------------------------------------

function initBloodContents() {
  bloodParticles.length = 0;

  if (
    typeof getArteryPoint !== "function" ||
    !Array.isArray(arteryPath) ||
    arteryPath.length === 0 ||
    typeof COLORS !== "object"
  ) {
    requestAnimationFrame(initBloodContents);
    return;
  }

  function spawn(type, count, size, shape, colorName) {
    const c = COLORS[colorName];

    for (let i = 0; i < count; i++) {
      bloodParticles.push({
        type,
        shape,
        size,
        color: c,

        // 🔀 randomized initial position
        t: random(),
        lane: random(LANE_MIN, LANE_MAX),

        // 🔀 slight per-particle speed variation
        speed: BASE_FLOW_SPEED * random(1 - FLOW_JITTER, 1 + FLOW_JITTER)
      });
    }
  }

  // -----------------------------
  // SYMBOLIC PARTICLES (MIXED)
  // -----------------------------

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — CONTINUOUS FLOW
// -----------------------------------------------------

function updateBloodContents() {
  const dt = state.dt;

  for (const p of bloodParticles) {
    p.t += p.speed * dt;
    if (p.t > 1) p.t -= 1;
  }
}

// -----------------------------------------------------
// DRAW — PATH-ALIGNED, STATE-SAFE
// -----------------------------------------------------

function drawBloodContents() {
  push();

  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    // -------------------------
    // Color
    // -------------------------
    if (p.type === "glucose") {
      const g = COLORS.glucose;
      fill(g[0], g[1], g[2], 180);
    } else {
      fill(p.color[0], p.color[1], p.color[2]);
    }

    // -------------------------
    // Shape
    // -------------------------
    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rect(pos.x, pos.y, p.size * 0.7, p.size * 0.7);
    }

    // -------------------------
    // Bound oxygen (oxy RBCs)
    // -------------------------
    if (p.type === "rbcOxy") {
      const o2 = COLORS.oxygen;
      fill(o2[0], o2[1], o2[2]);
      circle(pos.x + 3, pos.y - 3, 3);
    }
  }

  pop();
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
