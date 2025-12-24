// =====================================================
// BLOOD CONTENTS — DISTRIBUTED PULSE INTERACTION
// =====================================================
// ✔ Continuous distribution everywhere
// ✔ Wave perturbs local elements only
// ✔ No packet transport
// ✔ No empty regions
// ✔ New elements appear independently
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.6 (distributed pulse interaction) loaded");

const bloodParticles = [];

// -----------------------------------------------------
// PARTICLE COUNTS (FINAL)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   20,
  rbcDeoxy: 12,
  water:    20,
  glucose:  12
};

const TOTAL_PARTICLES =
  BLOOD_COUNTS.rbcOxy +
  BLOOD_COUNTS.rbcDeoxy +
  BLOOD_COUNTS.water +
  BLOOD_COUNTS.glucose;

// -----------------------------------------------------
// LANE CONSTRAINTS
// -----------------------------------------------------

const LANE_MIN = -0.55;
const LANE_MAX =  0.55;

// -----------------------------------------------------
// PULSE PARAMETERS
// -----------------------------------------------------

const WAVE_SPEED       = 0.0009;
const WAVE_WIDTH       = 0.10;
const STEP_FORWARD     = 0.006;   // small, non-transporting
const JITTER_LATERAL   = 0.08;
const RELAX_RATE       = 0.06;    // relax toward equilibrium

// -----------------------------------------------------
// INITIALIZE — UNIFORMLY DISTRIBUTED BACKGROUND
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

        // equilibrium position (never empty)
        t0: random(),
        lane0: random(LANE_MIN, LANE_MAX),

        // dynamic offsets
        t: 0,
        lane: 0
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — LOCAL, DISTRIBUTED WAVE EFFECT
// -----------------------------------------------------

function updateBloodContents() {
  const waveHead = (state.time * WAVE_SPEED) % 1;

  for (const p of bloodParticles) {

    // base longitudinal position
    const baseT = (p.t0 + p.t + 1) % 1;

    // distance from wave
    let d = abs(baseT - waveHead);
    d = min(d, 1 - d);

    // -------------------------
    // Pulse interaction (LOCAL)
    // -------------------------
    if (d < WAVE_WIDTH && random() < 0.35) {
      // only some particles respond → breaks packets
      p.t += STEP_FORWARD * random(0.6, 1.2);
      p.lane += JITTER_LATERAL * random(-1, 1);
    }

    // -------------------------
    // Relaxation toward background
    // -------------------------
    p.t *= (1 - RELAX_RATE);
    p.lane *= (1 - RELAX_RATE);
  }
}

// -----------------------------------------------------
// DRAW — BACKGROUND + LOCAL OFFSETS
// -----------------------------------------------------

function drawBloodContents() {
  push();
  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {

    const t = (p.t0 + p.t + 1) % 1;
    const lane = constrain(
      p.lane0 + p.lane,
      LANE_MIN,
      LANE_MAX
    );

    const pos = getArteryPoint(t, lane);
    if (!pos) continue;

    // color
    if (p.type === "glucose") {
      const g = COLORS.glucose;
      fill(g[0], g[1], g[2], 180);
    } else {
      fill(p.color[0], p.color[1], p.color[2]);
    }

    // shape
    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rect(pos.x, pos.y, p.size * 0.7, p.size * 0.7);
    }

    // bound oxygen
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
