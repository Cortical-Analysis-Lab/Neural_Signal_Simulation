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

const DOCK_X       = window.SYNAPSE_DOCK_X;
const STOP_X       = window.SYNAPSE_VESICLE_STOP_X;

const V_RADIUS     = window.SYNAPSE_VESICLE_RADIUS;
const V_STROKE     = window.SYNAPSE_VESICLE_STROKE;
const MAX_VESICLES = window.SYNAPSE_MAX_VESICLES;

// -----------------------------------------------------
// FORWARD CYTOSOLIC LOADING BAND
// -----------------------------------------------------
const LOAD_MIN_X = STOP_X;
const LOAD_MAX_X = STOP_X + 26;

// -----------------------------------------------------
// LOADER CONTROL
// -----------------------------------------------------
let loaderActive = false;
let loaderIndex  = 0;

// -----------------------------------------------------
// STATES
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
function vesicleFill()   { return color(245, 225, 140, 40); }
function ntColor()       { return color(185, 120, 255, 210); }

// -----------------------------------------------------
// LOADING PARAMETERS
// -----------------------------------------------------
const NT_TARGET    = 18;
const NT_PACK_RATE = 0.35;

// -----------------------------------------------------
// SOFT GEOMETRY CONSTRAINT
// -----------------------------------------------------
function constrainToTerminal(v) {

  if (v.state === VESICLE_STATE.LOADED) return;

  if (v.x < LOAD_MIN_X) v.x += (LOAD_MIN_X - v.x) * 0.08;
  if (v.x > LOAD_MAX_X) v.x += (LOAD_MAX_X - v.x) * 0.06;

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
// SOFT VESICLE REPULSION
// -----------------------------------------------------
function applyVesicleRepulsion(v) {
  for (const u of synapseVesicles) {
    if (u === v) continue;

    const dx = v.x - u.x;
    const dy = v.y - u.y;
    const d  = sqrt(dx*dx + dy*dy);
    const minD = V_RADIUS * 2.2;

    if (d > 0 && d < minD) {
      const push = (minD - d) * 0.015;
      v.x += (dx / d) * push;
      v.y += (dy / d) * push;
    }
  }
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  const a = random(TWO_PI);
  const r = random(RADIUS * 0.25, RADIUS * 0.55);

  synapseVesicles.push({
    x: random(LOAD_MIN_X, LOAD_MAX_X),
    y: CENTER_Y + sin(a) * r * 0.6,
    state: VESICLE_STATE.EMPTY,
    primedH: false,
    primedATP: false,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN PRIMING PARTICLES (CONCURRENT)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  // ---------- H+ ----------
  const a1 = random(TWO_PI);
  synapseH.push({
    x: v.x + cos(a1) * 46,
    y: v.y + sin(a1) * 46,
    vx: -cos(a1) * 0.35,
    vy: -sin(a1) * 0.35,
    target: v,
    life: 120
  });

  // ---------- ATP ----------
  const a2 = random(TWO_PI);
  synapseATP.push({
    x: v.x + cos(a2) * 52,
    y: v.y + sin(a2) * 52,
    vx: -cos(a2) * 0.42,
    vy: -sin(a2) * 0.42,
    state: "ATP",
    alpha: 255,
    target: v,
    life: 160
  });
}

// -----------------------------------------------------
// UPDATE VESICLE LOADING
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < MAX_VESICLES) {
    spawnSynapseEmptyVesicle();
  }

  if (!loaderActive) {
    const v = synapseVesicles[loaderIndex % synapseVesicles.length];
    if (v.state === VESICLE_STATE.EMPTY) {
      v.state = VESICLE_STATE.PRIMING;
      v.primedH = false;
      v.primedATP = false;
      loaderActive = true;
      spawnPrimingParticles(v);
    }
    loaderIndex++;
  }

  for (const v of synapseVesicles) {

    // ---------------- PRIMING COMPLETE? ----------------
    if (
      v.state === VESICLE_STATE.PRIMING &&
      v.primedH &&
      v.primedATP
    ) {
      v.state = VESICLE_STATE.LOADING;
      v.nts.length = 0;
    }

    // ---------------- LOADING ----------------
    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < NT_TARGET && random() < NT_PACK_RATE) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.22, 0.22),
          vy: random(-0.22, 0.22)
        });
      }

      if (v.nts.length >= NT_TARGET) {
        v.state = VESICLE_STATE.LOADED;
        loaderActive = false;
      }
    }

    for (const p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;
      if (sqrt(p.x*p.x + p.y*p.y) > V_RADIUS - 3) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    applyVesicleRepulsion(v);
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
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (dist(h.x, h.y, h.target.x, h.target.y) < V_RADIUS * 0.85) {
      h.target.primedH = true;
      synapseH.splice(i, 1);
      continue;
    }

    if (h.life <= 0) synapseH.splice(i, 1);
  }

  // ---------------- ATP ----------------
  for (let i = synapseATP.length - 1; i >= 0; i--) {
    const a = synapseATP[i];
    a.x += a.vx;
    a.y += a.vy;

    if (a.state === "ATP") {
      if (dist(a.x, a.y, a.target.x, a.target.y) < V_RADIUS) {
        a.state = "ADP";
        a.target.primedATP = true;
        a.vx *= -0.45;
        a.vy *= -0.45;
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

  // ATP / ADP + Pi
  textSize(10);
  for (const a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
