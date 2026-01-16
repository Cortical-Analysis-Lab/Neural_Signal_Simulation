console.log("🫧 synapticBurst loaded — DIFFUSIVE CLEFT MODEL (SPILLING)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — DIFFUSION DOMINATED
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Diffusion-first (not ballistic)
// ✔ Dense, wide cleft filling
// ✔ Soft confinement to synaptic gap
// ✔ Sustained spill after fusion
//
// CONTRACT (UNCHANGED):
// • Presynaptic LOCAL space only
// • membraneX provided per release
// • No geometry lookups here
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// TUNING — DIFFUSION FIRST (SPILLING)
// -----------------------------------------------------
const NT_BASE_COUNT = 22;          // ↑ more initial NTs

const NT_INITIAL_JITTER = 0.10;    // slightly more randomness
const NT_DIFFUSION     = 0.24;     // dominant motion
const NT_DRAG          = 0.90;     // less damping → wider spread

const NT_OUTWARD_BIAS  = 0.008;    // gentle push into cleft

const NT_LIFE_MIN = 220;           // live longer
const NT_LIFE_MAX = 360;

const NT_RADIUS = 2.4;

// Cleft bounds (teaching-friendly)
const CLEFT_DEPTH  = 200;          // allow deeper penetration
const CLEFT_HEIGHT = 180;          // fill entire gap


// -----------------------------------------------------
// OPTIONAL: TEMPORAL SPILL (POST-FUSION DRIBBLE)
// -----------------------------------------------------
const NT_TRICKLE_PROB = 0.08;       // per-frame, per-release-site
const NT_TRICKLE_JITTER = 0.12;


// -----------------------------------------------------
// DEBUG
// -----------------------------------------------------
const DEBUG_NT = false;


// -----------------------------------------------------
// EVENT — VESICLE-AUTHORITATIVE RELEASE
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const {
    x,
    y,
    membraneX,
    strength = 1
  } = e.detail || {};

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(membraneX)
  ) {
    console.warn("❌ NT release rejected — missing membraneX", e.detail);
    return;
  }

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  if (DEBUG_NT) {
    console.log("🫧 NT burst @", x.toFixed(1), y.toFixed(1));
  }

  for (let i = 0; i < count; i++) {
    window.synapticNTs.push(makeNT(x, y, membraneX));
  }

  // 🔑 Store release site for trickle spill
  window.lastSynapticRelease = {
    x, y, membraneX,
    life: 40   // frames of slow spill
  };
});


// -----------------------------------------------------
// NT FACTORY
// -----------------------------------------------------
function makeNT(x, y, membraneX) {
  return {
    x: x + random(-2.0, 2.0),
    y: y + random(-4.0, 4.0),

    vx: random(-NT_INITIAL_JITTER, NT_INITIAL_JITTER),
    vy: random(-NT_INITIAL_JITTER, NT_INITIAL_JITTER),

    membraneX,
    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE — DIFFUSION DOMINATED + SPILL
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts.length && !window.lastSynapticRelease) return;

  // -----------------------------------------------
  // SECONDARY SPILL (slow post-fusion release)
  // -----------------------------------------------
  const r = window.lastSynapticRelease;
  if (r && r.life-- > 0 && random() < NT_TRICKLE_PROB) {
    nts.push(
      makeNT(
        r.x + random(-1, 1),
        r.y + random(-2, 2),
        r.membraneX
      )
    );
  }
  if (r && r.life <= 0) {
    window.lastSynapticRelease = null;
  }

  // -----------------------------------------------
  // MAIN NT UPDATE LOOP
  // -----------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Brownian diffusion
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // Gentle outward bias
    if (p.x > p.membraneX) {
      p.vx += NT_OUTWARD_BIAS;
    }

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    p.x += p.vx;
    p.y += p.vy;

    // -----------------------------------------------
    // HARD EXCLUSION — presynaptic membrane
    // -----------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = Math.abs(p.vx) * 0.25;
    }

    // -----------------------------------------------
    // SOFT CLEFT CONFINEMENT (Y)
    // -----------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.vy *= -0.3;
      p.y = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
    }

    // -----------------------------------------------
    // FADE OUT DEEP IN CLEFT
    // -----------------------------------------------
    if (p.x - p.membraneX > CLEFT_DEPTH) {
      p.alpha -= 1.4;
    }

    // Lifetime decay
    p.alpha -= 0.9;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — DENSE, ADDITIVE CLOUD
// -----------------------------------------------------
function drawSynapticBurst() {

  if (!window.synapticNTs.length) return;

  push();
  noStroke();
  blendMode(ADD);

  for (const p of window.synapticNTs) {
    fill(185, 120, 255, p.alpha);
    circle(p.x, p.y, NT_RADIUS);
  }

  blendMode(BLEND);
  pop();
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateSynapticBurst = updateSynapticBurst;
window.drawSynapticBurst   = drawSynapticBurst;
