// =====================================================
// BLOOD CONTENTS — SMOOTH HEARTBEAT FLOW (FLUID-LIKE)
// =====================================================
// ✔ Heartbeat-gated transport
// ✔ Smooth interpolation
// ✔ Soft particle collisions
// ✔ Soft wall interactions
// ✔ BBB exit events (AQP4 / GLUT1 / O2)
// ✔ CSF drift toward neuron 1
// ✔ Water fades out (astrocytic buffering)
// ✔ O2 + glucose consumed at soma
// ✔ Reload-safe
// ✔ COLORS.js native
// =====================================================

console.log("🩸 bloodContents v2.2 (BBB + consumption dynamics) loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------

window.bloodParticles = window.bloodParticles || [];
const bloodParticles = window.bloodParticles;

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

const T_EASE        = 0.12;
const COLLISION_R  = 0.06;
const COLLISION_K  = 0.015;
const WALL_K       = 0.020;
const LANE_DAMPING = 0.90;

// -----------------------------------------------------
// BBB TRANSPORT PROBABILITIES
// -----------------------------------------------------

const AQP4_PROB   = 0.010;
const GLUT1_PROB  = 0.008;
const O2_PROB     = 0.005;

// -----------------------------------------------------
// CSF CONSUMPTION PARAMETERS
// -----------------------------------------------------

const WATER_FADE_RATE   = 1.5;   // alpha per frame
const CONSUME_RADIUS    = 14;    // distance to soma

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

        // blood motion
        t: t0,
        tTarget: t0,
        lane: random(LANE_MIN, LANE_MAX),
        vLane: 0,

        // CSF motion
        state: "blood",
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,

        // visual
        alpha: 255
      });
    }
  }

  spawn("rbcOxy",   BLOOD_COUNTS.rbcOxy,   10, "circle", "rbcOxy");
  spawn("rbcDeoxy", BLOOD_COUNTS.rbcDeoxy, 10, "circle", "rbcDeoxy");
  spawn("water",    BLOOD_COUNTS.water,     6, "circle", "water");
  spawn("glucose",  BLOOD_COUNTS.glucose,   12, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // =====================================================
  // BBB EXIT EVENTS
  // =====================================================

  for (const p of bloodParticles) {
    if (p.state !== "blood") continue;

    if (p.type === "water" && Math.abs(p.lane) > 0.48 && random() < AQP4_PROB) {
      const pos = getArteryPoint(p.t, p.lane);
      if (!pos) continue;

      Object.assign(p, {
        state: "csf",
        x: pos.x,
        y: pos.y,
        vx: random(-0.3, 0.3),
        vy: random(-0.2, 0.2),
        alpha: 200
      });
      continue;
    }

    if (p.type === "glucose" && Math.abs(p.lane) > 0.45 && random() < GLUT1_PROB) {
      const pos = getArteryPoint(p.t, p.lane);
      if (!pos) continue;

      Object.assign(p, {
        state: "csf",
        x: pos.x,
        y: pos.y,
        vx: random(-0.25, 0.25),
        vy: random(-0.15, 0.15)
      });
      continue;
    }

    if (p.type === "rbcOxy" && random() < O2_PROB) {
      const pos = getArteryPoint(p.t, p.lane);
      if (!pos) continue;

      Object.assign(p, {
        state: "csf",
        x: pos.x,
        y: pos.y,
        vx: random(-0.35, 0.35),
        vy: random(-0.2, 0.2)
      });
    }
  }

  // =====================================================
  // HEARTBEAT TRANSPORT (BLOOD ONLY)
  // =====================================================

  if (now - lastBeatTime >= BEAT_INTERVAL) {
    lastBeatTime = now;

    for (const p of bloodParticles) {
      if (p.state !== "blood") continue;

      p.tTarget += FLOW_STEP;
      if (p.tTarget > 1) {
        p.tTarget -= 1;
        p.t = p.tTarget;
        p.lane = random(LANE_MIN, LANE_MAX);
        p.vLane = 0;
      }
    }
  }

  for (const p of bloodParticles) {
    if (p.state === "blood") {
      p.t += (p.tTarget - p.t) * T_EASE;
    }
  }

  // =====================================================
  // CSF DRIFT + CONSUMPTION
  // =====================================================

  if (window.neuron && neuron.soma) {
    for (let i = bloodParticles.length - 1; i >= 0; i--) {
      const p = bloodParticles[i];
      if (p.state !== "csf") continue;

      const dx = neuron.soma.x - p.x;
      const dy = neuron.soma.y - p.y;
      const d  = sqrt(dx*dx + dy*dy) + 0.001;

      // Drift
      p.vx += (dx / d) * 0.02;
      p.vy += (dy / d) * 0.02;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.x  += p.vx;
      p.y  += p.vy;

      // Water fades out
      if (p.type === "water") {
        p.alpha -= WATER_FADE_RATE;
        if (p.alpha <= 0) {
          bloodParticles.splice(i, 1);
        }
        continue;
      }

      // Oxygen & glucose consumed at soma
      if ((p.type === "glucose" || p.type === "rbcOxy") && d < CONSUME_RADIUS) {
        bloodParticles.splice(i, 1);
      }
    }
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
    const pos = p.state === "blood"
      ? getArteryPoint(p.t, p.lane)
      : { x: p.x, y: p.y };

    if (!pos) continue;

    fill(p.color[0], p.color[1], p.color[2], p.alpha);

    if (p.shape === "circle") {
      circle(pos.x, pos.y, p.size);
    } else {
      rect(pos.x, pos.y, p.size * 0.7, p.size * 0.7);
    }

    if (p.type === "rbcOxy") {
      fill(COLORS.oxygen[0], COLORS.oxygen[1], COLORS.oxygen[2], p.alpha);
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
