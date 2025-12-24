// =====================================================
// BLOOD CONTENTS — SYMBOLIC, STATIC (PATH-ALIGNED)
// =====================================================
// ✔ Uses arteryPath + getArteryPoint
// ✔ Static
// ✔ Sparse (but visible)
// ✔ Discrete symbols only
// ✔ No lumen fill
// ✔ Uses COLORS.js directly (no helpers)
// =====================================================

console.log("🩸 bloodContents v0.6 (COLORS-native) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// COUNTS — TEMPORARILY BOOSTED FOR VISIBILITY
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   10,
  rbcDeoxy: 6,
  water:    10,
  glucose:  6
};

// -----------------------------------------------------
// LANE CONSTRAINTS (INSIDE FIXED LUMEN)
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

  const BLOOD_COUNTS_TOTAL =
    BLOOD_COUNTS.rbcOxy +
    BLOOD_COUNTS.rbcDeoxy +
    BLOOD_COUNTS.water +
    BLOOD_COUNTS.glucose;

  function place(type, count, size, shape, colorName) {
    const c = COLORS[colorName];

    for (let i = 0; i < count; i++) {
      const t = (seed + i + 1) / (BLOOD_COUNTS_TOTAL + 2);
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
  place("glucose",  BLOOD_COUNTS.glucose,   7, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — STATIC
// -----------------------------------------------------

function updateBloodContents() {
  return;
}

// -----------------------------------------------------
// DRAW — PATH-ALIGNED SYMBOLS
// -----------------------------------------------------

function drawBloodContents() {
  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    // 🔍 faint diagnostic outline
    stroke(255, 60);
    strokeWeight(1);

    fill(p.color[0], p.color[1], p.color[2]);

    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size);
    }

    noStroke();

    // Bound oxygen dot (oxy RBC only)
    if (p.type === "rbcOxy") {
      const o2 = COLORS.oxygen;
      fill(o2[0], o2[1], o2[2]);
      circle(pos.x + 3, pos.y - 3, 3);
    }
  }
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
