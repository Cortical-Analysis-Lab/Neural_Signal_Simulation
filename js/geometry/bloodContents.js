// =====================================================
// BLOOD CONTENTS — SYMBOLIC, WAVE-PROPAGATED AGITATION
// =====================================================
// ✔ Particles exist everywhere
// ✔ Wave propagates through them
// ✔ Local agitation at wave crest
// ✔ No global redistribution
// ✔ No continuous drift
// ✔ Fixed lumen
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.4 (true wave propagation) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// PARTICLE COUNTS
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
// WAVE PARAMETERS (PROPAGATION, NOT TRANSPORT)
// -----------------------------------------------------

const WAVE_SPEED   = 0.0009;  // wave speed (t / ms)
const WAVE_WIDTH   = 0.08;    // spatial width of influence
const WAVE_STRENGTH_T = 0.015; // longitudinal agitation
const WAVE_STRENGTH_L = 0.10;  // lateral agitation
const WAVE_DECAY   = 0.85;    // relaxation per frame

// -----------------------------------------------------
// INITIALIZE — RANDOM DISTRIBUTION (STATIC BASE)
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

        // ---- base (equilibrium) state ----
        t0: random(),
        lane0: random(LANE_MIN, LANE_MAX),

        // ---- dynamic wave offsets ----
        dt_wave: 0,
        dl_wave: 0
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — WAVE PROPAGATES, PARTICLES AGITATE
// -----------------------------------------------------

function updateBloodContents() {
  const waveHead = (state.time * WAVE_SPEED) % 1;

  for (const p of bloodParticles) {

    // circular distance from wave crest
    let d = abs(p.t0 - waveHead);
    d = min(d, 1 - d);

    // -------------------------
    // Wave interaction
    // -------------------------
    if (d < WAVE_WIDTH) {
      const strength = 1 - d / WAVE_WIDTH;

      // longitudinal compression / release
      p.dt_wave += WAVE_STRENGTH_T * strength * random(-1, 1);

      // lateral agitation
      p.dl_wave += WAVE_STRENGTH_L * strength * random(-1, 1);
    }

    // -------------------------
    // Relaxation back to base
    // -------------------------
    p.dt_wave *= WAVE_DECAY;
    p.dl_wave *= WAVE_DECAY;
  }
}

// -----------------------------------------------------
// DRAW — BASE + WAVE OFFSETS
// -----------------------------------------------------

function drawBloodContents() {
  push();
  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {

    const t = (p.t0 + p.dt_wave + 1) % 1;
    const lane = constrain(
      p.lane0 + p.dl_wave,
      LANE_MIN,
      LANE_MAX
    );

    const pos = getArteryPoint(t, lane);
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
    // Bound oxygen
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
