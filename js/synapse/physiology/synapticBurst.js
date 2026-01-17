console.log("🫧 synapticBurst loaded — TRUE ELASTIC GAS (NO SLABS)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — TRUE FREE GAS
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Isotropic diffusion (no directional bias)
// ✔ Elastic NT–NT collisions
// ✔ Elastic presynaptic membrane
// ✔ Elastic postsynaptic membrane (CURVED, sampled)
// ✔ Elastic astrocyte membrane (CURVED, sampled)
// ✔ Time-based decay ONLY (~10 s)
// ✔ ZERO volumetric constraints
//
// =====================================================


// -----------------------------------------------------
// STORAGE
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.lastSynapticRelease = null;


// -----------------------------------------------------
// CORE TUNING
// -----------------------------------------------------
const NT_BASE_COUNT = 11;

const NT_INITIAL_SPEED  = 0.26;
const NT_INITIAL_SPREAD = 0.35;

const NT_BROWNIAN = 0.012;
const NT_DRIFT_X  = 0.006;   // cleft bias only

const NT_DRAG = 0.990;

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
const NT_COLLISION_DAMP   = 0.90;
const NT_THERMAL_JITTER   = 0.012;


// -----------------------------------------------------
// EVENT — RELEASE
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, membraneX, strength = 1 } = e.detail || {};
  if (!isFinite(x) || !isFinite(y) || !isFinite(membraneX)) return;

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (!count) return;

  for (let i = 0; i < count; i++) {
    window.synapticNTs.push(makeNT(x, y, membraneX));
  }

  window.lastSynapticRelease = { x, y, membraneX, life: 60 };
});


// -----------------------------------------------------
// NT FACTORY
// -----------------------------------------------------
function makeNT(x, y, membraneX) {

  const a = random(-NT_INITIAL_SPREAD, NT_INITIAL_SPREAD);

  return {
    x: x + random(-2, 2),
    y: y + random(-4, 4),

    vx: cos(a) * NT_INITIAL_SPEED,
    vy: sin(a) * NT_INITIAL_SPEED * 0.65,

    membraneX,
    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// POSTSYNAPTIC MEMBRANE SAMPLER (SAFE DEFAULT)
// -----------------------------------------------------
//
// Replace later with true geometry if desired
//
window.getPostSynapseBoundaryX = window.getPostSynapseBoundaryX || function (y) {
  return +130; // matches POST_X in synapse view
};


// -----------------------------------------------------
// UPDATE LOOP
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  if (!nts.length) return;

  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // -------------------------------------------
    // ISOTROPIC MOTION
    // -------------------------------------------
    p.vx += NT_DRIFT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    p.x += p.vx;
    p.y += p.vy;


    // -------------------------------------------
    // PRESYNAPTIC MEMBRANE (LEFT)
    // -------------------------------------------
    if (p.x < p.membraneX + NT_RADIUS) {
      p.x  = p.membraneX + NT_RADIUS;
      p.vx = Math.abs(p.vx) * 0.6;
    }


    // -------------------------------------------
    // POSTSYNAPTIC MEMBRANE (RIGHT — TRUE BOUNCE)
    // -------------------------------------------
    if (typeof window.getPostSynapseBoundaryX === "function") {

      const postX = window.getPostSynapseBoundaryX(p.y);

      if (p.x > postX - NT_RADIUS) {

        p.x = postX - NT_RADIUS;

        p.vx = -Math.abs(p.vx) * random(0.45, 0.75);
        p.vy += random(-0.10, 0.10);
      }
    }


    // -------------------------------------------
    // ASTROCYTE MEMBRANE (CURVED)
    // -------------------------------------------
    if (typeof window.getAstrocyteBoundaryY === "function") {

      const astroY = window.getAstrocyteBoundaryY(p.x);

      if (p.y < astroY + NT_RADIUS) {

        p.y = astroY + NT_RADIUS;

        // numerical normal
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

        p.vx *= 0.92;
        p.vy *= 0.92;
      }
    }


    // -------------------------------------------
    // NT–NT ELASTIC COLLISIONS
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
