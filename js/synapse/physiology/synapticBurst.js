console.log("🫧 synapticBurst loaded — PLUME + COLLISION MODEL");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — FAN + FLOAT MODEL
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Directional plume (fan-out)
// ✔ Weak diffusion (secondary)
// ✔ Boundary collisions (membrane + astrocyte)
// ✔ Dissolving coherence over time
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
// TUNING — MOTION MODEL
// -----------------------------------------------------
const NT_BASE_COUNT = 22;

// Initial plume
const NT_CONE_ANGLE = Math.PI * 0.65; // wide fan
const NT_SPEED_MIN  = 0.35;
const NT_SPEED_MAX  = 0.85;

// Motion evolution
const NT_DIFFUSION  = 0.05;   // LOW Brownian noise
const NT_DRAG       = 0.93;
const NT_COHERENCE_DECAY = 0.0015;

// Lifetime
const NT_LIFE_MIN = 220;
const NT_LIFE_MAX = 360;

// Visual
const NT_RADIUS = 2.6;

// Cleft bounds (teaching-friendly)
const CLEFT_DEPTH  = 160;
const CLEFT_HEIGHT = 130;


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

  // Central plume direction → into cleft
  const baseAngle = 0; // +x direction

  for (let i = 0; i < count; i++) {

    const angle =
      baseAngle +
      random(-NT_CONE_ANGLE / 2, NT_CONE_ANGLE / 2);

    const speed = random(NT_SPEED_MIN, NT_SPEED_MAX);

    window.synapticNTs.push({
      x: x + random(-1.5, 1.5),
      y: y + random(-3, 3),

      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,

      angle,
      coherence: 1.0,

      membraneX,
      life: random(NT_LIFE_MIN, NT_LIFE_MAX),
      alpha: 255
    });
  }
});


// -----------------------------------------------------
// UPDATE — PLUME + COLLISIONS
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts.length) return;

  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // -----------------------------------------------
    // Weak diffusion (secondary)
    // -----------------------------------------------
    p.vx += random(-NT_DIFFUSION, NT_DIFFUSION);
    p.vy += random(-NT_DIFFUSION, NT_DIFFUSION);

    // -----------------------------------------------
    // Coherence decay (plume dissolves)
    // -----------------------------------------------
    p.coherence = max(0, p.coherence - NT_COHERENCE_DECAY);

    // -----------------------------------------------
    // Velocity damping
    // -----------------------------------------------
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    p.x += p.vx;
    p.y += p.vy;

    // -----------------------------------------------
    // PRESYNAPTIC MEMBRANE COLLISION
    // -----------------------------------------------
    if (p.x < p.membraneX + 2) {
      p.x  = p.membraneX + 2;
      p.vx = Math.abs(p.vx) * 0.6;
    }

    // -----------------------------------------------
    // POSTSYNAPTIC SOFT BOUNCE
    // -----------------------------------------------
    if (p.x > p.membraneX + CLEFT_DEPTH) {
      p.vx *= -0.35;
      p.x = p.membraneX + CLEFT_DEPTH;
      p.alpha -= 1.5;
    }

    // -----------------------------------------------
    // ASTROCYTE COLLISION (SOFT DOME)
    // -----------------------------------------------
    // Approximate astrocyte endfoot as ellipse
    const ax = 0;
    const ay = -140;
    const rx = 210;
    const ry = 95;

    const dx = (p.x - ax) / rx;
    const dy = (p.y - ay) / ry;
    const d2 = dx * dx + dy * dy;

    if (d2 < 1.0 && p.y < ay + 30) {
      // reflect away from astrocyte surface
      const nx = dx;
      const ny = dy;
      const dot = p.vx * nx + p.vy * ny;

      p.vx -= 2 * dot * nx;
      p.vy -= 2 * dot * ny;

      p.vx *= 0.5;
      p.vy *= 0.5;
    }

    // -----------------------------------------------
    // VERTICAL CONFINEMENT
    // -----------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.vy *= -0.45;
      p.y = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
    }

    // -----------------------------------------------
    // Lifetime
    // -----------------------------------------------
    p.life--;
    p.alpha -= 0.8;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — FLOATING PLUME
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
