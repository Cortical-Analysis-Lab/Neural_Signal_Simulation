console.log("🫧 synapticBurst loaded");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST SYSTEM
// BIOLOGICAL, RADIAL, DIFFUSIVE
// =====================================================
//
// ✔ Fan-shaped release
// ✔ Biased away from presynaptic membrane
// ✔ Distributed fusion pore origin
// ✔ Diffusion-dominated (no jetting)
// ✔ No clumping / no overlap artifacts
// ✔ Confined to synaptic cleft
//
// ⚠️ NO vesicle coupling
// ⚠️ NO geometry authority
// ⚠️ Event-driven ONLY
// =====================================================


// -----------------------------------------------------
// STORAGE (GLOBAL, SAFE)
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
// Expected payload:
// {
//   x, y,
//   normalX: -1 | +1   (cleft direction)
//   spread: 0–1        (fan tightness)
//   strength: 0–1     (quantal size)
// }
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const {
    x,
    y,
    normalX  = -1,
    spread   = 1,
    strength = 1
  } = e.detail;

  const count = floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  // Fan direction centered on membrane normal
  const baseAngle = normalX < 0 ? Math.PI : 0;

  for (let i = 0; i < count; i++) {

    const theta =
      baseAngle +
      random(-NT_ARC_WIDTH, NT_ARC_WIDTH) * spread;

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    // Distributed fusion pore origin
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

  const MEMBRANE_X = window.SYNAPSE_MEMBRANE_X;
  const CLEF_LIMIT = 120; // soft spatial extent into cleft

  for (let i = nts.length - 1; i >= 0; i--) {
    const p = nts[i];

    // Brownian diffusion (dominant)
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // Integrate
    p.x += p.vx;
    p.y += p.vy;

    // Drag (cleft viscosity)
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // ---------------------------------------------
    // Soft confinement — prevent NTs re-entering
    // presynaptic terminal
    // ---------------------------------------------
    if (p.x < MEMBRANE_X + 2) {
      p.x = MEMBRANE_X + 2;
      p.vx = abs(p.vx) * 0.3;
    }

    // Optional cleft fade (prevents infinite spread)
    if (abs(p.x - MEMBRANE_X) > CLEF_LIMIT) {
      p.alpha -= 3.0;
    }

    // Lifetime
    p.alpha -= 1.6;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — CLEAN, LIGHTWEIGHT
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
