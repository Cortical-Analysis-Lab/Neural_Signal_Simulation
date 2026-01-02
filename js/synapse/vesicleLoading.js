console.log("🫧 synapse/vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING SYSTEM
// Presynaptic cytosol → filled vesicle
// =====================================================

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.synapseVesicles = window.synapseVesicles || [];
const synapseVesicles = window.synapseVesicles;

let synapseH   = [];
let synapseATP = [];

// -----------------------------------------------------
// AUTHORITATIVE GEOMETRY
// -----------------------------------------------------
const CX = window.SYNAPSE_TERMINAL_CENTER_X;
const CY = window.SYNAPSE_TERMINAL_CENTER_Y;
const R  = window.SYNAPSE_TERMINAL_RADIUS;

const STOP_X = window.SYNAPSE_VESICLE_STOP_X;

const V_RADIUS = window.SYNAPSE_VESICLE_RADIUS;
const V_STROKE = window.SYNAPSE_VESICLE_STROKE;
const MAX_VES  = window.SYNAPSE_MAX_VESICLES;

// -----------------------------------------------------
// AUTHORITATIVE PHYSIOLOGY
// -----------------------------------------------------

// ⬅️ LOADING BAND IS *DEEPER* IN CYTOSOL (FIXED DIRECTION)
const LOAD_MIN_X = CX + window.SYNAPSE_LOAD_MIN_OFFSET;
const LOAD_MAX_X = CX + window.SYNAPSE_LOAD_MAX_OFFSET;

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
// FIND ACTIVE VESICLE (SERIAL LOADING)
// -----------------------------------------------------
function getActiveVesicle() {
  return synapseVesicles.find(v =>
    v.state === VESICLE_STATE.PRIMING ||
    v.state === VESICLE_STATE.LOADING
  );
}

// -----------------------------------------------------
// SPAWN EMPTY VESICLE (SCATTERED, SPACED)
// -----------------------------------------------------
function spawnSynapseEmptyVesicle() {

  let x, y, safe;
  let attempts = 0;

  do {
    const a = random(TWO_PI);
    const r = random(R * 0.25, R * 0.7);

    x = random(LOAD_MIN_X, LOAD_MAX_X);
    y = CY + sin(a) * r;

    safe = true;
    for (const u of synapseVesicles) {
      if (dist(x, y, u.x, u.y) < V_RADIUS * 3.0) {
        safe = false;
        break;
      }
    }
    attempts++;
  } while (!safe && attempts < 60);

  synapseVesicles.push({
    x, y,
    vx: random(-0.04, 0.04),
    vy: random(-0.04, 0.04),
    state: VESICLE_STATE.EMPTY,
    primedH: false,
    primedATP: false,
    nts: []
  });
}

// -----------------------------------------------------
// SPAWN PRIMING PARTICLES (ONE VESICLE)
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
// VESICLE–VESICLE ELASTIC COLLISION
// -----------------------------------------------------
function resolveVesicleCollisions() {

  for (let i = 0; i < synapseVesicles.length; i++) {
    for (let j = i + 1; j < synapseVesicles.length; j++) {

      const a = synapseVesicles[i];
      const b = synapseVesicles[j];

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d  = sqrt(dx*dx + dy*dy);
      const minD = V_RADIUS * 2.1;

      if (d > 0 && d < minD) {

        const nx = dx / d;
        const ny = dy / d;

        // Separate
        const overlap = (minD - d) * 0.5;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        // Elastic bounce (very damped)
        const dvx = b.vx - a.vx;
        const dvy = b.vy - a.vy;
        const impulse = (dvx * nx + dvy * ny) * 0.6;

        a.vx += impulse * nx;
        a.vy += impulse * ny;
        b.vx -= impulse * nx;
        b.vy -= impulse * ny;
      }
    }
  }
}

// -----------------------------------------------------
// UPDATE VESICLES
// -----------------------------------------------------
function updateSynapseVesicles() {

  while (synapseVesicles.length < MAX_VES) {
    spawnSynapseEmptyVesicle();
  }

  const active = getActiveVesicle();

  if (!active) {
    const next = synapseVesicles.find(v => v.state === VESICLE_STATE.EMPTY);
    if (next) {
      next.state = VESICLE_STATE.PRIMING;
      next.primedH = false;
      next.primedATP = false;
      spawnPrimingParticles(next);
    }
  }

  // --- Brownian drift ---
  for (const v of synapseVesicles) {
    v.x += v.vx;
    v.y += v.vy;

    v.vx *= 0.985;
    v.vy *= 0.985;
  }

  resolveVesicleCollisions();

  for (const v of synapseVesicles) {

    if (
      v.state === VESICLE_STATE.PRIMING &&
      v.primedH && v.primedATP
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

    // NT motion
    for (const p of v.nts) {
      p.x += p.vx;
      p.y += p.vy;
      if (sqrt(p.x*p.x + p.y*p.y) > V_RADIUS - 3) {
        p.vx *= -1;
        p.vy *= -1;
      }
    }

    // Keep inside capsule
    const dx = v.x - CX;
    const dy = v.y - CY;
    const d  = sqrt(dx*dx + dy*dy);
    const maxR = R - V_RADIUS - 2;

    if (d > maxR) {
      const s = maxR / d;
      v.x = CX + dx * s;
      v.y = CY + dy * s;
      v.vx *= -0.4;
      v.vy *= -0.4;
    }
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE PRIMING PARTICLES
// -----------------------------------------------------
function updatePrimingParticles() {

  // H+
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

  // ATP
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

  fill(255, 90, 90);
  textSize(12);
  for (const h of synapseH) {
    text("H⁺", h.x - 4, h.y + 4);
  }

  textSize(10);
  for (const a of synapseATP) {
    fill(120, 200, 255, a.alpha);
    text(a.state === "ATP" ? "ATP" : "ADP + Pi", a.x, a.y);
  }

  pop();
}
