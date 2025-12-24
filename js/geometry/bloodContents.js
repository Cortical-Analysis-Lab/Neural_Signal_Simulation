// =====================================================
// BLOOD CONTENTS — PULSE-DRIVEN TRANSPORT
// =====================================================
// ✔ Blood moves ONLY when wave passes
// ✔ Net downstream transport per pulse
// ✔ Local agitation + bounce
// ✔ New elements introduced upstream
// ✔ No continuous drift
// ✔ No lumen fill
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.5 (pulse-driven transport) loaded");

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
// WAVE / TRANSPORT PARAMETERS
// -----------------------------------------------------

const WAVE_SPEED        = 0.0009;   // wave speed (t / ms)
const WAVE_WIDTH        = 0.08;     // spatial width of wave influence
const WAVE_PUSH_FORWARD = 0.02;     // NET forward transport per pulse
const WAVE_JITTER_T     = 0.01;     // longitudinal agitation
const WAVE_JITTER_L     = 0.10;     // lateral agitation
const RELAX_DECAY       = 0.85;     // relaxation per frame

// -----------------------------------------------------
// INITIALIZE — RANDOM DISTRIBUTION
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

  function spawn(type, count, size, shape, colorName, tInit = random()) {
    const c = COLORS[colorName];

    for (let i = 0; i < count; i++) {
      bloodParticles.push({
        type,
        shape,
        size,
        color: c,

        t: tInit + random(-0.02, 0.02),
        lane0: random(LANE_MIN, LANE_MAX),

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
// UPDATE — PULSE-DRIVEN TRANSPORT
// -----------------------------------------------------

function updateBloodContents() {
  const waveHead = (state.time * WAVE_SPEED) % 1;

  for (const p of bloodParticles) {

    // --- initialize velocity if missing ---
    if (p.v === undefined) p.v = 0;

    // circular distance from wave crest
    let d = abs(p.t - waveHead);
    d = min(d, 1 - d);

    // -------------------------
    // Wave injects MOMENTUM, not position
    // -------------------------
    if (d < WAVE_WIDTH) {
      const strength = 1 - d / WAVE_WIDTH;

      // add forward velocity impulse
      p.v += WAVE_PUSH_FORWARD * strength * random(0.6, 1.2);

      // lateral agitation (unchanged)
      p.dl_wave += WAVE_JITTER_L * strength * random(-1, 1);
    }

    // -------------------------
    // Apply velocity (transport)
    // -------------------------
    p.t += p.v;

    // -------------------------
    // Viscous decay (blood viscosity)
    // -------------------------
    p.v *= 0.90;   // ← key line: breaks packet coherence
    p.dl_wave *= RELAX_DECAY;

    // -------------------------
    // Recycling (new blood enters)
    // -------------------------
    if (p.t > 1) {
      p.t -= 1;
      p.v = 0;
      p.lane0 = random(LANE_MIN, LANE_MAX);
      p.dl_wave = 0;
    }
  }
}

// -----------------------------------------------------
// DRAW — TRANSPORT + AGITATION
// -----------------------------------------------------

function drawBloodContents() {
  push();
  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {

    const lane = constrain(
      p.lane0 + p.dl_wave,
      LANE_MIN,
      LANE_MAX
    );

    const pos = getArteryPoint(p.t, lane);
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
