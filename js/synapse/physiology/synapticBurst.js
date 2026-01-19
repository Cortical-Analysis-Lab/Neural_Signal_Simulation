console.log("🫧 synapticBurst loaded — FREE FLOW + FINITE ASTROCYTE (CROSSING-BASED)");

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
// ✔ Astrocyte interaction ONLY via visible membrane
// ✔ Crossing-based collision (NO hover slabs)
//
// ✘ NO NT–NT collisions
// ✘ NO presynaptic / postsynaptic walls
// ✘ NO global slabs / invisible planes
//
// CONTRACT:
// • getAstrocyteBoundaryY(x) MUST return WORLD Y
// • synapticBurst applies NO offsets
// • Collision occurs ONLY on membrane crossing
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD-SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING — FLOW + DENSITY
// -----------------------------------------------------
const NT_STREAM_DURATION_MIN = 16;
const NT_STREAM_DURATION_MAX = 28;

const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

// Initial velocity
const NT_INITIAL_SPEED  = 0.34;
const NT_INITIAL_SPREAD = 0.75;

// Motion physics
const NT_ADVECT_X = 0.018;
const NT_BROWNIAN = 0.003;
const NT_DRAG     = 0.995;

// Lifetime
const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4; // draw-only (NOT used for collision)


// -----------------------------------------------------
// RELEASE EVENT → STREAM EMITTER
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, strength = 1 } = e.detail || {};
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;

  window.activeNTEmitters.push({
    x,
    y,
    framesLeft: Math.floor(
      random(NT_STREAM_DURATION_MIN, NT_STREAM_DURATION_MAX) * strength
    )
  });
});


// -----------------------------------------------------
// NT FACTORY — FOUNDATIONAL VERSION
// -----------------------------------------------------
function makeNT(x, y) {

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
// UPDATE LOOP — FREE FLOW + FINITE ASTROCYTE
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

    // --- forces ---
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // --- integrate ---
    const prevX = p.x;
    const prevY = p.y;

    p.x += p.vx;
    p.y += p.vy;

    // -------------------------------------------
    // ASTROCYTE COLLISION — CROSSING-BASED
    // -------------------------------------------
    if (typeof window.getAstrocyteBoundaryY === "function") {

      const astroY = window.getAstrocyteBoundaryY(p.x);

      if (astroY !== null) {

        // Detect downward crossing of membrane
          if (prevY < astroY && p.y >= astroY) {

          // Clamp exactly to visible membrane
          p.y = astroY;

          // Estimate surface normal (finite difference)
          const eps = 1;
          const yL = window.getAstrocyteBoundaryY(p.x - eps);
          const yR = window.getAstrocyteBoundaryY(p.x + eps);

          if (yL !== null && yR !== null) {

            let nx = -(yR - yL);
            let ny =  2 * eps;

            const mag = Math.hypot(nx, ny) || 1;
            nx /= mag;
            ny /= mag;

            // Reflect velocity
            const dot = p.vx * nx + p.vy * ny;
            p.vx -= 2 * dot * nx;
            p.vy -= 2 * dot * ny;

            // Gentle biological damping
            p.vx *= 0.96;
            p.vy *= 0.96;
          }
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
