// =====================================================
// BLOOD CONTENTS — PULSE-GATED CONTINUOUS FLOW
// =====================================================
// ✔ Elements always distributed
// ✔ Elements only move when pulse arrives
// ✔ Net downstream transport across pulses
// ✔ Elements settle to rest after pulse
// ✔ No clumping, no slabs
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.7 (pulse-gated continuous flow) loaded");

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
// PULSE PARAMETERS
// -----------------------------------------------------

const WAVE_SPEED        = 0.0009;  // t / ms
const WAVE_WIDTH        = 0.10;    // spatial influence
const WAVE_PUSH_FORWARD = 0.018;   // impulse strength
const VELOCITY_DECAY    = 0.86;    // viscous settling

// -----------------------------------------------------
// INITIALIZE — UNIFORM DISTRIBUTION
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

        // longitudinal position
        t: random(),

        // radial equilibrium
        lane0: random(LANE_MIN, LANE_MAX),

        // dynamic state
        v: 0
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — PULSE-GATED TRANSPORT
// -----------------------------------------------------

function updateBloodContents() {
  const waveHead = (state.time * WAVE_SPEED) % 1;

  for (const p of bloodParticles) {

    // circular distance to wave peak
    let d = Math.abs(p.t - waveHead);
    d = Math.min(d, 1 - d);

    // -------------------------
    // Wave injects forward impulse
    // -------------------------
    if (d < WAVE_WIDTH) {
      const strength = 1 - d / WAVE_WIDTH;
      p.v += WAVE_PUSH_FORWARD * strength;
    }

    // -------------------------
    // Apply velocity
    // -------------------------
    p.t += p.v;

    // -------------------------
    // Viscous decay (settles after wave)
    // -------------------------
    p.v *= VELOCITY_DECAY;

    // -------------------------
    // Recycling (continuous inflow)
    // -------------------------
    if (p.t > 1) {
      p.t -= 1;
      p.v = 0;
      p.lane0 = random(LANE_MIN, LANE_MAX);
    }
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
    const pos = getArteryPoint(p.t, p.lane0);
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

    // bound oxygen (oxy RBC only)
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
