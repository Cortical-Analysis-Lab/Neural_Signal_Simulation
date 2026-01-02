console.log("🫧 synapse/vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING SYSTEM
// Presynaptic cytosol → filled vesicle
// =====================================================

// -----------------------------------------------------
// GLOBAL STORAGE (SHARED)
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
const synapseVesicles = window.synapseVesicles;

let synapseH   = [];
let synapseATP = [];

// -----------------------------------------------------
// CONSTANT ALIASES (AUTHORITATIVE)
// -----------------------------------------------------
const CENTER_X     = window.SYNAPSE_TERMINAL_CENTER_X;
const CENTER_Y     = window.SYNAPSE_TERMINAL_CENTER_Y;
const RADIUS       = window.SYNAPSE_TERMINAL_RADIUS;
const BACK_OFFSET  = window.SYNAPSE_BACK_OFFSET_X;

const STOP_X       = window.SYNAPSE_VESICLE_STOP_X;
const DOCK_X       = window.SYNAPSE_DOCK_X;

const V_RADIUS     = window.SYNAPSE_VESICLE_RADIUS;
const V_STROKE     = window.SYNAPSE_VESICLE_STROKE;
const MAX_VESICLES = window.SYNAPSE_MAX_VESICLES;

// Vesicles load in a FORWARD cytosolic band
const LOAD_MIN_X = DOCK_X + 28;
const LOAD_MAX_X = CENTER_X + BACK_OFFSET + 8;

// -----------------------------------------------------
// LOADER CONTROL
// -----------------------------------------------------
let loaderActive = false;
let loaderIndex  = 0;

// -----------------------------------------------------
// STATES (LOADING ONLY)
// -----------------------------------------------------
const VESICLE_STATE = {
  EMPTY:    "empty",
  PRIMING:  "priming",
  LOADING:  "loading",
  LOADED:   "loaded"
};

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function vesicleBorder() { return color(245, 225, 140); }
function vesicleFill()   { return color(245, 225, 140, 42); }
function ntColor()       { return color(185, 120, 255, 210); }

// -----------------------------------------------------
// SOFT GEOMETRY CONSTRAINT (STATE AWARE)
// -----------------------------------------------------
function constrainToTerminal(v) {

  if (v.state === VESICLE_STATE.LOADED) return;

  // Soft forward band clamp
  if (v.x < LOAD_MIN_X) v.x += (LOAD_MIN_X - v.x) * 0.15;
  if (v.x > LOAD_MAX_X) v.x += (LOAD_MAX_X - v.x) * 0.12;

  // Capsule interior
  const dx = v.x - CENTER_X;
  const dy = v.y - CENTER_Y;
  const d  = sqrt(dx*dx + dy*dy);

  const maxR = RADIUS - V_RADIUS - 2;
  if (d > maxR) {
    const s = maxR / d;
    v.x = CENTER_X + dx * s;
    v.y = CENTER_Y + dy * s;
  }
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (FORWARD CYTOSOL)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  const a = random(TWO_PI);
  const r = random(RADIUS * 0.25, RADIUS * 0.55);

  synapseVesicles.push({
    x: random(LOAD_MIN_X, LOAD_MAX_X),
    y: CENTER_Y + sin(a) * r * 0.6,

    dockOffsetY: random(-20, 20),

    state: VESICLE_STATE.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// PRIMING PARTICLES — ATP + H+
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  const a = random(TWO_PI);
  const d = 38;

  // ---------------- H+ PUMPING ----------------
  synapseH.push({
    x: v.x + cos(a) * d,
    y: v.y + sin(a) * d,

    angle: a + PI,
    radius: d,

    target: v,
    life: 120
  });

  // ---------------- ATP ----------------
  synapseATP.push({
    x: v.x + cos(a + PI) * (d + 10),
    y: v.y + sin(a + PI) * (d + 10),

    vx: -cos(a) * 0.35,
    vy: -sin(a) * 0.35,

    state: "ATP",
    alpha: 255,
    life: 200
  });
}

// -----------------------------------------------------
// UPDATE VESICLE LOADING
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < MAX_VESICLES) {
    spawnSynapseEmptyVesicle();
  }

  // One vesicle loads at a time
  if (!loaderActive) {
    const v = synapseVesicles[loaderIndex % synapseVesicles.length];

    if (v.state === VESICLE_STATE.EMPTY) {
      v.state = VESICLE_STATE.PRIMING;
      v.timer = 0;
      loaderActive = true;
      spawnPrimingParticles(v);
    }
    loaderIndex++;
  }

  for (const v of synapseVesicles) {

    // ---------- PRIMING ----------
    if (v.state === VESICLE_STATE.PRIMING) {
      if (++v.timer > 120) {
        v.state = VESICLE_STATE.LOADING;
        v.timer = 0;
        v.nts.length = 0;
      }
    }

    // ---------- LOADING ----------
    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < 18 && frameCount % 9 === 0) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.22, 0.22),
          vy: random(-0.22, 0.22)
        });
      }

      if (v.nts.length >= 18) {
        v.state = VESICLE_STATE.LOADED;
        loaderActive = false;
      }
    }

    // NT Brownian motion
    for (const p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;
      if (sqrt(p.x*p.x + p.y*p.y) > V_RADIUS - 3) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    constrainToTerminal(v);
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE PRIMING PARTICLES
// -----------------------------------------------------
function updatePrimingParticles() {

  // ---------------- H+ ----------------
  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];

    h.angle += 0.18;
    h.radius *= 0.96;

    h.x = h.target.x + cos(h.angle) * h.radius;
    h.y = h.target.y + sin(h.angle) * h.radius;

    h.life--;

    if (h.life < 40 || h.radius < V_RADIUS * 0.8) {
      synapseH.splice(i, 1);
    }
  }

  // ---------------- ATP ----------------
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];

    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      for (const v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < V_RADIUS) {
          a.state = "ADP";
          a.vx *= -0.25;
          a.vy *= -0.25;
        }
      }
    } else {
      a.alpha -= 1.2;
    }

    a.life--;
    if (a.life <= 0 || a.alpha <= 0) {
      synapseATP.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawSynapseVesicles() {
  push();
  strokeWeight(V_STROKE);

  for (const v of synapseVesicles) {
    stroke(vesicleBorder());
    fill(vesicleFill());
    ellipse(v.x, v.y, V_RADIUS * 2);

    noStroke();
    fill(ntColor());
    for (const p of v.nts) {
      circle(v.x + p.x, v.y + p.y, 3);
    }
  }

  // H+
  fill(255, 90, 90);
  textSize(12);
  for (const h of synapseH) {
    text("H⁺", h.x - 4, h.y + 4);
  }

  // ATP / ADP
  textSize(10);
  for (const a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
