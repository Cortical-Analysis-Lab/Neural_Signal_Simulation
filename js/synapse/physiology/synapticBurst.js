console.log("🫧 synapticBurst loaded — DIFFUSIVE CLEFT MODEL (AUTHORITATIVE)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — DIFFUSION DOMINATED
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Diffusion-first (not ballistic)
// ✔ Sparse, wide cleft filling
// ✔ Soft confinement to synaptic gap
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
// TUNING — DIFFUSION FIRST
// -----------------------------------------------------
const NT_BASE_COUNT = 14;

const NT_INITIAL_JITTER = 0.06;   // tiny launch noise
const NT_DIFFUSION     = 0.18;   // dominant motion
const NT_DRAG          = 0.88;

const NT_OUTWARD_BIAS  = 0.006;  // gentle cleft push

const NT_LIFE_MIN = 160;
const NT_LIFE_MAX = 260;

const NT_RADIUS = 2.6;

// Cleft bounds (teaching-friendly, not hard geometry)
const CLEFT_DEPTH  = 140;
const CLEFT_HEIGHT = 120;


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

    window.synapticNTs.push({
      x: x + random(-1.2, 1.2),
      y: y + random(-2.0, 2.0),

      // near-zero initial motion
      vx: random(-NT_INITIAL_JITTER, NT_INITIAL_JITTER),
      vy: random(-NT_INITIAL_JITTER, NT_INITIAL_JITTER),

      membraneX,
      life: random(NT_LIFE_MIN, NT_LIFE_MAX),
      alpha: 255
    });
  }
});


// -----------------------------------------------------
// UPDATE — DIFFUSION DOMINATED
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts.length) return;

  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // -----------------------------------------------
    // Brownian diffusion (dominant)
    // -----------------------------------------------
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // Gentle outward bias (membrane → cleft)
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
      p.vx = Math.abs(p.vx) * 0.3;
    }

    // -----------------------------------------------
    // SOFT CLEFT CONFINEMENT (Y)
    // -----------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.vy *= -0.4;
      p.y = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
    }

    // -----------------------------------------------
    // FADE OUT DEEP IN CLEFT
    // -----------------------------------------------
    if (p.x - p.membraneX > CLEFT_DEPTH) {
      p.alpha -= 2.0;
    }

    // Lifetime decay
    p.alpha -= 1.2;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — SPARSE, ADDITIVE CLOUD
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
