console.log("🫧 synapticBurst loaded — FLOAT / DRIFT CLEFT MODEL (SPILLING)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — DRIFT-DOMINANT
// =====================================================
//
// ✔ Vesicle-authoritative release
// ✔ Strong outward flow (membrane → cleft)
// ✔ Wide fan-out, laminar feel
// ✔ Brownian motion is SECONDARY
// ✔ Sustained spill after fusion
//
// CONTRACT (UNCHANGED):
// • Presynaptic LOCAL space only
// • membraneX provided per release
// • No geometry lookups here
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];


// -----------------------------------------------------
// TUNING — AUTHORITATIVE
// -----------------------------------------------------
const NT_BASE_COUNT = 22;

// Initial release
const NT_INITIAL_SPEED  = 0.42;     // 🔑 gives real momentum
const NT_INITIAL_SPREAD = 0.35;     // angular fan-out
const NT_INITIAL_JITTER = 0.08;

// Drift field (dominant)
const NT_DRIFT_X = 0.045;           // 🔑 sustained outward flow
const NT_DRIFT_Y = 0.012;

// Diffusion (secondary)
const NT_BROWNIAN = 0.025;
const NT_DIFFUSION = 0.04;

// Drag (anisotropic)
const NT_DRAG_X = 0.975;            // preserve outward motion
const NT_DRAG_Y = 0.94;

// Lifetime
const NT_LIFE_MIN = 280;
const NT_LIFE_MAX = 420;

// Visual
const NT_RADIUS = 2.4;

// Cleft bounds
const CLEFT_DEPTH  = 220;
const CLEFT_HEIGHT = 180;


// -----------------------------------------------------
// POST-FUSION SPILL (LINGERING RELEASE)
// -----------------------------------------------------
const NT_TRICKLE_PROB  = 0.10;
const NT_TRICKLE_SPEED = 0.26;


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

  // Store release site for sustained spill
  window.lastSynapticRelease = {
    x, y, membraneX,
    life: 50
  };
});


// -----------------------------------------------------
// NT FACTORY — MOMENTUM FIRST
// -----------------------------------------------------
function makeNT(x, y, membraneX) {

  const angle = random(
    -NT_INITIAL_SPREAD,
     NT_INITIAL_SPREAD
  );

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
// UPDATE — DRIFT DOMINANT
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  const r   = window.lastSynapticRelease;

  // -----------------------------------------------
  // SECONDARY FLOAT-SPILL
  // -----------------------------------------------
  if (r && r.life-- > 0 && random() < NT_TRICKLE_PROB) {
    nts.push({
      x: r.x + random(-1, 1),
      y: r.y + random(-2, 2),
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
  // MAIN UPDATE LOOP
  // -----------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // --- weak diffusion (texture only)
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // --- laminar cleft flow (dominant)
    p.vx += NT_DRIFT_X;
    p.vy += NT_DRIFT_Y * Math.sign(p.y || random(-1, 1));

    // --- drag (direction-aware)
    p.vx *= NT_DRAG_X;
    p.vy *= NT_DRAG_Y;

    p.x += p.vx;
    p.y += p.vy;

    // -----------------------------------------------
    // PRESYNAPTIC MEMBRANE EXCLUSION
    // -----------------------------------------------
    if (p.x < p.membraneX + 1.5) {
      p.x  = p.membraneX + 1.5;
      p.vx = Math.max(0.12, Math.abs(p.vx) * 0.4);
    }

    // -----------------------------------------------
    // SOFT VERTICAL CONFINEMENT
    // -----------------------------------------------
    if (Math.abs(p.y) > CLEFT_HEIGHT) {
      p.vy *= -0.25;
      p.y = constrain(p.y, -CLEFT_HEIGHT, CLEFT_HEIGHT);
    }

    // -----------------------------------------------
    // FADE WITH DISTANCE
    // -----------------------------------------------
    if (p.x - p.membraneX > CLEFT_DEPTH) {
      p.alpha -= 1.2;
    }

    // Lifetime decay
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
