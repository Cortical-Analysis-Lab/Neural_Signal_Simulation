// =====================================================
// BLOOD CONTENTS — HEARTBEAT FLOW + BBB TRANSPORT
// =====================================================
// ✔ Heartbeat-gated axial flow
// ✔ Smooth interpolation
// ✔ Soft collisions + wall interaction
// ✔ BBB exit via AQP4 / GLUT1 / O2
// ✔ Exited particles drift to neuron 1
// ✔ Water fades, glucose & O2 vanish at soma
// ✔ Reload-safe
// =====================================================

console.log("🩸 bloodContents v2.1 (BBB transport enabled) loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------

window.bloodParticles = window.bloodParticles || [];
const bloodParticles = window.bloodParticles;

// -----------------------------------------------------
// PARTICLE COUNTS (↑ 1.5×)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   Math.round(20 * 1.5),  // 30
  rbcDeoxy: Math.round(12 * 1.5),  // 18
  water:    Math.round(20 * 1.5),  // 30
  glucose:  Math.round(12 * 1.5)   // 18
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

let lastBeatTime = 0;

// -----------------------------------------------------
// BBB TRANSPORT PARAMETERS
// -----------------------------------------------------

const EXIT_LANE_THRESHOLD = 0.40;

const AQP4_PROB  = 0.035;  // water
const GLUT1_PROB = 0.020;  // glucose
const O2_PROB    = 0.015;  // oxygen

const CSF_DRIFT  = 0.05;

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

        // axial motion (artery)
        t: t0,
        tTarget: t0,

        // lateral motion (artery)
        lane: random(LANE_MIN, LANE_MAX),
        vLane: 0,

        // CSF state
        exited: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
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
// UPDATE — HEARTBEAT + BBB + CSF
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // -------------------------
  // HEARTBEAT STEP (artery)
  // -------------------------
  if (now - lastBeatTime >= BEAT_INTERVAL) {
    lastBeatTime = now;

    for (const p of bloodParticles) {
      if (p.exited) continue;

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
  // SMOOTH AXIAL MOTION
  // -------------------------
  for (const p of bloodParticles) {
    if (!p.exited) {
      p.t += (p.tTarget - p.t) * T_EASE;
    }
  }

  // -------------------------
  // SOFT COLLISIONS (lane)
  // -------------------------
  for (let i = 0; i < bloodParticles.length; i++) {
    const a = bloodParticles[i];
    if (a.exited) continue;

    for (let j = i + 1; j < bloodParticles.length; j++) {
      const b = bloodParticles[j];
      if (b.exited) continue;

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
  // WALL INTERACTION
  // -------------------------
  for (const p of bloodParticles) {
    if (p.exited) continue;

    if (p.lane < LANE_MIN) p.vLane += (LANE_MIN - p.lane) * WALL_K;
    if (p.lane > LANE_MAX) p.vLane += (LANE_MAX - p.lane) * WALL_K;
  }

  // -------------------------
  // INTEGRATE LANE MOTION
  // -------------------------
  for (const p of bloodParticles) {
    if (!p.exited) {
      p.lane += p.vLane;
      p.vLane *= LANE_DAMPING;
      p.lane = constrain(p.lane, LANE_MIN, LANE_MAX);
    }
  }

  // -------------------------
  // BBB EXIT LOGIC
  // -------------------------
  for (const p of bloodParticles) {
    if (p.exited) continue;

    if (Math.abs(p.lane) < EXIT_LANE_THRESHOLD) continue;

    let allowExit = false;

    if (p.type === "water"    && random() < AQP4_PROB)  allowExit = true;
    if (p.type === "glucose"  && random() < GLUT1_PROB) allowExit = true;
    if (p.type === "rbcOxy"   && random() < O2_PROB) {
      p.type  = "oxygen";
      p.shape = "circle";
      p.size  = 4;
      p.color = COLORS.oxygen;
      allowExit = true;
    }

    if (!allowExit) continue;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    p.exited = true;
    p.x = pos.x;
    p.y = pos.y;
    p.vx = random(-0.2, 0.2);
    p.vy = random(-0.2, 0.2);
  }

  // -------------------------
  // CSF DRIFT → NEURON 1
  // -------------------------
  const somaX = width / 2;
  const somaY = height / 2;

  for (let i = bloodParticles.length - 1; i >= 0; i--) {
    const p = bloodParticles[i];
    if (!p.exited) continue;

    const dx = somaX - p.x;
    const dy = somaY - p.y;
    const d  = sqrt(dx * dx + dy * dy) || 1;

    p.vx += (dx / d) * CSF_DRIFT;
    p.vy += (dy / d) * CSF_DRIFT;

    p.x += p.vx;
    p.y += p.vy;

    // water fades
    if (p.type === "water") {
      p.alpha -= 2;
      if (p.alpha <= 0) {
        bloodParticles.splice(i, 1);
        continue;
      }
    }

    // glucose + oxygen consumed at soma
    if (d < 20 && (p.type === "glucose" || p.type === "oxygen")) {
      bloodParticles.splice(i, 1);
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

    let x, y;

    if (p.exited) {
      x = p.x;
      y = p.y;
    } else {
      const pos = getArteryPoint(p.t, p.lane);
      if (!pos) continue;
      x = pos.x;
      y = pos.y;
    }

    if (p.type === "glucose") {
      const g = COLORS.glucose;
      fill(g[0], g[1], g[2], p.alpha);
      rect(x, y, p.size * 0.7, p.size * 0.7);
    } else {
      fill(p.color[0], p.color[1], p.color[2], p.alpha);
      circle(x, y, p.size);
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
