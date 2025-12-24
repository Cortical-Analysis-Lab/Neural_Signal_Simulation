// =====================================================
// BLOOD CONTENTS — SYMBOLIC, STATIC (PATH-ALIGNED)
// =====================================================
// ✔ Uses arteryPath + getArteryPoint
// ✔ Static
// ✔ Sparse
// ✔ Discrete symbols only
// ✔ No lumen fill
// =====================================================

console.log("🩸 bloodContents v0.3 (path-aligned static) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// INTENTIONALLY LOW COUNTS
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   6,
  rbcDeoxy: 4,
  water:    6,
  glucose:  3
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
    arteryPath.length === 0
  ) {
    requestAnimationFrame(initBloodContents);
    return;
  }

  let seed = 0;

  function place(type, count, size, shape, color) {
    for (let i = 0; i < count; i++) {
      const t = (seed + i + 1) / (BLOOD_COUNTS_TOTAL + 2);
      const lane = lerp(LANE_MIN, LANE_MAX, (i % 3) / 2);

      bloodParticles.push({
        t,
        lane,
        size,
        shape,
        type,
        color
      });
    }
    seed += count;
  }

  const BLOOD_COUNTS_TOTAL =
    BLOOD_COUNTS.rbcOxy +
    BLOOD_COUNTS.rbcDeoxy +
    BLOOD_COUNTS.water +
    BLOOD_COUNTS.glucose;

  // -----------------------------
  // SYMBOLIC PARTICLES
  // -----------------------------

  place("rbcOxy",   BLOOD_COUNTS.rbcOxy,   6, "circle", colors.rbcOxy);
  place("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 6, "circle", colors.rbcDeoxy);
  place("water",    BLOOD_COUNTS.water,    3, "circle", colors.water);
  place("glucose",  BLOOD_COUNTS.glucose,  4, "square", colors.glucose);
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
  noStroke();

  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    fill(p.color);

    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size);
    }

    // Bound oxygen dot
    if (p.type === "rbcOxy") {
      fill(255);
      circle(pos.x + 2, pos.y - 2, 2);
    }
  }
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
