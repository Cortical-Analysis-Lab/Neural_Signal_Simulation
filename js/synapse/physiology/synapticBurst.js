console.log("🫧 synapticBurst loaded — OPTION A (VESICLE-AUTHORITATIVE)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST SYSTEM (LOCAL SPACE)
// =====================================================
//
// OPTION A CONTRACT (LOCKED):
// • Presynaptic LOCAL space ONLY
// • Drawn INSIDE drawPreSynapse()
// • Inherits ALL transforms (rotate(PI) handled upstream)
// • NO rotation math here
// • NO global membrane geometry
//
// 🔑 SINGLE SOURCE OF TRUTH:
// • membraneX is provided PER RELEASE EVENT
// • membraneX ALWAYS equals vesicle fusion plane
//
// =====================================================


// -----------------------------------------------------
// STORAGE (GLOBAL, RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// TUNING PARAMETERS
// -----------------------------------------------------
const NT_BASE_COUNT = 18;

const NT_ARC_WIDTH = Math.PI * 0.55;
const NT_SPEED_MIN = 0.25;
const NT_SPEED_MAX = 0.85;

const NT_DIFFUSION = 0.07;
const NT_DRAG      = 0.968;

const NT_LIFE_MIN  = 90;
const NT_LIFE_MAX  = 150;

const NT_RADIUS    = 3;
const CLEFT_LIMIT  = 120;


// -----------------------------------------------------
// DEBUG TOGGLES
// -----------------------------------------------------
const DEBUG_NT = true;


// -----------------------------------------------------
// EVENT LISTENER — VESICLE-AUTHORITATIVE RELEASE
// -----------------------------------------------------
//
// REQUIRED event detail (LOCAL SPACE):
// {
//   x, y,              // fusion pore (local)
//   membraneX,         // 🔑 AUTHORITATIVE membrane plane
//   normalX,           // -1 | +1 (local)
//   spread,
//   strength
// }
//
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const {
    x,
    y,
    membraneX,
    normalX  = -1,
    spread   = 1,
    strength = 1
  } = e.detail || {};

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(membraneX)
  ) {
    console.warn("❌ synapticRelease rejected — missing membraneX", e.detail);
    return;
  }

  if (DEBUG_NT) {
    console.log(
      "🫧 NT release @",
      { x: x.toFixed(2), y: y.toFixed(2) },
      "membraneX =", membraneX.toFixed(2)
    );
  }

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  // +X is cleft by DEFINITION of membraneX
  const baseAngle = normalX < 0 ? 0 : Math.PI;

  for (let i = 0; i < count; i++) {

    const theta =
      baseAngle +
      random(-NT_ARC_WIDTH, NT_ARC_WIDTH) * spread;

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    window.synapticNTs.push({
      x: x + random(-2.5, 2.5),
      y: y + random(-3.5, 3.5),

      vx: Math.cos(theta) * speed,
      vy: Math.sin(theta) * speed,

      membraneX, // 🔑 PER-PARTICLE MEMBRANE
      life: random(NT_LIFE_MIN, NT_LIFE_MAX),
      alpha: 255
    });
  }
});


// -----------------------------------------------------
// UPDATE — DIFFUSION DOMINATED (NO GEOMETRY LOOKUPS)
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts || nts.length === 0) return;

  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Brownian diffusion
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    p.x += p.vx;
    p.y += p.vy;

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // -------------------------------------------------
    // 🔒 HARD EXCLUSION — SINGLE MEMBRANE ONLY
    // -------------------------------------------------
    if (p.x < p.membraneX + 2) {
      if (DEBUG_NT) {
        console.warn(
          "🚧 NT hit membrane",
          "x =", p.x.toFixed(2),
          "membraneX =", p.membraneX.toFixed(2)
        );
      }

      p.x  = p.membraneX + 2;
      p.vx = Math.abs(p.vx) * 0.25;
    }

    // Soft fade into cleft
    if (Math.abs(p.x - p.membraneX) > CLEFT_LIMIT) {
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
// DRAW — PURE LOCAL SPACE (NO TRANSFORMS)
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
