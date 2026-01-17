console.log("🫧 synapticBurst loaded — STREAMING ELASTIC GAS");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — CONTINUOUS STREAM
// =====================================================
//
// ✔ Vesicle-authoritative streaming release
// ✔ Wide angular fan-out plume
// ✔ Velocity-dominated motion
// ✔ Minimal Brownian noise
// ✔ Elastic NT–NT collisions
// ✔ Elastic membrane scattering only
// ✔ Time-based decay ONLY
// ✔ NO volumetric constraints
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING
// -----------------------------------------------------
const NT_BASE_COUNT = 11;

// Stream emission
const NT_STREAM_DURATION_MIN = 18;
const NT_STREAM_DURATION_MAX = 32;
const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 3;

// Initial velocity
const NT_INITIAL_SPEED  = 0.30;
const NT_INITIAL_SPREAD = 0.55;   // 🔑 wide plume

// Motion physics
const NT_BROWNIAN = 0.004;        // 🔻 very small
const NT_DRAG     = 0.994;        // 🔑 glide dominates

// Lifetime (~10 s)
const NT_LIFE_MIN = 600;
const NT_LIFE_MAX = 720;


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
// RELEASE EVENT → CREATE EMITTER
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, membraneX, strength = 1 } = e.detail || {};
  if (!isFinite(x) || !isFinite(y) || !isFinite(membraneX)) return;

  window.activeNTEmitters.push({
    x, y, membraneX,
    framesLeft: Math.floor(
      random(NT_STREAM_DURATION_MIN, NT_STREAM_DURATION_MAX) * strength
    )
  });
});


// -----------------------------------------------------
// NT FACTORY
// -----------------------------------------------------
function makeNT(x, y, membraneX) {

  const angle = random(-NT_INITIAL_SPREAD, NT_INITIAL_SPREAD);

  return {
    x: x + random(-1.5, 1.5),
    y: y + random(-1.5, 1.5),

    vx: cos(angle) * NT_INITIAL_SPEED,
    vy: sin(angle) * NT_INITIAL_SPEED,

    membraneX,
    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE LOOP
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  const emitters = window.activeNTEmitters;

  // -------------------------------------------
  // EMITTER STREAMING
  // -------------------------------------------
  for (let i = emitters.length - 1; i >= 0; i--) {
    const e = emitters[i];

    const n = Math.floor(random(NT_PER_FRAME_MIN, NT_PER_FRAME_MAX + 1));
    for (let k = 0; k < n; k++) {
      nts.push(makeNT(e.x, e.y, e.membraneX));
    }

    if (--e.framesLeft <= 0) emitters.splice(i, 1);
  }

  if (!nts.length) return;

  // -------------------------------------------
  // NT DYNAMICS
  // -------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // ---- velocity-dominated motion
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    p.x += p.vx;
    p.y += p.vy;


    // -------------------------------------------
    // PRESYNAPTIC MEMBRANE
    // -------------------------------------------
    if (p.x < p.membraneX + NT_RADIUS) {
      p.x  = p.membraneX + NT_RADIUS;
      p.vx = Math.abs(p.vx);
    }


    // -------------------------------------------
    // POSTSYNAPTIC MEMBRANE
    // -------------------------------------------
    if (typeof window.getPostSynapseBoundaryX === "function") {
      const postX = window.getPostSynapseBoundaryX(p.y);
      if (p.x > postX - NT_RADIUS) {
        p.x = postX - NT_RADIUS;
        p.vx = -Math.abs(p.vx);
        p.vy += random(-0.06, 0.06);
      }
    }


    // -------------------------------------------
    // ASTROCYTE MEMBRANE
    // -------------------------------------------
    if (typeof window.getAstrocyteBoundaryY === "function") {

      const astroY = window.getAstrocyteBoundaryY(p.x);
      if (p.y < astroY + NT_RADIUS) {

        p.y = astroY + NT_RADIUS;

        const eps = 1;
        const yL = window.getAstrocyteBoundaryY(p.x - eps);
        const yR = window.getAstrocyteBoundaryY(p.x + eps);

        let nx = -(yR - yL);
        let ny =  2 * eps;

        const mag = Math.hypot(nx, ny) || 1;
        nx /= mag;
        ny /= mag;

        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;

        p.vx *= 0.96;
        p.vy *= 0.96;
      }
    }


    // -------------------------------------------
    // NT–NT COLLISIONS
    // -------------------------------------------
    for (let j = i - 1; j >= 0; j--) {

      const q = nts[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d2 = dx*dx + dy*dy;

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
