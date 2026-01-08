console.log("🫧 synapticBurst loaded — PRESYNAPTIC LOCAL (AUTHORITATIVE)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST SYSTEM (LOCAL SPACE)
// =====================================================
//
// COORDINATE CONTRACT:
// • Presynaptic LOCAL space
// • +X → toward synaptic cleft
// • Drawn INSIDE drawPreSynapse()
// • Inherits rotate(PI) implicitly via parent draw
// • NO rotation compensation here
//
// BIOLOGICAL MODEL:
// ✔ Fan-shaped diffusion into cleft
// ✔ Biased AWAY from presynaptic membrane
// ✔ Distributed fusion pore origin
// ✔ Diffusion-dominated (no jetting)
// ✔ No clumping / no overlap artifacts
// ✔ Confined near membrane plane
//
// =====================================================


// -----------------------------------------------------
// STORAGE (GLOBAL, RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// TUNING PARAMETERS (BIOLOGICAL SCALE)
// -----------------------------------------------------
const NT_BASE_COUNT = 18;

const NT_ARC_WIDTH = Math.PI * 0.55;   // ~100° fan
const NT_SPEED_MIN = 0.25;
const NT_SPEED_MAX = 0.85;

const NT_DIFFUSION = 0.07;
const NT_DRAG      = 0.968;

const NT_LIFE_MIN  = 90;
const NT_LIFE_MAX  = 150;

const NT_RADIUS    = 3;

// Visual-only cleft depth (+X direction)
const CLEFT_LIMIT = 120;


// -----------------------------------------------------
// EVENT LISTENER — LOCAL PRESYNAPTIC RELEASE
// -----------------------------------------------------
//
// Expected event detail (LOCAL SPACE):
// {
//   x, y,                 // fusion pore (local)
//   normalX: -1 | +1      // membrane normal (local)
//   spread:   0–1
//   strength: 0–1
// }
//
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const {
    x,
    y,
    normalX  = -1,
    spread   = 1,
    strength = 1
  } = e.detail || {};

  if (!Number.isFinite(x) || !Number.isFinite(y)) return;

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  // ---------------------------------------------------
  // LOCAL release direction
  //
  // Convention:
  // • +X → synaptic cleft
  // • normalX < 0 → release toward +X
  // ---------------------------------------------------
  const baseAngle = normalX < 0 ? 0 : Math.PI;

  for (let i = 0; i < count; i++) {

    const theta =
      baseAngle +
      random(-NT_ARC_WIDTH, NT_ARC_WIDTH) * spread;

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    // Fusion pore jitter (local)
    const ox = x + random(-2.5, 2.5);
    const oy = y + random(-3.5, 3.5);

    window.synapticNTs.push({
      x: ox,
      y: oy,

      vx: Math.cos(theta) * speed,
      vy: Math.sin(theta) * speed,

      life: random(NT_LIFE_MIN, NT_LIFE_MAX),
      alpha: 255
    });
  }
});


// -----------------------------------------------------
// UPDATE — DIFFUSION DOMINATED (LOCAL SPACE)
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts || nts.length === 0) return;

  // 🔴 Single authoritative membrane plane (LOCAL)
  const MEMBRANE_X = window.SYNAPSE_VESICLE_STOP_X;
  if (!Number.isFinite(MEMBRANE_X)) return;

  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // -------------------------------------------------
    // Brownian diffusion (dominant)
    // -------------------------------------------------
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // Integrate
    p.x += p.vx;
    p.y += p.vy;

    // Drag (cleft viscosity)
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // -------------------------------------------------
    // HARD EXCLUSION — NTs must NOT re-enter presynapse
    //
    // Presynaptic local space:
    // • membrane sits at MEMBRANE_X
    // • presynapse is x < MEMBRANE_X
    // • cleft is x > MEMBRANE_X
    // -------------------------------------------------
    if (p.x < MEMBRANE_X + 2) {
      p.x  = MEMBRANE_X + 2;
      p.vx = Math.abs(p.vx) * 0.25;
    }

    // -------------------------------------------------
    // Soft fade deep into cleft
    // -------------------------------------------------
    if (Math.abs(p.x - MEMBRANE_X) > CLEFT_LIMIT) {
      p.alpha -= 3.0;
    }

    // Lifetime decay
    p.alpha -= 1.6;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — LOCAL SPACE (NO TRANSFORMS)
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
