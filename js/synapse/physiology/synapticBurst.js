console.log("🫧 synapticBurst loaded — DIRECTED FREE FLOW");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — DIRECTED GAS JET
// =====================================================
//
// ✔ Vesicle-authoritative streaming release
// ✔ STRICT postsynaptic directionality
// ✔ Wide vertical dispersion
// ✔ Velocity-dominated motion
// ✔ Minimal Brownian noise
// ✔ NT–NT elastic collisions ONLY
// ✔ Time-based decay ONLY
// ✘ NO membranes
// ✘ NO astrocyte interaction
// ✘ NO volumetric constraints
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING (THE ONLY KNOBS THAT MATTER NOW)
// -----------------------------------------------------

// Density
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Stream duration
const NT_STREAM_DURATION_MIN = 22;
const NT_STREAM_DURATION_MAX = 36;

// Velocity (FORWARD ONLY)
const NT_FORWARD_SPEED_MIN = 0.22;
const NT_FORWARD_SPEED_MAX = 0.34;

// Vertical spread
const NT_VERTICAL_SPEED_MAX = 0.28;

// Motion texture
const NT_BROWNIAN = 0.003;
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
const NT_THERMAL_JITTER   = 0.006;


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
// NT FACTORY — FORWARD-ONLY EMISSION
// -----------------------------------------------------
function makeNT(x, y) {

  return {
    x: x + random(-1.2, 1.2),
    y: y + random(-1.2, 1.2),

    // 🔑 GUARANTEED POSTSYNAPTIC FLOW
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // Wide vertical dispersion
    vy: random(-NT_VERTICAL_SPEED_MAX, NT_VERTICAL_SPEED_MAX),

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — PURE DIRECTED FREE FLOW
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

    // Subtle texture ONLY
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // 🔒 HARD DIRECTIONAL GUARANTEE
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.6) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.6;
    }

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

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
