console.log("🫧 synapticBurst loaded — CHEMICAL CLOUD (ELASTIC GAS, SLOWED)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — ELASTIC CHEMICAL GAS
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Slower outward spill
// ✔ Angular fan-out + decorrelation
// ✔ Elastic NT–NT collisions (momentum exchange)
// ✔ TRUE elastic astrocyte scattering (curved surface)
// ✔ Time-based decay ONLY (~10 s @ 60fps)
// ✔ No spatial sinks, no pinning
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.lastSynapticRelease = null;


// -----------------------------------------------------
// CORE TUNING (REDUCED DENSITY + SLOWER)
// -----------------------------------------------------
const NT_BASE_COUNT = 11;

// Initial launch
const NT_INITIAL_SPEED  = 0.26;
const NT_INITIAL_SPREAD = 0.35;

// Gentle drift
const NT_DRIFT_X = 0.006;
const NT_DRIFT_Y = 0.002;

// Fan-out texture
const NT_ANGULAR_NOISE = 0.028;
const NT_BROWNIAN     = 0.010;

// Drag (high inertia)
const NT_DRAG = 0.990;

// Lifetime (~10 seconds)
const NT_LIFE_MIN = 600;
const NT_LIFE_MAX = 720;


// -----------------------------------------------------
// GEOMETRY
// -----------------------------------------------------
const NT_RADIUS = 2.4;
const CLEFT_DEPTH = 220;


// -----------------------------------------------------
// NT–NT COLLISIONS
// -----------------------------------------------------
const NT_COLLISION_RADIUS = NT_RADIUS * 2.1;
const NT_COLLISION_DAMP   = 0.90;
const NT_THERMAL_JITTER   = 0.012;


// -----------------------------------------------------
// POST-FUSION TRICKLE
// -----------------------------------------------------
const NT_TRICKLE_PROB  = 0.10;
const NT_TRICKLE_SPEED = 0.16;


// -----------------------------------------------------
// EVENT — VESICLE RELEASE
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

  const angle = random(-NT_INITIAL_SPREAD, NT_INITIAL_SPREAD);

  return {
    x: x + random(-2, 2),
    y: y + random(-4, 4),

    vx: cos(angle) * NT_INITIAL_SPEED,
    vy: sin(angle) * NT_INITIAL_SPEED * 0.65,

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
  const r   = window.lastSynapticRelease;

  // -----------------------------------------------
  // SECONDARY TRICKLE
  // -----------------------------------------------
  if (r && r.life-- > 0 && random() < NT_TRICKLE_PROB) {
    nts.push({
      x: r.x,
      y: r.y,
      vx: random(0.06, NT_TRICKLE_SPEED),
      vy: random(-0.08, 0.08),
      membraneX: r.membraneX,
      life: random(420, 600),
      alpha: 255
    });
  }
  if (r && r.life <= 0) window.lastSynapticRelease = null;

  if (!nts.length) return;

  // -----------------------------------------------
  // MAIN LOOP
  // -----------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // ---- angular decorrelation
    const speed = Math.hypot(p.vx, p.vy);
    let angle = atan2(p.vy, p.vx);
    angle += random(-NT_ANGULAR_NOISE, NT_ANGULAR_NOISE);

    p.vx = cos(angle) * speed;
    p.vy = sin(angle) * speed;

    // ---- drift + texture
    p.vx += NT_DRIFT_X + random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += NT_DRIFT_Y * Math.sign(p.y || random(-1, 1));

    // ---- inertia
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // ---- integrate
    p.x += p.vx;
    p.y += p.vy;


    // -------------------------------------------
    // PRESYNAPTIC MEMBRANE
    // -------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = Math.abs(p.vx) * 0.6;
    }


    // -------------------------------------------
    // POSTSYNAPTIC MEMBRANE
    // -------------------------------------------
    const postX = p.membraneX + CLEFT_DEPTH;

    if (p.x > postX) {
      p.x = postX - (p.x - postX);

      const sp = Math.hypot(p.vx, p.vy);
      const a  = atan2(p.vy, p.vx) + random(-0.4, 0.4);

      p.vx = -cos(a) * sp * random(0.45, 0.75);
      p.vy =  sin(a) * sp * random(0.60, 1.00);
    }


    // -------------------------------------------
    // ASTROCYTE — TRUE CURVED ELASTIC COLLISION
    // -------------------------------------------
    if (typeof window.getAstrocyteBoundaryY === "function") {

      const astroY = window.getAstrocyteBoundaryY(p.x);

      if (p.y < astroY + NT_RADIUS) {

        // push out of membrane
        p.y = astroY + NT_RADIUS;

        // estimate surface normal
        const eps = 1;
        const y1 = window.getAstrocyteBoundaryY(p.x - eps);
        const y2 = window.getAstrocyteBoundaryY(p.x + eps);

        const tx = 2 * eps;
        const ty = y2 - y1;

        let nx = -ty;
        let ny =  tx;

        const mag = Math.hypot(nx, ny) || 1;
        nx /= mag;
        ny /= mag;

        // reflect velocity
        const dot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * dot * nx;
        p.vy -= 2 * dot * ny;

        // damping + micro scatter
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vx += random(-0.04, 0.04);
        p.vy += random(-0.02, 0.02);
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
