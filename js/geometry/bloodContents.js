// =====================================================
// BLOOD CONTENTS — HEARTBEAT-STEPPED FLOW
// =====================================================
// ✔ Elements always distributed
// ✔ Elements move only on heartbeat
// ✔ Discrete step → pause → step
// ✔ Net downstream transport
// ✔ No waves, no jitter, no clumps
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================// =====================================================
// BLOOD CONTENTS — SMOOTH HEARTBEAT FLOW (FLUID-LIKE)
// =====================================================
// ✔ Heartbeat-gated transport
// ✔ Smooth interpolation (no teleporting)
// ✔ Soft particle collisions
// ✔ Soft wall interactions
// ✔ No clumping, no slabs
// ✔ COLORS.js native
// ✔ p5 state isolated
// =====================================================

console.log("🩸 bloodContents v1.9 (smooth heartbeat fluid) loaded");

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
// HEARTBEAT PARAMETERS
// -----------------------------------------------------

const HEART_RATE_BPM = 72;
const BEAT_INTERVAL = 60000 / HEART_RATE_BPM;
const FLOW_STEP     = 0.012;

// -----------------------------------------------------
// FLUID FEEL PARAMETERS
// -----------------------------------------------------

const T_EASE        = 0.12;   // how fast particles reach target
const COLLISION_R  = 0.06;   // interaction radius (lane space)
const COLLISION_K  = 0.015;  // repulsion strength
const WALL_K       = 0.020;  // wall push strength
const LANE_DAMPING = 0.90;   // lateral viscosity

let lastBeatTime = 0;

// -----------------------------------------------------
// INITIALIZE
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
      const t0 = random();

      bloodParticles.push({
        type,
        shape,
        size,
        color: c,

        t: t0,
        tTarget: t0,

        lane: random(LANE_MIN, LANE_MAX),
        vLane: 0
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — HEARTBEAT + MICRO-PHYSICS
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // -------------------------
  // Heartbeat step
  // -------------------------
  if (now - lastBeatTime >= BEAT_INTERVAL) {
    lastBeatTime = now;

    for (const p of bloodParticles) {
      p.tTarget += FLOW_STEP;

      if (p.tTarget > 1) {
        p.tTarget -= 1;
        p.t = p.tTarget;
        p.lane = random(LANE_MIN, LANE_MAX);
        p.vLane = 0;
      }
    }
  }

  // -------------------------
  // Smooth axial motion
  // -------------------------
  for (const p of bloodParticles) {
    p.t += (p.tTarget - p.t) * T_EASE;
  }

  // -------------------------
  // Soft particle collisions (lane only)
  // -------------------------
  for (let i = 0; i < bloodParticles.length; i++) {
    const a = bloodParticles[i];

    for (let j = i + 1; j < bloodParticles.length; j++) {
      const b = bloodParticles[j];

      const dl = a.lane - b.lane;
      const dist = Math.abs(dl);

      if (dist > 0 && dist < COLLISION_R) {
        const push = (COLLISION_R - dist) * COLLISION_K;
        const dir  = dl / dist;

        a.vLane += dir * push;
        b.vLane -= dir * push;
      }
    }
  }

  // -------------------------
  // Wall interaction
  // -------------------------
  for (const p of bloodParticles) {
    if (p.lane < LANE_MIN) {
      p.vLane += (LANE_MIN - p.lane) * WALL_K;
    }
    if (p.lane > LANE_MAX) {
      p.vLane += (LANE_MAX - p.lane) * WALL_K;
    }
  }

  // -------------------------
  // Integrate lateral motion
  // -------------------------
  for (const p of bloodParticles) {
    p.lane += p.vLane;
    p.vLane *= LANE_DAMPING;
    p.lane = constrain(p.lane, LANE_MIN, LANE_MAX);
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------

function drawBloodContents() {
  push();
  rectMode(CENTER);
  noStroke();

  for (const p of bloodParticles) {
    const pos = getArteryPoint(p.t, p.lane);
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

    // oxygen dot
    if (p.type === "rbcOxy") {
      const o2 = COLORS.oxygen;
      fill(o2[0], o2[1], o2[2]);
      circle(pos.x + 3, pos.y - 3, 3);
    }
  }

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;


console.log("🩸 bloodContents v1.8 (heartbeat-stepped flow) loaded");

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
// HEARTBEAT PARAMETERS
// -----------------------------------------------------

const HEART_RATE_BPM = 72;
const BEAT_INTERVAL = 60000 / HEART_RATE_BPM; // ms per beat
const FLOW_STEP     = 0.012;                  // t-units per beat

let lastBeatTime = 0;

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

        // radial lane
        lane: random(LANE_MIN, LANE_MAX)
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   5 * 2.5, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE — HEARTBEAT-GATED TRANSPORT
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // Heartbeat check
  if (now - lastBeatTime >= BEAT_INTERVAL) {
    lastBeatTime = now;

    for (const p of bloodParticles) {
      p.t += FLOW_STEP;

      // wrap → new blood enters upstream
      if (p.t > 1) {
        p.t -= 1;
        p.lane = random(LANE_MIN, LANE_MAX);
      }
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
    const pos = getArteryPoint(p.t, p.lane);
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
