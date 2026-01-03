console.log("🫧 vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING — CHEMISTRY ONLY
// =====================================================

// -----------------------------------------------------
// GLOBAL CHEMISTRY STORAGE
// -----------------------------------------------------
window.synapseH   = window.synapseH   || [];
window.synapseATP = window.synapseATP || [];

// -----------------------------------------------------
// STATE DEFINITIONS
// -----------------------------------------------------
const VESICLE_STATE = {
  EMPTY:         "empty",
  PRIMING:       "priming",
  PRIMED:        "primed",
  LOADING:       "loading",
  LOADED_TRAVEL: "loaded_travel",
  LOADED:        "loaded"
};

// -----------------------------------------------------
// CHEMISTRY PARAMETERS
// -----------------------------------------------------
const H_SPEED    = window.SYNAPSE_H_SPEED;
const H_LIFE     = window.SYNAPSE_H_LIFE;

const ATP_SPEED  = window.SYNAPSE_ATP_SPEED;
const ATP_LIFE   = window.SYNAPSE_ATP_LIFE;
const ATP_BOUNCE = window.SYNAPSE_ATP_BOUNCE;

const NT_TARGET  = window.SYNAPSE_NT_TARGET;
const NT_RATE    = window.SYNAPSE_NT_PACK_RATE;

// -----------------------------------------------------
// CHEMOTACTIC HOMING (NEW)
// -----------------------------------------------------
const CHEMO_HOMING   = 0.06;
const CHEMO_DAMPING = 0.92;
const CHEMO_MAX_V   = 1.2;

// -----------------------------------------------------
// SERIAL LOADING GATE
// -----------------------------------------------------
function hasActiveLoadingVesicle() {
  return window.synapseVesicles.some(v =>
    v.state === VESICLE_STATE.PRIMING ||
    v.state === VESICLE_STATE.PRIMED  ||
    v.state === VESICLE_STATE.LOADING
  );
}

// -----------------------------------------------------
// SPAWN PRIMING PARTICLES (RADIAL ENTRY)
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  const a1 = random(TWO_PI);
  window.synapseH.push({
    x: v.x + cos(a1) * 32,
    y: v.y + sin(a1) * 32,
    vx: -cos(a1) * H_SPEED,
    vy: -sin(a1) * H_SPEED,
    target: v,
    life: H_LIFE
  });

  const a2 = random(TWO_PI);
  window.synapseATP.push({
    x: v.x + cos(a2) * 38,
    y: v.y + sin(a2) * 38,
    vx: -cos(a2) * ATP_SPEED,
    vy: -sin(a2) * ATP_SPEED,
    state: "ATP",
    alpha: 255,
    target: v,
    life: ATP_LIFE
  });
}

// -----------------------------------------------------
// MAIN UPDATE
// -----------------------------------------------------
function updateVesicleLoading() {

  const vesicles = window.synapseVesicles;
  if (!vesicles || vesicles.length === 0) return;

  if (!hasActiveLoadingVesicle()) {
    const next = vesicles.find(v => v.state === VESICLE_STATE.EMPTY);
    if (next) {
      next.state = VESICLE_STATE.PRIMING;
      next.primedH = false;
      next.primedATP = false;
      next.nts = [];
      spawnPrimingParticles(next);
    }
  }

  for (const v of vesicles) {

    if (v.state === VESICLE_STATE.PRIMING && v.primedH && v.primedATP) {
      v.state = VESICLE_STATE.PRIMED;
    }

    if (v.state === VESICLE_STATE.PRIMED) {
      v.state = VESICLE_STATE.LOADING;
      v.nts = [];
    }

    if (v.state === VESICLE_STATE.LOADING) {
      if (v.nts.length < NT_TARGET && random() < NT_RATE) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.18, 0.18),
          vy: random(-0.18, 0.18)
        });
      }
      if (v.nts.length >= NT_TARGET) {
        v.state = VESICLE_STATE.LOADED_TRAVEL;
      }
    }

    if (v.nts) {
      for (const p of v.nts) {
        p.x += p.vx;
        p.y += p.vy;
        if (sqrt(p.x*p.x + p.y*p.y) > window.SYNAPSE_VESICLE_RADIUS - 3) {
          p.vx *= -1;
          p.vy *= -1;
        }
      }
    }
  }

  updatePrimingParticles();
}

// -----------------------------------------------------
// UPDATE PRIMING PARTICLES (H⁺ + ATP HOMING)
// -----------------------------------------------------
function applyHoming(p, target) {

  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const d  = Math.hypot(dx, dy) || 1;

  p.vx += (dx / d) * CHEMO_HOMING;
  p.vy += (dy / d) * CHEMO_HOMING;

  p.vx *= CHEMO_DAMPING;
  p.vy *= CHEMO_DAMPING;

  const speed = Math.hypot(p.vx, p.vy);
  if (speed > CHEMO_MAX_V) {
    p.vx *= CHEMO_MAX_V / speed;
    p.vy *= CHEMO_MAX_V / speed;
  }
}

function updatePrimingParticles() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  // -------- H⁺ --------
  for (let i = window.synapseH.length - 1; i >= 0; i--) {
    const h = window.synapseH[i];
    applyHoming(h, h.target);
    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (dist(h.x, h.y, h.target.x, h.target.y) < r * 0.85) {
      h.target.primedH = true;
      window.synapseH.splice(i, 1);
    } else if (h.life <= 0) {
      window.synapseH.splice(i, 1);
    }
  }

  // -------- ATP --------
  for (let i = window.synapseATP.length - 1; i >= 0; i--) {
    const a = window.synapseATP[i];
    applyHoming(a, a.target);
    a.x += a.vx;
    a.y += a.vy;
    a.life--;

    if (a.state === "ATP" && dist(a.x, a.y, a.target.x, a.target.y) < r) {
      a.state = "ADP";
      a.target.primedATP = true;
      a.vx *= -ATP_BOUNCE;
      a.vy *= -ATP_BOUNCE;
    } else {
      a.alpha -= 0.8;
    }

    if (a.life <= 0 || a.alpha <= 0) {
      window.synapseATP.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
window.updateVesicleLoading = updateVesicleLoading;
