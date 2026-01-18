console.log("🫧 synapticBurst loaded — DIRECTIONAL FREE GAS");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — FREE FLOW WITH BIAS
// =====================================================
//
// ✔ Vesicle-authoritative streaming release
// ✔ Continuous plume (no pulses)
// ✔ Velocity-dominated motion
// ✔ Wide vertical spread
// ✔ NT–NT elastic collisions ONLY
// ✔ Net flux toward postsynapse
// ✘ NO walls
// ✘ NO membrane collision
// ✘ NO astrocyte interaction
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING (YOU WILL TUNE THESE)
// -----------------------------------------------------

// Density
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Stream duration (frames)
const NT_STREAM_DURATION_MIN = 22;
const NT_STREAM_DURATION_MAX = 36;

// Velocity
const NT_INITIAL_SPEED = 0.28;

// Angular spread (VERTICAL fan-out)
const NT_VERTICAL_SPREAD = 0.65;   // radians

// Directional bias
const NT_MIN_FORWARD_VX = 0.06;    // 🔑 prevents backflow
const NT_FORWARD_BIAS   = 0.004;   // gentle push each frame

// Noise
const NT_BROWNIAN = 0.003;          // texture only
const NT_DRAG     = 0.995;

// Lifetime
const NT_LIFE_MIN = 1200;
const NT_LIFE_MAX = 1500;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


// -----------------------------------------------------
// NT–NT COLLISIONS
// -----------------------------------------------------
const NT_COLLISION_RADIUS = NT_RADIUS * 2.1;
const NT_COLLISION_DAMP   = 0.92;
const NT_THERMAL_JITTER   = 0.008;


// -----------------------------------------------------
// RELEASE EVENT → CREATE STREAM EMITTER
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
// NT FACTORY — FORWARD-BIASED PARTICLE
// -----------------------------------------------------
function makeNT(x, y) {

  // Forward-facing cone (NOT symmetric)
  const a = random(-NT_VERTICAL_SPREAD, NT_VERTICAL_SPREAD);

  const vx = Math.max(
    Math.cos(a) * NT_INITIAL_SPEED,
    NT_MIN_FORWARD_VX
  );

  return {
    x: x + random(-1.5, 1.5),
    y: y + random(-1.5, 1.5),

    vx,
    vy: Math.sin(a) * NT_INITIAL_SPEED,

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — FREE FLOW WITH RECTIFIED VX
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
    for (let k = 0; k < n; k++) {
      nts.push(makeNT(e.x, e.y));
    }

    if (--e.framesLeft <= 0) {
      emitters.splice(i, 1);
    }
  }

  if (!nts.length) return;

  // -------------------------------------------
  // PARTICLE DYNAMICS
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // --- texture only
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // --- enforce net forward flux (NO POSITION CLAMP)
    if (p.vx < NT_MIN_FORWARD_VX) {
      p.vx = lerp(p.vx, NT_MIN_FORWARD_VX, 0.08);
    }

    // --- gentle bias
    p.vx += NT_FORWARD_BIAS;

    // --- inertia
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // --- integrate
    p.x += p.vx;
    p.y += p.vy;


    // -------------------------------------------
    // NT–NT ELASTIC COLLISIONS
    // -------------------------------------------
    for (let j = i - 1; j >= 0; j--) {

      const q = nts[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d2 = dx * dx + dy * dy;

      if (d2 > 0 && d2 < NT_COLLISION_RADIUS ** 2) {

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

        const impulse = impact * NT_COLLISION_DAMP;

        p.vx -= impulse * nx;
        p.vy -= impulse * ny;
        q.vx += impulse * nx;
        q.vy += impulse * ny;

        p.vx += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
        p.vy += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
      }
    }

    // -------------------------------------------
    // TIME-ONLY DECAY
    // -------------------------------------------
    p.life--;
    p.alpha = map(p.life, 0, NT_LIFE_MAX, 0, 255, true);

    if (p.life <= 0) {
      nts.splice(i, 1);
    }
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
