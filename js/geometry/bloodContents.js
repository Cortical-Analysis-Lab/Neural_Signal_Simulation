// =====================================================
// BLOOD CONTENTS — HEARTBEAT FLOW + ACTIVITY-COUPLED BBB
// =====================================================
// ✔ Slower CSF transport
// ✔ Activity-dependent glucose & oxygen boost
// ✔ Mid-artery BBB gating
// ✔ Correct routes only
// ✔ Reload-safe
// =====================================================

console.log("🩸 bloodContents v2.3 (activity-coupled transport) loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------

window.bloodParticles = window.bloodParticles || [];
const bloodParticles = window.bloodParticles;

// -----------------------------------------------------
// PARTICLE COUNTS (BASELINE)
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   30,
  rbcDeoxy: 18,
  water:    30,
  glucose:  18
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

const EXIT_LANE_THRESHOLD = 0.42;
const BBB_T_MIN = 0.35;
const BBB_T_MAX = 0.65;

// base probabilities
const AQP4_PROB_BASE  = 0.012;
const GLUT1_PROB_BASE = 0.008;
const O2_PROB_BASE    = 0.006;

// -----------------------------------------------------
// ACTIVITY COUPLING
// -----------------------------------------------------

const METABOLIC_BOOST_DURATION = 3600; // ms
const METABOLIC_MULTIPLIER    = 3.0;

let metabolicBoostUntil = 0;

// -----------------------------------------------------
// CSF DRIFT (HALF SPEED)
// -----------------------------------------------------

const CSF_DRIFT = 0.0225; // was 0.045

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
        vLane: 0,

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
  spawn("glucose",  BLOOD_COUNTS.glucose,  12, "square", "glucose");
}

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // -------------------------------------------------
  // Detect neuron 1 firing
  // -------------------------------------------------
  if (
    window.neuron1Fired === true ||
    (window.lastNeuron1SpikeTime &&
     now - window.lastNeuron1SpikeTime < 50)
  ) {
    metabolicBoostUntil = now + METABOLIC_BOOST_DURATION;
    window.neuron1Fired = false;
  }

  const metabolicGain =
    now < metabolicBoostUntil ? METABOLIC_MULTIPLIER : 1.0;

  // -------------------------------------------------
  // EXTRA SUPPLY DURING METABOLIC BOOST
  // -------------------------------------------------
  if (metabolicGain > 1 && random() < 0.25) {
    spawnAtTop("glucose", 2); // double glucose
    spawnAtTop("oxygen",  2); // double oxygen
  }


  const AQP4_PROB  = AQP4_PROB_BASE  * metabolicGain;
  const GLUT1_PROB = GLUT1_PROB_BASE * metabolicGain;
  const O2_PROB    = O2_PROB_BASE    * metabolicGain;

  // -------------------------------------------------
  // HEARTBEAT FLOW
  // -------------------------------------------------
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

  for (const p of bloodParticles) {
    if (!p.exited) {
      p.t += (p.tTarget - p.t) * T_EASE;
    }
  }

  // -------------------------------------------------
  // BBB EXIT (MID-ARTERY ONLY)
  // -------------------------------------------------
  for (const p of bloodParticles) {
    if (p.exited) continue;
    if (p.t < BBB_T_MIN || p.t > BBB_T_MAX) continue;
    if (Math.abs(p.lane) < EXIT_LANE_THRESHOLD) continue;

    let allow = false;

    if (p.type === "water"   && random() < AQP4_PROB)  allow = true;
    if (p.type === "glucose" && random() < GLUT1_PROB) allow = true;
    if (p.type === "rbcOxy"  && random() < O2_PROB) {
      p.type  = "oxygen";
      p.size  = 4;
      p.color = COLORS.oxygen;
      allow = true;
    }

    if (!allow) continue;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    p.exited = true;
    p.x = pos.x;
    p.y = pos.y;

    const dir = p.lane > 0 ? 1 : -1;
    p.vx = dir * 0.2;   // HALF SPEED
    p.vy = random(-0.025, 0.025);
  }

  // -------------------------------------------------
  // CSF DRIFT → NEURON 1
  // -------------------------------------------------
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

    if (p.type === "water") {
      p.alpha -= 2;
      if (p.alpha <= 0) {
        bloodParticles.splice(i, 1);
      }
    }

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

    fill(p.color[0], p.color[1], p.color[2], p.alpha);

    if (p.shape === "square") {
      rect(x, y, p.size * 0.7, p.size * 0.7);
    } else {
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
