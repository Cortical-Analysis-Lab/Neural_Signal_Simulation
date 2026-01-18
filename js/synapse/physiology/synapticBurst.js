console.log("🫧 synapticBurst loaded — WATERFALL FAN-OUT");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — WATERFALL JET
// =====================================================
//
// ✔ Vesicle-authoritative streaming
// ✔ STRONG postsynaptic directionality (+X)
// ✔ Natural fan-out over time (no collisions)
// ✔ Sheet-like waterfall spread
// ✔ Velocity-dominated motion
// ✔ Time-based decay ONLY
// ✘ NO membranes
// ✘ NO astrocyte
// ✘ NO NT–NT collisions
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING — THESE ARE THE IMPORTANT KNOBS
// -----------------------------------------------------

// Density (🔑 lower = looser plume)
const NT_PER_FRAME_MIN = 0.5;
const NT_PER_FRAME_MAX = 1.2;

// Stream duration
const NT_STREAM_DURATION_MIN = 20;
const NT_STREAM_DURATION_MAX = 32;

// Forward velocity (🔑 dominates everything)
const NT_FORWARD_SPEED_MIN = 0.34;
const NT_FORWARD_SPEED_MAX = 0.42;

// Initial narrowness at release
const NT_INITIAL_VY_RANGE = 0.04;

// Fan-out growth over time (🔑 WATERFALL EFFECT)
const NT_DIVERGENCE_RATE = 0.0022;

// Motion texture
const NT_BROWNIAN = 0.0015;
const NT_DRAG_X   = 0.997;
const NT_DRAG_Y   = 0.992;

// Lifetime (~10–12 s)
const NT_LIFE_MIN = 1200;
const NT_LIFE_MAX = 1500;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


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
// NT FACTORY — BALLISTIC SEED
// -----------------------------------------------------
function makeNT(x, y) {

  return {
    x: x + random(1.5, 3.0),
    y: y + random(-6, 6),

    // Strong forward jet
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // Almost no vertical bias at birth
    vy: random(-NT_INITIAL_VY_RANGE, NT_INITIAL_VY_RANGE),

    // Per-particle divergence accumulator
    divergence: random(-1, 1),

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    age: 0,
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — WATERFALL FLOW
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  const emitters = window.activeNTEmitters;

  // -------------------------------------------
  // STREAMING EMISSION
  // -------------------------------------------
  for (let i = emitters.length - 1; i >= 0; i--) {

    const e = emitters[i];
    const n = Math.floor(random(NT_PER_FRAME_MIN, NT_PER_FRAME_MAX + 1));

    for (let k = 0; k < n; k++) {
      nts.push(makeNT(e.x, e.y));
    }

    if (--e.framesLeft <= 0) emitters.splice(i, 1);
  }

  if (!nts.length) return;

  // -------------------------------------------
  // PARTICLE DYNAMICS
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];
    p.age++;

    // ---- forward dominance (never lost)
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.7) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.7;
    }

    // ---- divergence grows with time (WATERFALL)
    p.divergence += random(-0.15, 0.15);
    p.vy += p.divergence * NT_DIVERGENCE_RATE * p.age;

    // ---- texture only
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // ---- drag
    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

    // ---- integrate
    p.x += p.vx;
    p.y += p.vy;

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
