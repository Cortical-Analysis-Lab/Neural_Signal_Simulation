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
// AUTHORITATIVE GEOMETRY (GLOBAL)
// -----------------------------------------------------
const CX = window.SYNAPSE_TERMINAL_CENTER_X;
const CY = window.SYNAPSE_TERMINAL_CENTER_Y;
const R  = window.SYNAPSE_TERMINAL_RADIUS;

const STOP_X = window.SYNAPSE_VESICLE_STOP_X;

const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;
const V_STROKE = window.SYNAPSE_VESICLE_STROKE;
const MAX_VES  = window.SYNAPSE_MAX_VESICLES;

// -----------------------------------------------------
// AUTHORITATIVE LOADING PHYSIOLOGY (GLOBAL)
// -----------------------------------------------------
const LOAD_MIN_X = STOP_X + window.SYNAPSE_LOAD_MIN_OFFSET;
const LOAD_MAX_X = STOP_X + window.SYNAPSE_LOAD_MAX_OFFSET;

const Y_SPREAD   = window.SYNAPSE_VESICLE_Y_SPREAD;

const H_SPEED    = window.SYNAPSE_H_SPEED;
const H_LIFE     = window.SYNAPSE_H_LIFE;

const ATP_SPEED  = window.SYNAPSE_ATP_SPEED;
const ATP_LIFE   = window.SYNAPSE_ATP_LIFE;
const ATP_BOUNCE = window.SYNAPSE_ATP_BOUNCE;

const NT_TARGET  = window.SYNAPSE_NT_TARGET;
const NT_RATE    = window.SYNAPSE_NT_PACK_RATE;

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
// GEOMETRY CONSTRAINT (AUTHORITATIVE CAPSULE)
// -----------------------------------------------------
function constrainToTerminal(v) {

  if (v.state === VESICLE_STATE.LOADED) return;

  if (v.x < LOAD_MIN_X) v.x += (LOAD_MIN_X - v.x) * 0.08;
  if (v.x > LOAD_MAX_X) v.x += (LOAD_MAX_X - v.x) * 0.06;

  const dx = v.x - CX;
  const dy = v.y - CY;
  const d  = sqrt(dx*dx + dy*dy);

  const maxR = R - V_RADIUS - 2;
  if (d > maxR) {
    const s = maxR / d;
    v.x = CX + dx * s;
    v.y = CY + dy * s;
  }
}

// -----------------------------------------------------
// SOFT VESICLE–VESICLE REPULSION
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
// SPAWN EMPTY VESICLE (VOLUMETRIC, NOT LINEAR)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  const a = random(TWO_PI);
  const r = random(R * 0.25, R * 0.6);

  synapseVesicles.push({
    x: random(LOAD_MIN_X, LOAD_MAX_X),
    y: CY + sin(a) * r * Y_SPREAD,
    state: VESICLE_STATE.EMPTY,
    primedH: false,
    primedATP: false,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN PRIMING PARTICLES (H+ + ATP CONCURRENT)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  const a1 = random(TWO_PI);
  synapseH.push({
    x: v.x + cos(a1) * 50,
    y: v.y + sin(a1) * 50,
    vx: -cos(a1) * H_SPEED,
    vy: -sin(a1) * H_SPEED,
    target: v,
    life: H_LIFE
  });

  const a2 = random(TWO_PI);
  synapseATP.push({
    x: v.x + cos(a2) * 56,
    y: v.y + sin(a2) * 56,
    vx: -cos(a2) * ATP_SPEED,
    vy: -sin(a2) * ATP_SPEED,
    state: "ATP",
    alpha: 255,
    target: v,
    life: ATP_LIFE
  });
}

// -----------------------------------------------------
// UPDATE VESICLE LOADING
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < MAX_VES) {
    spawnSynapseEmptyVesicle();
  }

  for (const v of synapseVesicles) {

    if (v.state === VESICLE_STATE.EMPTY) {
      v.state = VESICLE_STATE.PRIMING;
      v.primedH = false;
      v.primedATP = false;
      spawnPrimingParticles(v);
    }

    if (
      v.state === VESICLE_STATE.PRIMING &&
      v.primedH &&
      v.primedATP
    ) {
      v.state = VESICLE_STATE.LOADING;
      v.nts.length = 0;
    }

    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < NT_TARGET && random() < NT_RATE) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.22, 0.22),
          vy: random(-0.22, 0.22)
        });
      }

      if (v.nts.length >= NT_TARGET) {
        v.state = VESICLE_STATE.LOADED;
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
        a.vx *= -ATP_BOUNCE;
        a.vy *= -ATP_BOUNCE;
      }
    } else {
      a.alpha -= 1.0;
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
