console.log("🫧 synapticBurst loaded");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST SYSTEM
// =====================================================
//
// BIOLOGICAL MODEL:
// ✔ Fan-shaped release
// ✔ Biased away from presynaptic membrane
// ✔ Distributed fusion pore origin
// ✔ Diffusion-dominated (no jetting)
// ✔ No clumping / no overlap artifacts
// ✔ Confined to synaptic cleft
//
// ARCHITECTURAL GUARANTEES:
// ✔ Event-driven ONLY
// ✔ NO vesicle coupling
// ✔ NO geometry authority
// ✔ NO pool / release / recycle logic
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


// -----------------------------------------------------
// EVENT LISTENER — BIOLOGICAL RELEASE
// -----------------------------------------------------
//
// Expected event detail:
// {
//   x, y,
//   normalX: -1 | +1   (cleft direction)
//   spread: 0–1        (fan tightness)
//   strength: 0–1     (quantal size)
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

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  // Fan direction centered on membrane normal
  const baseAngle = normalX < 0 ? Math.PI : 0;

  for (let i = 0; i < count; i++) {

    const theta =
      baseAngle +
      random(-NT_ARC_WIDTH, NT_ARC_WIDTH) * spread;

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    // Distributed fusion pore origin (visual realism)
    const ox = x + random(-2.5, 2.5);
    const oy = y + random(-3.5, 3.5);

    window.synapticNTs.push({
      x: ox,
      y: oy,

      vx: cos(theta) * speed,
      vy: sin(theta) * speed,

      life: random(NT_LIFE_MIN, NT_LIFE_MAX),
      alpha: 255
    });
  }
});


// -----------------------------------------------------
// UPDATE — DIFFUSION DOMINATED (CLEFT SAFE)
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts || nts.length === 0) return;

  // Geometry is READ-ONLY here
  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;

  // Soft spatial extent into cleft (visual only)
  const CLEFT_LIMIT = 120;

  for (let i = nts.length - 1; i >= 0; i--) {
    const p = nts[i];

    // -------------------------------------------------
    // Brownian diffusion (dominant term)
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
    // Soft confinement — prevent NTs re-entering
    // presynaptic terminal
    // -------------------------------------------------
    if (p.x < MEMBRANE_X + 2) {
      p.x  = MEMBRANE_X + 2;
      p.vx = Math.abs(p.vx) * 0.3;
    }

    // Optional fade if drifting too far into cleft
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
// DRAW — CLEAN, LIGHTWEIGHT, READ-ONLY
// -----------------------------------------------------
function drawSynapticBurst() {
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
// PUBLIC EXPORTS
// -----------------------------------------------------
window.updateSynapticBurst = updateSynapticBurst;
window.drawSynapticBurst   = drawSynapticBurst;
