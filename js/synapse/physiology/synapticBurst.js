console.log("🫧 synapticBurst loaded — BALLISTIC JET → DIFFUSIVE GAS");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — TWO-PHASE FLOW
// =====================================================
//
// PHASE 1: Ballistic jet (NO collisions)
// PHASE 2: Diffusive gas (NT–NT collisions)
//
// ✔ Vesicle-authoritative streaming
// ✔ STRICT postsynaptic directionality
// ✔ Loose spatial spread
// ✔ Velocity-dominated motion
// ✔ Minimal Brownian texture
// ✔ NT–NT collisions AFTER separation
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

// Emission density (🔑 LOWER = looser cloud)
const NT_PER_FRAME_MIN = 0.3;
const NT_PER_FRAME_MAX = 0.5;

// Stream duration
const NT_STREAM_DURATION_MIN = 18;
const NT_STREAM_DURATION_MAX = 28;

// Forward velocity
const NT_FORWARD_SPEED_MIN = 0.32;
const NT_FORWARD_SPEED_MAX = 0.40;

// Vertical spawn width (🔑 plume width)
const NT_SPAWN_Y_RANGE = 16;

// Motion texture
const NT_BROWNIAN = 0.002;
const NT_DRAG_X   = 0.996;
const NT_DRAG_Y   = 0.990;

// Lifetime
const NT_LIFE_MIN = 1200;
const NT_LIFE_MAX = 1500;


// -----------------------------------------------------
// COLLISION PHASE CONTROL (🔑 THIS IS THE FIX)
// -----------------------------------------------------

// Frames before collisions are allowed
const NT_COLLISION_DELAY_MIN = 200;
const NT_COLLISION_DELAY_MAX = 400;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;


// -----------------------------------------------------
// NT–NT COLLISIONS (ACTIVE ONLY AFTER DELAY)
// -----------------------------------------------------
const NT_COLLISION_RADIUS = NT_RADIUS * 2.1;
const NT_COLLISION_DAMP_X = 0.80;
const NT_COLLISION_DAMP_Y = 0.55;
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
// NT FACTORY — BALLISTIC PARTICLE
// -----------------------------------------------------
function makeNT(x, y) {

  return {
    // Spawn just outside vesicle
    x: x + random(1.0, 2.5),

    // Vertical spread only at birth
    y: y + random(-NT_SPAWN_Y_RANGE, NT_SPAWN_Y_RANGE),

    // Forward jet
    vx: random(NT_FORWARD_SPEED_MIN, NT_FORWARD_SPEED_MAX),

    // Very small initial lateral motion
    vy: random(-0.05, 0.05),

    // Collision gate
    collisionDelay: Math.floor(
      random(NT_COLLISION_DELAY_MIN, NT_COLLISION_DELAY_MAX)
    ),

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP — TWO-PHASE FLOW
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

    // Enforce forward dominance
    if (p.vx < NT_FORWARD_SPEED_MIN * 0.6) {
      p.vx = NT_FORWARD_SPEED_MIN * 0.6;
    }

    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

    p.x += p.vx;
    p.y += p.vy;

    // -------------------------------------------
    // NT–NT COLLISIONS (ONLY AFTER DELAY)
    // -------------------------------------------
    if (p.collisionDelay > 0) {
      p.collisionDelay--;
    } else {

      for (let j = i - 1; j >= 0; j--) {

        const q = nts[j];
        if (q.collisionDelay > 0) continue;

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

          p.vx -= impact * nx * NT_COLLISION_DAMP_X;
          p.vy -= impact * ny * NT_COLLISION_DAMP_Y;
          q.vx += impact * nx * NT_COLLISION_DAMP_X;
          q.vy += impact * ny * NT_COLLISION_DAMP_Y;

          p.vx += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
          p.vy += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
        }
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
