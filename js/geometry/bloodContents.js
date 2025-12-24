// =====================================================
// BLOOD CONTENTS — SYMBOLIC, STATIC (PATH-ALIGNED)
// =====================================================
// ✔ Uses arteryPath + getArteryPoint
// ✔ Static (no motion, no coupling)
// ✔ Sparse, symbolic particles
// ✔ Discrete shapes only
// ✔ No lumen fill
// ✔ COLORS.js native
// ✔ p5 state isolated (no bleed)
// =====================================================

console.log("🩸 bloodContents v1.0 (locked static symbolic) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// PARTICLE COUNTS (INTENTIONALLY LOW)
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

  // Oxygenated RBCs (red + white O2 dot)
  place("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");

  // Deoxygenated RBCs (dark blue)
  place("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");

  // Water (light blue dots)
  place("water",    BLOOD_COUNTS.water,     6, "circle", "water");

  // Glucose (small green squares — must remain discrete)
  place("glucose",  BLOOD_COUNTS.glucose,   5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — STATIC (INTENTIONAL)
// -----------------------------------------------------

function updateBloodContents() {
  return;
}

// -----------------------------------------------------
// DRAW — PATH-ALIGNED, STATE-SAFE
// -----------------------------------------------------

function drawBloodContents() {
  push(); // 🔒 isolate p5 drawing state

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
      fill(g[0], g[1], g[2], 180); // translucent to prevent banding
    } else {
      fill(p.color[0], p.color[1], p.color[2]);
    }

    // -------------------------
    // Draw shape
    // -------------------------
    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      // glucose squares — deliberately smaller
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

  pop(); // 🔒 restore p5 state
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
