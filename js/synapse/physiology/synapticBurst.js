console.log("🫧 synapticBurst loaded — FREE FLOW (NO COLLISIONS)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — BIASED FREE GAS
// =====================================================
//
// ✔ Continuous streaming (non-pulsed)
// ✔ Wide spatial plume
// ✔ Net drift toward postsynapse (+X)
// ✔ Velocity-dominated motion
// ✔ Minimal Brownian texture
// ✔ Time-based decay ONLY
// ✘ NO NT–NT collisions
// ✘ NO membranes
// ✘ NO astrocyte interaction
// ✘ NO slabs / boxes / clamps
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING — FLOW + DENSITY
// -----------------------------------------------------

// Emission
const NT_STREAM_DURATION_MIN = 16;
const NT_STREAM_DURATION_MAX = 28;

const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;   // keep loose

// Initial velocity
const NT_INITIAL_SPEED  = 0.34;
const NT_INITIAL_SPREAD = 0.75;   // wide plume

// Motion physics
const NT_ADVECT_X = 0.018;        // 🔑 net drift toward postsynapse
const NT_BROWNIAN = 0.003;        // subtle texture only
const NT_DRAG     = 0.995;        // long glide

// Lifetime (~10–12 s @ 60 fps)
const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


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
// NT FACTORY — WIDE SOURCE (FOUNDATIONAL)
// -----------------------------------------------------
function makeNT(x, y) {

  // Wide angular plume centered forward (+X)
  const angle = random(-NT_INITIAL_SPREAD, NT_INITIAL_SPREAD);

  return {
    x: x + random(-4, 4),
    y: y + random(-6, 6),

    vx: Math.cos(angle) * NT_INITIAL_SPEED,
    vy: Math.sin(angle) * NT_INITIAL_SPEED,

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — PURE BIASED FREE FLOW
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
  // PARTICLE DYNAMICS (NO COLLISIONS)
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Net forward advection
    p.vx += NT_ADVECT_X;

    // Gentle texture
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

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
