console.log("🫧 synapticBurst loaded — CHEMICAL CLOUD (ELASTIC GAS)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — ELASTIC CHEMICAL GAS
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Strong initial outward spill
// ✔ Angular fan-out + decorrelation
// ✔ Elastic NT–NT collisions (momentum exchange)
// ✔ Elastic membrane scattering
// ✔ Time-based decay ONLY (~10 s)
// ✔ No spatial sinks
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.lastSynapticRelease = null;


// -----------------------------------------------------
// CORE TUNING
// -----------------------------------------------------
const NT_BASE_COUNT = 22;

// Initial launch
const NT_INITIAL_SPEED  = 0.42;
const NT_INITIAL_SPREAD = 0.35;

// Gentle drift (VERY small — only breaks symmetry)
const NT_DRIFT_X = 0.010;
const NT_DRIFT_Y = 0.004;

// Fan-out
const NT_ANGULAR_NOISE = 0.030;
const NT_BROWNIAN     = 0.012;

// Drag (high inertia)
const NT_DRAG = 0.985;

// Lifetime (~10 seconds @ 60fps)
const NT_LIFE_MIN = 600;
const NT_LIFE_MAX = 720;

// Geometry
const NT_RADIUS = 2.4;
const CLEFT_DEPTH  = 220;
const CLEFT_HEIGHT = 180;


// -----------------------------------------------------
// NT–NT COLLISION PARAMETERS
// -----------------------------------------------------
const NT_COLLISION_RADIUS = NT_RADIUS * 2.0;
const NT_COLLISION_DAMP   = 0.92;   // energy loss per collision
const NT_THERMAL_JITTER   = 0.015;  // keeps cloud alive


// -----------------------------------------------------
// POST-FUSION TRICKLE
// -----------------------------------------------------
const NT_TRICKLE_PROB  = 0.10;
const NT_TRICKLE_SPEED = 0.22;


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

  window.lastSynapticRelease = {
    x, y, membraneX,
    life: 60
  };
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
    vy: sin(angle) * NT_INITIAL_SPEED * 0.7,

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
  // SECONDARY TRICKLE (POST-FUSION)
  // -----------------------------------------------
  if (r && r.life-- > 0 && random() < NT_TRICKLE_PROB) {
    nts.push({
      x: r.x,
      y: r.y,
      vx: random(0.12, NT_TRICKLE_SPEED),
      vy: random(-0.10, 0.10),
      membraneX: r.membraneX,
      life: random(420, 600),
      alpha: 255
    });
  }
  if (r && r.life <= 0) window.lastSynapticRelease = null;

  if (!nts.length) return;

  // -----------------------------------------------
  // MAIN UPDATE LOOP
  // -----------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // ---- angular decorrelation
    const speed = Math.hypot(p.vx, p.vy);
    let angle = atan2(p.vy, p.vx);
    angle += random(-NT_ANGULAR_NOISE, NT_ANGULAR_NOISE);

    p.vx = cos(angle) * speed;
    p.vy = sin(angle) * speed;

    // ---- subtle drift + texture
    p.vx += NT_DRIFT_X + random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += NT_DRIFT_Y * Math.sign(p.y || random(-1, 1));

    // ---- inertia
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // ---- position
    p.x += p.vx;
    p.y += p.vy;


    // -------------------------------------------
    // PRESYNAPTIC MEMBRANE
    // -------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = Math.abs(p.vx) * 0.7;
    }


    // -------------------------------------------
    // POSTSYNAPTIC MEMBRANE — DIFFUSE SCATTER
    // -------------------------------------------
    const postX = p.membraneX + CLEFT_DEPTH;

    if (p.x > postX) {
      p.x = postX - (p.x - postX);

      const speed = Math.hypot(p.vx, p.vy);
      const theta = random(-PI * 0.8, PI * 0.8);

      p.vx = -cos(theta) * speed * random(0.5, 0.8);
      p.vy =  sin(theta) * speed * random(0.6, 1.0);
    }


    // -------------------------------------------
    // ASTROCYTE / VERTICAL CONFINEMENT
    // -------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.y  = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
      p.vy *= -0.6;
    }


    // -------------------------------------------
    // NT–NT ELASTIC COLLISIONS (GLOBAL)
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

        // separate overlap
        const overlap = 0.5 * (NT_COLLISION_RADIUS - d);
        p.x += nx * overlap;
        p.y += ny * overlap;
        q.x -= nx * overlap;
        q.y -= ny * overlap;

        // relative velocity
        const dvx = p.vx - q.vx;
        const dvy = p.vy - q.vy;
        const impact = dvx * nx + dvy * ny;
        if (impact > 0) continue;

        const impulse = impact * NT_COLLISION_DAMP;

        p.vx -= impulse * nx;
        p.vy -= impulse * ny;
        q.vx += impulse * nx;
        q.vy += impulse * ny;

        // thermal noise (prevents freezing)
        p.vx += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
        p.vy += random(-NT_THERMAL_JITTER, NT_THERMAL_JITTER);
      }
    }


    // -------------------------------------------
    // TIME-BASED DECAY ONLY
    // -------------------------------------------
    p.life--;
    p.alpha = map(p.life, 0, NT_LIFE_MAX, 0, 255, true);

    if (p.life <= 0 || p.alpha <= 0) {
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
// EXPORT
// -----------------------------------------------------
window.updateSynapticBurst = updateSynapticBurst;
window.drawSynapticBurst   = drawSynapticBurst;
