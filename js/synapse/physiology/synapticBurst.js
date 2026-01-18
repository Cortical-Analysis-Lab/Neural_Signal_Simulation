console.log("🫧 synapticBurst loaded — DIRECTED FAN w/ SELF-SEPARATION");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — FAN + SHEAR FLOW
// =====================================================
//
// ✔ Vesicle-authoritative streaming
// ✔ STRICT postsynaptic direction (+X)
// ✔ Strong early fan-out (self-separation)
// ✔ Forward velocity preserved
// ✔ NO NT–NT collisions
// ✔ NO membranes / astrocyte
// ✔ Time-based decay ONLY
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

// Density (lower = looser cloud)
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Stream duration
const NT_STREAM_DURATION_MIN = 18;
const NT_STREAM_DURATION_MAX = 28;

// Forward velocity
const NT_FORWARD_SPEED_MIN = 0.40;
const NT_FORWARD_SPEED_MAX = 0.55;

// Initial fan strength (🔑 separation power)
const NT_FAN_VY_MAX = 0.35;

// How long fan force acts (frames)
const NT_FAN_DURATION_MIN = 25;
const NT_FAN_DURATION_MAX = 45;

// Motion texture
const NT_BROWNIAN = 0.0012;
const NT_DRAG_X   = 0.996;
const NT_DRAG_Y   = 0.992;

// Lifetime
const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


// -----------------------------------------------------
// RELEASE EVENT → STREAM EMITTER
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
// NT FACTORY — FAN-OUT PARTICLE
// -----------------------------------------------------
function makeNT(x, y) {

  const fanSign = random() < 0.5 ? -1 : 1;

  return {
    // spawn slightly forward of vesicle
    x: x + random(1.2, 2.8),
    y: y + random(-2.5, 2.5),

    // forward ballistic motion
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // initial lateral velocity
    vy: fanSign * random(0.05, NT_FAN_VY_MAX),

    // early separation timer
    fanFrames: Math.floor(
      random(NT_FAN_DURATION_MIN, NT_FAN_DURATION_MAX)
    ),

    fanSign,

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — FAN → BALLISTIC FLOW
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

    if (--e.framesLeft <= 0) emitters.splice(i, 1);
  }

  if (!nts.length) return;

  // -------------------------------------------
  // PARTICLE DYNAMICS
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // very subtle texture
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // -------------------------------------------
    // EARLY FAN-OUT (SELF-SEPARATION)
    // -------------------------------------------
    if (p.fanFrames > 0) {
      p.vy += p.fanSign * 0.012;
      p.fanFrames--;
    }

    // enforce forward dominance
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.75) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.75;
    }

    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

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
