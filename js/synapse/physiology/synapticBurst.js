console.log("🫧 synapticBurst loaded — DIRECTED FAN FLOW (NO COLLISIONS)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — FAN-OUT FREE FLOW
// =====================================================
//
// ✔ Vesicle-authoritative streaming
// ✔ STRICT postsynaptic direction (+X)
// ✔ Broad fan-out across cleft
// ✔ Velocity-dominated motion
// ✔ Minimal Brownian texture
// ✔ Time-based decay ONLY
// ✘ NO NT–NT collisions
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
// CORE TUNING — THESE ARE YOUR MAIN KNOBS
// -----------------------------------------------------

// Emission density (lower = looser cloud)
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Stream duration
const NT_STREAM_DURATION_MIN = 18;
const NT_STREAM_DURATION_MAX = 28;

// Forward velocity (🔑 reach postsynapse)
const NT_FORWARD_SPEED_MIN = 0.40;
const NT_FORWARD_SPEED_MAX = 0.55;

// Initial vertical fan (at release)
const NT_INITIAL_VY_RANGE = 0.12;

// Progressive fan-out (🔑 spread across cleft)
const NT_FAN_ACCEL = 0.0025;

// Motion texture
const NT_BROWNIAN = 0.0015;
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
// NT FACTORY — DIRECTED FAN PARTICLE
// -----------------------------------------------------
function makeNT(x, y) {

  // Random vertical sign ensures symmetric fan
  const fanSign = random() < 0.5 ? -1 : 1;

  return {
    // Spawn just outside vesicle
    x: x + random(1.0, 2.5),
    y: y + random(-3, 3),

    // Strong forward velocity ONLY
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // Initial vertical divergence
    vy: fanSign * random(0, NT_INITIAL_VY_RANGE),

    // Fan direction memory
    fanSign,

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — FAN-OUT FREE FLOW
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

    // Subtle texture only
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // Progressive fan-out over time
    p.vy += p.fanSign * NT_FAN_ACCEL;

    // Enforce forward dominance
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.7) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.7;
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
