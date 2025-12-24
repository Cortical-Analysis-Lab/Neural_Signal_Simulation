// =====================================================
// BLOOD CONTENTS — SYMBOLIC, FLOWING (PATH-ALIGNED)
// =====================================================
// ✔ Continuous axial flow
// ✔ Fixed lumen (no vasomotion)
// ✔ Sparse, symbolic particles
// ✔ Discrete shapes only
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.1 (continuous flow) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// PARTICLE COUNTS (SPARSE, TEACHING-FIRST)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   10,
  rbcDeoxy: 6,
  water:    10,
  glucose:  6
};

// -----------------------------------------------------
// LANE CONSTRAINTS (FIXED LUMEN SPACE)
// -----------------------------------------------------

const LANE_MIN = -0.55;
const LANE_MAX =  0.55;

// -----------------------------------------------------
// FLOW PARAMETERS (AUTHORITATIVE)
// -----------------------------------------------------

const FLOW_SPEED = 0.00018;   // axial speed per ms (t-units / ms)

// -----------------------------------------------------
// INITIALIZE — AFTER arteryPath EXISTS
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

  let seed = 0;

  const TOTAL =
    BLOOD_COUNTS.rbcOxy +
    BLOOD_COUNTS.rbcDeoxy +
    BLOOD_COUNTS.water +
    BLOOD_COUNTS.glucose;

  function place(type, count, size, shape, colorName) {
    const c = COLORS[colorName];

    for (let i = 0; i < count; i++) {
      const t = (seed + i + 1) / (TOTAL + 2);
      const lane = lerp(LANE_MIN, LANE_MAX, (i % 3) / 2);

      bloodParticles.push({
        t,
        lane,
        size,
        shape,
        type,
        color: c
      });
    }
    seed += count;
  }

  // -----------------------------
  // SYMBOLIC PARTICLES
  // -----------------------------

  place("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  place("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  place("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  place("glucose",  BLOOD_COUNTS.glucose,   5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — CONTINUOUS AXIAL FLOW
// -----------------------------------------------------

function updateBloodContents() {
  const dt = state.dt; // ms per frame

  for (const p of bloodParticles) {
    p.t += FLOW_SPEED * dt;

    // wrap cleanly (no popping)
    if (p.t > 1) p.t -= 1;
  }
}

// -----------------------------------------------------
// DRAW — PATH-ALIGNED, STATE-SAFE
// -----------------------------------------------------

function drawBloodContents() {
  push(); // isolate p5 state

  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    // -------------------------
    // Fill color
    // -------------------------
    if (p.type === "glucose") {
      const g = COLORS.glucose;
      fill(g[0], g[1], g[2], 180);
    } else {
      fill(p.color[0], p.color[1], p.color[2]);
    }

    // -------------------------
    // Draw shape
    // -------------------------
    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rect(pos.x, pos.y, p.size * 0.7, p.size * 0.7);
    }

    // -------------------------
    // Bound oxygen (oxy RBCs only)
    // -------------------------
    if (p.type === "rbcOxy") {
      const o2 = COLORS.oxygen;
      fill(o2[0], o2[1], o2[2]);
      circle(pos.x + 3, pos.y - 3, 3);
    }
  }

  pop(); // restore p5 state
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
