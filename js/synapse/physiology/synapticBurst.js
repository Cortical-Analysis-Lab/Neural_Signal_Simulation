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
// =====================================================

// -----------------------------------------------------
// STORAGE (GLOBAL, SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];

// -----------------------------------------------------
// TUNING PARAMETERS (BIOLOGICAL SCALE)
// -----------------------------------------------------
const NT_BASE_COUNT   = 18;
const NT_ARC_WIDTH   = Math.PI * 0.55;   // ~100° fan
const NT_SPEED_MIN   = 0.25;
const NT_SPEED_MAX   = 0.85;
const NT_DRAG        = 0.968;
const NT_DIFFUSION   = 0.07;

const NT_LIFE_MIN    = 90;
const NT_LIFE_MAX    = 150;
const NT_RADIUS      = 3;

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

  for (let i = 0; i < count; i++) {

    // ---------------------------------------------
    // Angular fan centered on membrane normal
    // ---------------------------------------------
    const baseAngle = normalX < 0 ? Math.PI : 0;

    const theta =
      baseAngle +
      random(-NT_ARC_WIDTH, NT_ARC_WIDTH) * spread;

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    // ---------------------------------------------
    // Distributed fusion pore origin
    // (prevents point-source jetting)
    // ---------------------------------------------
    const ox = x + random(-2.5, 2.5);
    const oy = y + random(-3.5, 3.5);

    synapticNTs.push({
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
// UPDATE — DIFFUSION DOMINATED
// -----------------------------------------------------
function updateSynapticBurst() {

  for (let i = synapticNTs.length - 1; i >= 0; i--) {
    const p = synapticNTs[i];

    // Brownian diffusion (dominant)
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // Integrate
    p.x += p.vx;
    p.y += p.vy;

    // Drag (cleft viscosity)
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // Fade & lifetime
    p.alpha -= 1.6;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      synapticNTs.splice(i, 1);
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

  for (const p of synapticNTs) {
    fill(185, 120, 255, p.alpha);
    circle(p.x, p.y, NT_RADIUS);
  }

  blendMode(BLEND);
  pop();
}
