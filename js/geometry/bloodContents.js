// =====================================================
// BLOOD CONTENTS — SYMBOLIC, STATIC (PATH-ALIGNED)
// =====================================================
// ✔ Uses arteryPath + getArteryPoint
// ✔ Static
// ✔ Sparse (but visible)
// ✔ Discrete symbols only
// ✔ No lumen fill
// =====================================================

console.log("🩸 bloodContents v0.4 (path-aligned static, visible) loaded");

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
    arteryPath.length === 0
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

  // -----------------------------
  // SYMBOLIC PARTICLES
  // -----------------------------

  place("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", colors.rbcOxy);
  place("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", colors.rbcDeoxy);
  place("water",    BLOOD_COUNTS.water,     6, "circle", colors.water);
  place("glucose",  BLOOD_COUNTS.glucose,   7, "square", colors.glucose);
}

// -----------------------------------------------------
// UPDATE — STATIC
// -----------------------------------------------------

function updateBloodContents() {
  return;
}

// -----------------------------------------------------
// DRAW — PATH-ALIGNED SYMBOLS (WITH DIAGNOSTIC OUTLINE)
// -----------------------------------------------------

function drawBloodContents() {
  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    // 🔍 faint outline for visibility against dark lumen
    stroke(255, 60);
    strokeWeight(1);
    fill(p.color);

    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rectMode(CENTER);
      rect(pos.x, pos.y, p.size, p.size);
    }

    noStroke();

    // Bound oxygen dot (oxy RBC only)
    if (p.type === "rbcOxy") {
      fill(255);
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
