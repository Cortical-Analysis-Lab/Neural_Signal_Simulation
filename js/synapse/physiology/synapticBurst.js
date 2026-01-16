console.log("🫧 synapticBurst loaded — FAN-OUT + BOUNDARY MODEL");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — CHEMICAL CLOUD
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Sustained outward drift
// ✔ Progressive fan-out (angular decorrelation)
// ✔ Elastic boundary interactions
// ✔ Soft NT–NT repulsion
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// CORE TUNING
// -----------------------------------------------------
const NT_BASE_COUNT = 22;

// Initial launch
const NT_INITIAL_SPEED  = 0.42;
const NT_INITIAL_SPREAD = 0.35;

// Drift (keeps outward flow alive)
const NT_DRIFT_X = 0.040;
const NT_DRIFT_Y = 0.010;

// Fan-out mechanics
const NT_ANGULAR_NOISE = 0.035;   // 🔑 direction decorrelation
const NT_BROWNIAN     = 0.020;

// Drag
const NT_DRAG_X = 0.975;
const NT_DRAG_Y = 0.950;

// Lifetime
const NT_LIFE_MIN = 280;
const NT_LIFE_MAX = 420;

// Geometry
const NT_RADIUS = 2.4;
const CLEFT_DEPTH  = 220;
const CLEFT_HEIGHT = 180;

// NT–NT interaction
const NT_REPEL_RADIUS = 7;
const NT_REPEL_FORCE  = 0.015;


// -----------------------------------------------------
// POST-FUSION TRICKLE
// -----------------------------------------------------
const NT_TRICKLE_PROB  = 0.10;
const NT_TRICKLE_SPEED = 0.25;


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

  window.lastSynapticRelease = {
    x, y, membraneX,
    life: 50
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

    vx: Math.cos(angle) * NT_INITIAL_SPEED,
    vy: Math.sin(angle) * NT_INITIAL_SPEED * 0.7,

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
      vx: random(0.15, NT_TRICKLE_SPEED),
      vy: random(-0.08, 0.08),
      membraneX: r.membraneX,
      life: random(220, 360),
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

    // ---- angular decorrelation (fan-out)
    const speed = Math.hypot(p.vx, p.vy);
    let angle = Math.atan2(p.vy, p.vx);
    angle += random(-NT_ANGULAR_NOISE, NT_ANGULAR_NOISE);

    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;

    // ---- drift + texture
    p.vx += NT_DRIFT_X + random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += NT_DRIFT_Y * Math.sign(p.y || random(-1,1));

    // ---- drag
    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

    // ---- position update
    p.x += p.vx;
    p.y += p.vy;

    // -------------------------------------------
    // PRESYNAPTIC MEMBRANE (LEFT WALL)
    // -------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = Math.abs(p.vx) * 0.6;
    }

    // -------------------------------------------
    // POSTSYNAPTIC MEMBRANE — ELASTIC SCATTER
    // -------------------------------------------
    const postX = p.membraneX + CLEFT_DEPTH;
    
    if (p.x > postX) {
    
      // reflect without pinning
      p.x = postX - (p.x - postX);
    
      // reverse + damp normal component
      p.vx = -Math.abs(p.vx) * random(0.45, 0.75);
    
      // add tangential scatter so NTs re-mix
      p.vy += random(-0.12, 0.12);
    
      // slight angular decorrelation on impact
      const speed = Math.hypot(p.vx, p.vy);
      const angle = atan2(p.vy, p.vx) + random(-0.25, 0.25);
    
      p.vx = cos(angle) * speed;
      p.vy = sin(angle) * speed;
    }


    // -------------------------------------------
    // ASTROCYTE / VERTICAL CONFINEMENT
    // -------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.y  = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
      p.vy *= -0.5;
    }

    // -------------------------------------------
    // NT–NT MICRO-REPULSION
    // -------------------------------------------
    for (let j = i - 1; j >= 0; j--) {
      const q = nts[j];
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      const d2 = dx*dx + dy*dy;

      if (d2 > 0 && d2 < NT_REPEL_RADIUS * NT_REPEL_RADIUS) {
        const d = Math.sqrt(d2);
        const f = (NT_REPEL_RADIUS - d) / NT_REPEL_RADIUS * NT_REPEL_FORCE;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;

        p.vx += fx;
        p.vy += fy;
        q.vx -= fx;
        q.vy -= fy;
      }
    }

    // -------------------------------------------
    // FADE + DEATH
    // -------------------------------------------
    p.alpha -= 0.6;
    p.life--;

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
