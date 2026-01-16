console.log("🫧 synapticBurst loaded — FLOAT-DRIFT CLEFT MODEL");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — FLOAT / DRIFT DOMINANT
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Drift-dominated motion
// ✔ Wide cleft filling
// ✔ Smooth laminar-like flow
// ✔ Minimal Brownian jitter
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// TUNING — DRIFT > DIFFUSION
// -----------------------------------------------------
const NT_BASE_COUNT = 22;

// Initial launch
const NT_INITIAL_SPEED = 0.35;     // 🔑 gives NTs momentum
const NT_INITIAL_SPREAD = 0.18;

// Motion model
const NT_DRIFT_X   = 0.035;        // main outward flow
const NT_DRIFT_Y   = 0.010;        // gentle vertical spreading

const NT_BROWNIAN  = 0.035;        // ↓ greatly reduced
const NT_DRAG      = 0.965;        // high inertia (smooth glide)

// Lifetime
const NT_LIFE_MIN = 260;
const NT_LIFE_MAX = 420;

// Visual
const NT_RADIUS = 2.4;

// Cleft bounds
const CLEFT_DEPTH  = 220;
const CLEFT_HEIGHT = 180;


// -----------------------------------------------------
// SECONDARY SPILL (POST-FUSION FLOAT)
// -----------------------------------------------------
const NT_TRICKLE_PROB = 0.10;
const NT_TRICKLE_SPEED = 0.25;


// -----------------------------------------------------
// EVENT — VESICLE-AUTHORITATIVE RELEASE
// -----------------------------------------------------
window.addEventListener("synapticRelease", (e) => {

  const { x, y, membraneX, strength = 1 } = e.detail || {};
  if (!isFinite(x) || !isFinite(y) || !isFinite(membraneX)) return;

  const count = Math.floor(NT_BASE_COUNT * strength);
  if (count <= 0) return;

  for (let i = 0; i < count; i++) {
    window.synapticNTs.push(makeNT(x, y, membraneX));
  }

  // Store release site for lingering spill
  window.lastSynapticRelease = {
    x, y, membraneX,
    life: 50
  };
});


// -----------------------------------------------------
// NT FACTORY — MOMENTUM-FIRST
// -----------------------------------------------------
function makeNT(x, y, membraneX) {

  const angle = random(-PI / 5, PI / 5); // mostly outward cone

  return {
    x: x + random(-2, 2),
    y: y + random(-4, 4),

    vx: cos(angle) * NT_INITIAL_SPEED,
    vy: sin(angle) * NT_INITIAL_SPEED * 0.6,

    membraneX,
    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// UPDATE — FLOAT / DRIFT DOMINANT
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;

  // -----------------------------------------------
  // SECONDARY FLOAT-SPILL
  // -----------------------------------------------
  const r = window.lastSynapticRelease;
  if (r && r.life-- > 0 && random() < NT_TRICKLE_PROB) {

    nts.push({
      x: r.x + random(-1, 1),
      y: r.y + random(-2, 2),
      vx: random(0.15, NT_TRICKLE_SPEED),
      vy: random(-0.08, 0.08),
      membraneX: r.membraneX,
      life: random(200, 340),
      alpha: 255
    });
  }
  if (r && r.life <= 0) window.lastSynapticRelease = null;


  // -----------------------------------------------
  // MAIN UPDATE LOOP
  // -----------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Gentle stochastic wobble (NOT dominant)
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // Laminar cleft flow
    p.vx += NT_DRIFT_X;
    p.vy += NT_DRIFT_Y * Math.sign(p.y || random(-1, 1));

    // Inertia
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    p.x += p.vx;
    p.y += p.vy;

    // -----------------------------------------------
    // PRESYNAPTIC MEMBRANE EXCLUSION
    // -----------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = abs(p.vx) * 0.2;
    }

    // -----------------------------------------------
    // SOFT VERTICAL CONFINEMENT
    // -----------------------------------------------
    if (abs(p.y) > CLEFT_HEIGHT) {
      p.vy *= -0.25;
      p.y = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
    }

    // -----------------------------------------------
    // FADE WITH DISTANCE
    // -----------------------------------------------
    if (p.x - p.membraneX > CLEFT_DEPTH) {
      p.alpha -= 1.2;
    }

    p.alpha -= 0.6;
    p.life--;

    if (p.life <= 0 || p.alpha <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — FLOATING CHEMICAL FIELD
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
