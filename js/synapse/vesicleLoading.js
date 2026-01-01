console.log("🫧 synapse/vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING SYSTEM
// (PRESYNAPTIC LOCAL SPACE — USES synapseConstants.js)
// =====================================================

// -----------------------------------------------------
// STORAGE (GLOBAL, SHARED)
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
const synapseVesicles = window.synapseVesicles;

let synapseH   = [];
let synapseATP = [];

// -----------------------------------------------------
// SHORT ALIASES → GLOBAL CONSTANTS
// -----------------------------------------------------
const MEMBRANE_X   = window.SYNAPSE_MEMBRANE_X;
const CENTER_X     = window.SYNAPSE_TERMINAL_CENTER_X;
const CENTER_Y     = window.SYNAPSE_TERMINAL_CENTER_Y;
const RADIUS       = window.SYNAPSE_TERMINAL_RADIUS;
const BACK_OFFSET  = window.SYNAPSE_BACK_OFFSET_X;

const V_RADIUS     = window.SYNAPSE_VESICLE_RADIUS;
const V_STROKE     = window.SYNAPSE_VESICLE_STROKE;
const MAX_VESICLES = window.SYNAPSE_MAX_VESICLES;

// Vesicles may approach membrane but never cross it
const MIN_VESICLE_X = MEMBRANE_X + V_RADIUS + 1;

// -----------------------------------------------------
// CONTROL
// -----------------------------------------------------
let loaderActive = false;
let loaderIndex  = 0;

// -----------------------------------------------------
// STATES (AUTHORITATIVE — LOADING ONLY)
// -----------------------------------------------------
const VESICLE_STATE = {
  EMPTY:   "empty",
  PRIMING:"priming",
  LOADING:"loading",
  LOADED: "loaded"
};

// -----------------------------------------------------
// COLORS
// -----------------------------------------------------
function vesicleBorder() { return color(245, 225, 140); }
function vesicleFill()   { return color(245, 225, 140, 35); }
function ntColor()       { return color(185, 120, 255, 210); }

// -----------------------------------------------------
// HARD GEOMETRY CONSTRAINT
// Capsule interior + planar membrane
// -----------------------------------------------------
function constrainToTerminal(v) {

  // --- membrane plane ---
  if (v.x < MIN_VESICLE_X) {
    v.x = MIN_VESICLE_X;
  }

  // --- capsule boundary ---
  const dx = v.x - CENTER_X;
  const dy = v.y - CENTER_Y;
  const d  = Math.sqrt(dx*dx + dy*dy);

  const maxR = RADIUS - V_RADIUS - 1;
  if (d > maxR) {
    const s = maxR / d;
    v.x = CENTER_X + dx * s;
    v.y = CENTER_Y + dy * s;
  }
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE
// Back cytosol, but near active zone
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  const a = random(TWO_PI);
  const r = random(18, RADIUS - 22);

  synapseVesicles.push({
    x: CENTER_X + BACK_OFFSET + cos(a) * r * 0.45,
    y: CENTER_Y + sin(a) * r * 0.45,
    state: VESICLE_STATE.EMPTY,
    timer: 0,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN ATP + H+
// Omnidirectional, visually separated
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  const a = random(TWO_PI);
  const d = 30;

  // H+ → enters vesicle
  synapseH.push({
    x: v.x + cos(a) * d,
    y: v.y + sin(a) * d,
    vx: -cos(a) * 0.45,
    vy: -sin(a) * 0.45,
    target: v,
    life: 60
  });

  // ATP → bounce → ADP + Pi
  const a2 = a + random(PI / 2, PI);
  synapseATP.push({
    x: v.x + cos(a2) * (d + 6),
    y: v.y + sin(a2) * (d + 6),
    vx: -cos(a2) * 0.28,
    vy: -sin(a2) * 0.28,
    state: "ATP",
    alpha: 255,
    life: 130
  });
}

// -----------------------------------------------------
// UPDATE VESICLE LOADING
// -----------------------------------------------------
function updateSynapseVesicles() {

  // Maintain fixed vesicle pool
  while (synapseVesicles.length < MAX_VESICLES) {
    spawnSynapseEmptyVesicle();
  }

  // 🔒 One vesicle primes/loads at a time
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

    // ---------------------------
    // PRIMING
    // ---------------------------
    if (v.state === VESICLE_STATE.PRIMING) {
      if (++v.timer > 50) {
        v.state = VESICLE_STATE.LOADING;
        v.nts.length = 0;
      }
    }

    // ---------------------------
    // LOADING (NT accumulation)
    // ---------------------------
    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < 14 && frameCount % 6 === 0) {
        v.nts.push({
          x: random(-4, 4),
          y: random(-4, 4),
          vx: random(-0.28, 0.28),
          vy: random(-0.28, 0.28)
        });
      }

      if (v.nts.length >= 14) {
        v.state = VESICLE_STATE.LOADED;
        loaderActive = false;
      }
    }

    // ---------------------------
    // NT MOTION (INSIDE VESICLE)
    // ---------------------------
    for (const p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;

      if (Math.sqrt(p.x*p.x + p.y*p.y) > V_RADIUS - 3) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    constrainToTerminal(v);
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE ATP / H+
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+
  for (let i = synapseH.length - 1; i >= 0; i--) {
    const h = synapseH[i];
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (
      h.life < 30 &&
      dist(h.x, h.y, h.target.x, h.target.y) < V_RADIUS
    ) {
      synapseH.splice(i, 1);
    }
  }

  // ATP → ADP + Pi
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];
    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      for (const v of synapseVesicles) {
        if (dist(a.x, a.y, v.x, v.y) < V_RADIUS) {
          a.state = "ADP";
          a.vx *= -0.22;
          a.vy *= -0.22;
        }
      }
    } else {
      a.alpha -= 1.5; // slow fade
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

  // ATP / ADP + Pi
  textSize(10);
  for (const a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
