console.log("🫧 synapticBurst loaded — DIRECTED JET (ANTI-CIRCULAR)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — TEACHING-FIRST JET
// =====================================================
//
// ✔ Vesicle-authoritative streaming
// ✔ STRICT +X directionality
// ✔ Vertical spread via POSITION (not velocity)
// ✔ Velocity-dominated forward motion
// ✔ Minimal Brownian texture
// ✔ NT–NT collisions (anisotropic)
// ✔ Time-based decay ONLY
// ✘ NO membranes
// ✘ NO astrocyte
// ✘ NO volumetric constraints
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING (PRIMARY CONTROLS)
// -----------------------------------------------------

// Emission density
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Stream duration
const NT_STREAM_DURATION_MIN = 18;
const NT_STREAM_DURATION_MAX = 30;

// Forward velocity (🔑 dominates everything)
const NT_FORWARD_SPEED_MIN = 0.30;
const NT_FORWARD_SPEED_MAX = 0.38;

// Vertical spawn width (🔑 plume width)
const NT_SPAWN_Y_RANGE = 14;

// Motion texture
const NT_BROWNIAN = 0.002;
const NT_DRAG_X   = 0.996;
const NT_DRAG_Y   = 0.970;   // 🔑 stronger lateral damping

// Lifetime
const NT_LIFE_MIN = 1200;
const NT_LIFE_MAX = 1500;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


// -----------------------------------------------------
// NT–NT COLLISIONS (ANISOTROPIC)
// -----------------------------------------------------
const NT_COLLISION_RADIUS = NT_RADIUS * 2.1;
const NT_COLLISION_DAMP_X = 0.85;  // 🔑 preserve forward flow
const NT_COLLISION_DAMP_Y = 0.55;  // 🔑 suppress sideways spread
const NT_THERMAL_JITTER   = 0.004;


// -----------------------------------------------------
// RELEASE EVENT → EMITTER
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, strength = 1 } = e.detail || {};
  if (!isFinite(x) || !isFinite(y)) return;

  window.activeNTEmitters.push({
    x,
    y,
    framesLeft: Math.floor(
      random(NT_STREAM_DURATION_MIN, NT_STREAM_DURATION_MAX) * strength
    )
  });
});


// -----------------------------------------------------
// NT FACTORY — SLIT JET
// -----------------------------------------------------
function makeNT(x, y) {

  return {
    // Spawn slightly OUTSIDE vesicle, into cleft
    x: x + random(0.8, 2.0),

    // Vertical spread ONLY at birth
    y: y + random(-NT_SPAWN_Y_RANGE, NT_SPAWN_Y_RANGE),

    // Forward-only velocity
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // Almost no persistent vertical velocity
    vy: random(-0.04, 0.04),

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — DIRECTED JET
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  const emitters = window.activeNTEmitters;

  // -------------------------------------------
  // STREAM EMISSION
  // -------------------------------------------
  for (let i = emitters.length - 1; i >= 0; i--) {
    const e = emitters[i];
    const n = Math.floor(random(NT_PER_FRAME_MIN, NT_PER_FRAME_MAX + 1));

    for (let k = 0; k < n; k++) nts.push(makeNT(e.x, e.y));

    if (--e.framesLeft <= 0) emitters.splice(i, 1);
  }

  if (!nts.length) return;

  // -------------------------------------------
  // PARTICLE DYNAMICS
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Subtle texture
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // Hard forward guarantee
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.6) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.6;
    }

    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

    p.x += p.vx;
    p.y += p.vy;

    // -------------------------------------------
    // NT–NT COLLISIONS (DIRECTION-PRESERVING)
    // -------------------------------------------
    for (let j = i - 1; j >= 0; j--) {

      const q = nts[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d2 = dx*dx + dy*dy;

      if (d2 > 0 && d2 < NT_COLLISION_RADIUS * NT_COLLISION_RADIUS) {

        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;

        const overlap = 0.5 * (NT_COLLISION_RADIUS - d);
        p.x += nx * overlap;
        p.y += ny * overlap;
        q.x -= nx * overlap;
        q.y -= ny * overlap;

        const dvx = p.vx - q.vx;
        const dvy = p.vy - q.vy;
        const impact = dvx * nx + dvy * ny;
        if (impact > 0) continue;

        // 🔑 anisotropic impulse
        p.vx -= impact * nx * NT_COLLISION_DAMP_X;
        p.vy -= impact * ny * NT_COLLISION_DAMP_Y;
        q.vx += impact * nx * NT_COLLISION_DAMP_X;
        q.vy += impact * ny * NT_COLLISION_DAMP_Y;

        p.vx += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
        p.vy += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
      }
    }

    // -------------------------------------------
    // TIME-ONLY DECAY
    // -------------------------------------------
    p.life--;
    p.alpha = map(p.life, 0, NT_LIFE_MAX, 0, 255, true);
    if (p.life <= 0) nts.splice(i, 1);
  }
}


// -----------------------------------------------------
// DRAW
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
