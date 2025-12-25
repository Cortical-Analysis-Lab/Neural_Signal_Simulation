// =====================================================
// BLOOD CONTENTS — HEARTBEAT FLOW + LABELED MOLECULES
// =====================================================
// ✔ Text-based molecules (HbO2, Hb, Glu, H2O, O2)
// ✔ O2 only appears after HbO2 dissociation
// ✔ Heartbeat-locked transport
// ✔ Perivascular accumulation before delivery
// ✔ AP-driven SUPPLY increase (flux, not count)
// ✔ Population conserved over time
// =====================================================

console.log("🩸 bloodContents v3.2 (steady-state + AP supply coupling) loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------

window.bloodParticles = window.bloodParticles || [];
const bloodParticles = window.bloodParticles;

// -----------------------------------------------------
// PARTICLE COUNTS (INITIAL DENSITY ONLY)
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

// Baseline probabilities (educational clarity)
const AQP4_PROB_BASE  = 0.030;
const GLUT1_PROB_BASE = 0.022;
const O2_PROB_BASE    = 0.018;

// -----------------------------------------------------
// ACTIVITY COUPLING
// -----------------------------------------------------

const METABOLIC_BOOST_DURATION = 10000;
const METABOLIC_MULTIPLIER    = 5.0;
const SUPPLY_BIAS_MULTIPLIER  = 2.5;

let metabolicBoostUntil = 0;

// -----------------------------------------------------
// CSF / PERIVASCULAR MOTION
// -----------------------------------------------------

const CSF_DRIFT          = 0.0225;
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
// RESPAWN — STEADY STATE CONSERVATION
// -----------------------------------------------------

function respawnIntravascular(oldParticle, forceType = null, supplyGain = 1.0) {
  let type = forceType || oldParticle.type;

  // AP-driven SUPPLY enrichment (flux, not count)
  if (supplyGain > 1.0 && !forceType) {
    const r = random();
    if (r < 0.45 * supplyGain) type = "rbcOxy";
    else if (r < 0.65 * supplyGain) type = "glucose";
  }

  let label = oldParticle.label;
  let color = oldParticle.color;

  if (type === "rbcOxy")   { label = "HbO₂"; color = COLORS.rbcOxy; }
  if (type === "rbcDeoxy") { label = "Hb";   color = COLORS.rbcDeoxy; }
  if (type === "water")    { label = "H₂O";  color = COLORS.water; }
  if (type === "glucose")  { label = "Glu";  color = COLORS.glucose; }

  bloodParticles.push({
    type,
    label,
    color,

    t: random(0.0, 0.05),
    tTarget: random(0.0, 0.05),
    lane: random(LANE_MIN, LANE_MAX),

    state: "intravascular",

    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    alpha: 255
  });
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

  const supplyGain =
    now < metabolicBoostUntil ? SUPPLY_BIAS_MULTIPLIER : 1.0;

  const AQP4_PROB  = AQP4_PROB_BASE  * metabolicGain;
  const GLUT1_PROB = GLUT1_PROB_BASE * metabolicGain;
  const O2_PROB    = O2_PROB_BASE    * metabolicGain;

  // ---------------- HEARTBEAT ----------------
  const beat = now - lastBeatTime >= BEAT_INTERVAL;
  if (beat) lastBeatTime = now;

  // Intravascular flow (SUPPLY-COUPLED)
  if (beat) {
    for (const p of bloodParticles) {
      if (p.state !== "intravascular") continue;

      const flowGain =
        now < metabolicBoostUntil &&
        (p.type === "rbcOxy" || p.type === "glucose")
          ? 1.6
          : 1.0;

      p.tTarget += FLOW_STEP * flowGain;

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

    // HbO₂ → O₂ dissociation
    if (p.type === "rbcOxy" && random() < O2_PROB) {
      p.type  = "oxygen";
      p.label = "O₂";
      p.color = COLORS.oxygen;
      allow = true;
    }

    if (!allow) continue;

    const pos = getArteryPoint(p.t, p.lane);
    if (!pos) continue;

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

    // H₂O: local diffusion + fade
    if (p.type === "water") {
      p.x += p.vx;
      p.y += p.vy;

      p.alpha -= 0.6;
      if (p.alpha <= 0) {
        respawnIntravascular(p, "water", supplyGain);
        bloodParticles.splice(i, 1);
      }
      continue;
    }

    // O₂ / Glucose: heartbeat-locked delivery
    if (beat) {
      const dx = somaX - p.x;
      const dy = somaY - p.y;
      const d  = sqrt(dx * dx + dy * dy) || 1;

      p.x += (dx / d) * 6;
      p.y += (dy / d) * 6;

      if (d < 20) {
        if (p.type === "oxygen") {
          respawnIntravascular(p, "rbcDeoxy", supplyGain);
        } else if (p.type === "glucose") {
          respawnIntravascular(p, "glucose", supplyGain);
        }
        bloodParticles.splice(i, 1);
      }
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
