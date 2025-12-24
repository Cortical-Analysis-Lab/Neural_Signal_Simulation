// =====================================================
// BLOOD CONTENTS — SYMBOLIC MULTI-PARTICLE (STATIC)
// =====================================================
// Diagnostic-only visualization
// ✔ Static
// ✔ Sparse
// ✔ Discrete
// ✔ No lumen fill
// ✔ No motion / no coupling
// =====================================================

console.log("🩸 bloodContents v0.2 (symbolic static) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// VISUAL COUNTS (INTENTIONALLY LOW)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   6,
  rbcDeoxy: 4,
  water:    6,
  glucose:  3
};

// -----------------------------------------------------
// GEOMETRIC MARGINS
// -----------------------------------------------------

const RADIAL_MIN = 0.25;
const RADIAL_MAX = 0.75;

// -----------------------------------------------------
// INITIALIZE — ONE-TIME PLACEMENT
// -----------------------------------------------------

function initBloodContents() {
  bloodParticles.length = 0;

  // Defer until artery is ready
  if (!window.artery || !artery.center || !artery.innerRadius) {
    requestAnimationFrame(initBloodContents);
    return;
  }

  const cx = artery.center.x;
  const cy = artery.center.y;
  const R  = artery.innerRadius;

  let index = 0;

  function place(type, count, size, shape, color) {
    for (let i = 0; i < count; i++) {
      const theta = ((index + i) / 24) * TWO_PI;
      const rFrac = lerp(RADIAL_MIN, RADIAL_MAX, (i % 3) / 2);
      const r     = R * rFrac;

      bloodParticles.push({
        x: cx + cos(theta) * r,
        y: cy + sin(theta) * r,
        size,
        type,
        shape,
        color
      });
    }
    index += count;
  }

  // ---------------------------------------------------
  // SYMBOLIC PARTICLES
  // ---------------------------------------------------

  // Oxy RBC (red) + bound O2 (white dot)
  place("rbcOxy", BLOOD_COUNTS.rbcOxy, 6, "circle", colors.rbcOxy);

  // Deoxy RBC (dark blue)
  place("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 6, "circle", colors.rbcDeoxy);

  // Water (light blue)
  place("water", BLOOD_COUNTS.water, 3, "circle", colors.water);

  // Glucose (green square)
  place("glucose", BLOOD_COUNTS.glucose, 4, "square", colors.glucose);
}

// -----------------------------------------------------
// UPDATE — NO-OP (STATIC)
// -----------------------------------------------------

function updateBloodContents() {
  return;
}

// -----------------------------------------------------
// DRAW — DISCRETE SYMBOLS ONLY
// -----------------------------------------------------

function drawBloodContents() {
  noStroke();

  for (const p of bloodParticles) {
    fill(p.color);

    if (p.shape === "circle") {
      circle(p.x, p.y, p.size);
    } else {
      rectMode(CENTER);
      rect(p.x, p.y, p.size, p.size);
    }

    // --- OXYGEN DOT (BOUND TO OXY RBC ONLY) ---
    if (p.type === "rbcOxy") {
      fill(255);
      circle(p.x + 2, p.y - 2, 2);
    }
  }
}

// -----------------------------------------------------
// GLOBAL EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
