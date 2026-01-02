console.log("🫧 vesicleLoading loaded");

// =====================================================
// SYNAPTIC VESICLE LOADING — CHEMISTRY ONLY
// -----------------------------------------------------
// RESPONSIBILITIES:
// ✔ EMPTY → PRIMING → PRIMED → LOADING → LOADED
// ✔ H⁺ priming (acidification)
// ✔ ATP collision → ADP + Pi
// ✔ Neurotransmitter accumulation
// ✔ Strictly ONE vesicle loads at a time
//
// NON-RESPONSIBILITIES:
// ✘ Vesicle motion
// ✘ Vesicle collisions
// ✘ Membrane / stop-plane enforcement
// ✘ Rendering
// =====================================================


// -----------------------------------------------------
// REQUIRED GLOBALS (READ-ONLY / SHARED)
// -----------------------------------------------------
// window.synapseVesicles  → vesicle objects (with x,y set elsewhere)
//
// window.synapseH        → array (created here)
// window.synapseATP      → array (created here)
//
// window.SYNAPSE_VESICLE_RADIUS
// -----------------------------------------------------


// -----------------------------------------------------
// GLOBAL CHEMISTRY STORAGE
// -----------------------------------------------------
window.synapseH   = window.synapseH   || [];
window.synapseATP = window.synapseATP || [];


// -----------------------------------------------------
// STATE DEFINITIONS
// -----------------------------------------------------
const VESICLE_STATE = {
  EMPTY:   "empty",
  PRIMING:"priming",
  PRIMED: "primed",
  LOADING:"loading",
  LOADED: "loaded"
};


// -----------------------------------------------------
// CHEMISTRY PARAMETERS (INTENTIONAL & VISIBLE)
// -----------------------------------------------------
const H_SPEED   = window.SYNAPSE_H_SPEED;
const H_LIFE    = window.SYNAPSE_H_LIFE;

const ATP_SPEED = window.SYNAPSE_ATP_SPEED;
const ATP_LIFE  = window.SYNAPSE_ATP_LIFE;
const ATP_BOUNCE= window.SYNAPSE_ATP_BOUNCE;

const NT_TARGET = window.SYNAPSE_NT_TARGET;
const NT_RATE   = window.SYNAPSE_NT_PACK_RATE;

const PRIMED_DWELL_FRAMES = 60;   // visible pause after priming


// -----------------------------------------------------
// SERIAL LOADING GATE (ABSOLUTE)
// -----------------------------------------------------
function hasActiveLoadingVesicle() {
  return window.synapseVesicles.some(v =>
    v.state === VESICLE_STATE.PRIMING ||
    v.state === VESICLE_STATE.PRIMED  ||
    v.state === VESICLE_STATE.LOADING
  );
}


// -----------------------------------------------------
// SPAWN PRIMING PARTICLES FOR ONE VESICLE
// -----------------------------------------------------
function spawnPrimingParticles(v) {

  const a1 = random(TWO_PI);
  window.synapseH.push({
    x: v.x + cos(a1) * 48,
    y: v.y + sin(a1) * 48,
    vx: -cos(a1) * H_SPEED,
    vy: -sin(a1) * H_SPEED,
    target: v,
    life: H_LIFE
  });

  const a2 = random(TWO_PI);
  window.synapseATP.push({
    x: v.x + cos(a2) * 54,
    y: v.y + sin(a2) * 54,
    vx: -cos(a2) * ATP_SPEED,
    vy: -sin(a2) * ATP_SPEED,
    state: "ATP",
    alpha: 255,
    target: v,
    life: ATP_LIFE
  });
}


// -----------------------------------------------------
// MAIN UPDATE — CHEMISTRY & STATES
// -----------------------------------------------------
function updateVesicleLoading() {

  const vesicles = window.synapseVesicles;
  if (!vesicles || vesicles.length === 0) return;

  // ---------------------------------------------------
  // START NEW LOADING (ONLY IF NONE ACTIVE)
  // ---------------------------------------------------
  if (!hasActiveLoadingVesicle()) {
    const next = vesicles.find(v => v.state === VESICLE_STATE.EMPTY);
    if (next) {
      next.state = VESICLE_STATE.PRIMING;
      next.primedH = false;
      next.primedATP = false;
      next.primedTimer = 0;
      next.nts = [];
      spawnPrimingParticles(next);
    }
  }

  // ---------------------------------------------------
  // UPDATE EACH VESICLE STATE (NO MOTION)
  // ---------------------------------------------------
  for (const v of vesicles) {

    // ---------- PRIMING → PRIMED ----------
    if (
      v.state === VESICLE_STATE.PRIMING &&
      v.primedH && v.primedATP
    ) {
      v.state = VESICLE_STATE.PRIMED;
      v.primedTimer = 0;
    }

    // ---------- PRIMED DWELL ----------
    if (v.state === VESICLE_STATE.PRIMED) {
      v.primedTimer++;
      if (v.primedTimer >= PRIMED_DWELL_FRAMES) {
        v.state = VESICLE_STATE.LOADING;
        v.nts = [];
      }
    }

    // ---------- LOADING ----------
    if (v.state === VESICLE_STATE.LOADING) {

      if (v.nts.length < NT_TARGET && frameCount % 6 === 0) {
        v.nts.push({
          x: random(-3, 3),
          y: random(-3, 3),
          vx: random(-0.18, 0.18),
          vy: random(-0.18, 0.18)
        });
      }

      if (v.nts.length >= NT_TARGET) {
        v.state = VESICLE_STATE.LOADED;
      }
    }

    // ---------- NT INTERNAL MOTION ----------
    if (v.nts && v.nts.length > 0) {
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
// UPDATE PRIMING PARTICLES (H⁺, ATP)
// -----------------------------------------------------
function updatePrimingParticles() {

  const r = window.SYNAPSE_VESICLE_RADIUS;

  // ---------------- H⁺ ----------------
  for (let i = window.synapseH.length - 1; i >= 0; i--) {
    const h = window.synapseH[i];

    h.x += h.vx;
    h.y += h.vy;
    h.life--;

    if (dist(h.x, h.y, h.target.x, h.target.y) < r * 0.85) {
      h.target.primedH = true;
      window.synapseH.splice(i, 1);
      continue;
    }

    if (h.life <= 0) {
      window.synapseH.splice(i, 1);
    }
  }

  // ---------------- ATP ----------------
  for (let i = window.synapseATP.length - 1; i >= 0; i--) {
    const a = window.synapseATP[i];

    a.x += a.vx;
    a.y += a.vy;
    a.life--;

    if (a.state === "ATP") {
      if (dist(a.x, a.y, a.target.x, a.target.y) < r) {
        a.state = "ADP";
        a.target.primedATP = true;
        a.vx *= -ATP_BOUNCE;
        a.vy *= -ATP_BOUNCE;
      }
    } else {
      a.alpha -= 0.8;
    }

    if (a.life <= 0 || a.alpha <= 0) {
      window.synapseATP.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// PUBLIC EXPORT
// -----------------------------------------------------
window.updateVesicleLoading = updateVesicleLoading;
