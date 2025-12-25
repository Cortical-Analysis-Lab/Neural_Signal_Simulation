// =====================================================
// BLOOD CONTENTS — HEARTBEAT FLOW + LABELED MOLECULES
// =====================================================
// ✔ Text-based molecules (HbO2, Hb, Glu, H2O, O2)
// ✔ O2 only appears after HbO2 dissociation
// ✔ Heartbeat-locked transport
// ✔ Perivascular accumulation before delivery
// =====================================================

console.log("🩸 bloodContents v3.1 (perivascular reservoir) loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------

window.bloodParticles = window.bloodParticles || [];
const bloodParticles = window.bloodParticles;

// -----------------------------------------------------
// PARTICLE COUNTS
// -----------------------------------------------------

const BLOOD_COUNTS = {
  rbcOxy:   26,
  rbcDeoxy: 16,
  water:    22,
  glucose:  16
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

let lastBeatTime = 0;

// -----------------------------------------------------
// BBB TRANSPORT PARAMETERS
// -----------------------------------------------------

const EXIT_LANE_THRESHOLD = 0.42;
const BBB_T_MIN = 0.35;
const BBB_T_MAX = 0.65;

// 🔑 Increased baseline probabilities (educational clarity)
const AQP4_PROB_BASE  = 0.030;
const GLUT1_PROB_BASE = 0.022;
const O2_PROB_BASE    = 0.018;

// -----------------------------------------------------
// ACTIVITY COUPLING
// -----------------------------------------------------

const METABOLIC_BOOST_DURATION = 10000;
const METABOLIC_MULTIPLIER    = 5.0;
let metabolicBoostUntil = 0;

// -----------------------------------------------------
// CSF / PERIVASCULAR MOTION
// -----------------------------------------------------

const CSF_DRIFT = 0.0225;
const PERIVASCULAR_DRIFT = 0.006;

// -----------------------------------------------------
// INITIALIZE
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

  function spawn(type, label, colorName, count) {
    for (let i = 0; i < count; i++) {
      const t0 = random();

      bloodParticles.push({
        type,
        label,
        color: COLORS[colorName],

        t: t0,
        tTarget: t0,
        lane: random(LANE_MIN, LANE_MAX),

        // 🔑 Explicit state
        state: "intravascular",

        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        alpha: 255
      });
    }
  }

  spawn("rbcOxy",   "HbO₂", "rbcOxy",   BLOOD_COUNTS.rbcOxy);
  spawn("rbcDeoxy", "Hb",   "rbcDeoxy", BLOOD_COUNTS.rbcDeoxy);
  spawn("water",    "H₂O",  "water",    BLOOD_COUNTS.water);
  spawn("glucose",  "Glu",  "glucose",  BLOOD_COUNTS.glucose);
}

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------

function updateBloodContents() {
  const now = state.time;

  // ---------------- NEURAL ACTIVITY ----------------
  if (
    window.neuron1Fired ||
    (window.lastNeuron1SpikeTime &&
     now - window.lastNeuron1SpikeTime < 50)
  ) {
    metabolicBoostUntil = now + METABOLIC_BOOST_DURATION;
    window.neuron1Fired = false;
  }

  const metabolicGain =
    now < metabolicBoostUntil ? METABOLIC_MULTIPLIER : 1.0;

  const AQP4_PROB  = AQP4_PROB_BASE  * metabolicGain;
  const GLUT1_PROB = GLUT1_PROB_BASE * metabolicGain;
  const O2_PROB    = O2_PROB_BASE    * metabolicGain;

  // ---------------- HEARTBEAT ----------------
  const beat = now - lastBeatTime >= BEAT_INTERVAL;
  if (beat) lastBeatTime = now;

  // Intravascular flow
  if (beat) {
    for (const p of bloodParticles) {
      if (p.state !== "intravascular") continue;

      p.tTarget += FLOW_STEP;
      if (p.tTarget > 1) {
        p.tTarget -= 1;
        p.t = p.tTarget;
        p.lane = random(LANE_MIN, LANE_MAX);
      }
    }
  }

  for (const p of bloodParticles) {
    if (p.state === "intravascular") {
      p.t += (p.tTarget - p.t) * 0.15;
    }
  }

  // ---------------- BBB EXIT ----------------
  for (const p of bloodParticles) {
    if (p.state !== "intravascular") continue;
    if (p.t < BBB_T_MIN || p.t > BBB_T_MAX) continue;
    if (Math.abs(p.lane) < EXIT_LANE_THRESHOLD) continue;

    let allow = false;

    if (p.type === "water"   && random() < AQP4_PROB)  allow = true;
    if (p.type === "glucose" && random() < GLUT1_PROB) allow = true;

    // HbO2 → O2 dissociation
    if (p.type === "rbcOxy" && random() < O2_PROB) {
      p.type  = "oxygen";
      p.label = "O₂";
      p.color = COLORS.oxygen;
      allow = true;
    }

    if (!allow) continue;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

    // 🔑 Enter perivascular space
    p.state = "perivascular";
    p.x = pos.x;
    p.y = pos.y;

    const dir = p.lane > 0 ? 1 : -1;
    p.vx = dir * PERIVASCULAR_DRIFT;
    p.vy = random(-0.01, 0.01);
  }

  // ---------------- PERIVASCULAR → CSF / NEURON ----------------
  const somaX = width / 2;
  const somaY = height / 2;

  for (let i = bloodParticles.length - 1; i >= 0; i--) {
    const p = bloodParticles[i];
    if (p.state !== "perivascular") continue;

    // H2O: local diffusion, delayed fade
    if (p.type === "water") {
      p.x += p.vx;
      p.y += p.vy;

      p.alpha -= 0.6;
      if (p.alpha <= 0) bloodParticles.splice(i, 1);
      continue;
    }

    // O2 / Glucose: heartbeat-locked delivery
    if (beat) {
      const dx = somaX - p.x;
      const dy = somaY - p.y;
      const d  = sqrt(dx * dx + dy * dy) || 1;

      p.x += (dx / d) * 6;
      p.y += (dy / d) * 6;

      if (d < 20) bloodParticles.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// DRAW — TEXT LABELS
// -----------------------------------------------------

function drawBloodContents() {
  push();
  textAlign(CENTER, CENTER);
  textSize(10);
  noStroke();

  for (const p of bloodParticles) {
    let x, y;

    if (p.state === "intravascular") {
      const pos = getArteryPoint(p.t, p.lane);
      if (!pos) continue;
      x = pos.x;
      y = pos.y;
    } else {
      x = p.x;
      y = p.y;
    }

    fill(p.color[0], p.color[1], p.color[2], p.alpha);
    text(p.label, x, y);
  }

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------

window.initBloodContents   = initBloodContents;
window.updateBloodContents = updateBloodContents;
window.drawBloodContents  = drawBloodContents;
