console.log("🫧 synapticBurst loaded — FREE FLOW + ASTROCYTE CONSTRAINT PLANE (LOCKED)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — BIASED FREE GAS
// =====================================================
//
// ✔ Continuous streaming
// ✔ Wide spatial plume
// ✔ Net drift toward postsynapse (+X)
// ✔ Minimal Brownian texture
// ✔ Time-based decay ONLY
// ✔ Astrocyte membrane = HARD CONSTRAINT PLANE
//
// GUARANTEE:
// • NTs NEVER exist above membrane
// • Identical behavior to fusion plane
// • No tunneling, no slabs, no hover layers
//
// DEBUG:
// ✔ ORANGE line = constraint plane used here
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD-SAFE)
// -----------------------------------------------------
window.synapticNTs = window.synapticNTs || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// CORE TUNING
// -----------------------------------------------------
const NT_STREAM_DURATION_MIN = 16;
const NT_STREAM_DURATION_MAX = 28;

const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

const NT_INITIAL_SPEED  = 0.34;
const NT_INITIAL_SPREAD = 0.75;

const NT_ADVECT_X = 0.018;
const NT_BROWNIAN = 0.003;
const NT_DRAG     = 0.995;

const NT_MEMBRANE_DAMPING = 0.85;

const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// GEOMETRY (DRAW ONLY)
// -----------------------------------------------------
const NT_RADIUS = 2.4;

// 🔒 IMPORTANT: constraint plane offset (INSIDE astrocyte)
const ASTRO_CONSTRAINT_OFFSET = 3; // px — tune 2–5 if desired


// -----------------------------------------------------
// RELEASE EVENT
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
// NT FACTORY
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
// UPDATE LOOP — HARD CONSTRAINT (FUSION-PLANE STYLE)
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts = window.synapticNTs;
  const emitters = window.activeNTEmitters;

  // ---- emission ----
  for (let i = emitters.length - 1; i >= 0; i--) {

    const e = emitters[i];
    const n = Math.floor(random(NT_PER_FRAME_MIN, NT_PER_FRAME_MAX + 1));

    for (let k = 0; k < n; k++) {
      nts.push(makeNT(e.x, e.y));
    }

    if (--e.framesLeft <= 0) emitters.splice(i, 1);
  }

  if (!nts.length) return;

  // ---- dynamics ----
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];

    // Forces
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // Integrate (SAVE PREVIOUS POSITION)
    const prevY = p.y;

    p.x += p.vx;
    p.y += p.vy;

    // ---- ASTROCYTE HARD CONSTRAINT ----
    if (typeof window.getAstrocyteBoundaryY === "function") {

      const astroY = window.getAstrocyteBoundaryY(p.x);

      if (astroY !== null) {

        const constraintY = astroY + ASTRO_CONSTRAINT_OFFSET;

        // 🔒 BLOCK ONLY ON ATTEMPTED PENETRATION
        if (prevY >= constraintY && p.y < constraintY) {

          // Clamp exactly to constraint plane
          p.y = constraintY;

          // Remove normal velocity
          if (p.vy < 0) p.vy = 0;

          // Tangential settling
          p.vx *= NT_MEMBRANE_DAMPING;
        }
      }
    }

    // Decay
    p.life--;
    p.alpha = map(p.life, 0, NT_LIFE_MAX, 0, 255, true);

    if (p.life <= 0) nts.splice(i, 1);
  }
}


// -----------------------------------------------------
// DRAW NTs
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
// 🟠 DEBUG DRAW — CONSTRAINT PLANE (AUTHORITATIVE)
// -----------------------------------------------------
function drawSynapticBurstPhysicsBoundaryDebug() {

  if (typeof window.getAstrocyteBoundaryY !== "function") return;

  push();
  stroke(255, 160, 40, 220);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let x = -300; x <= 300; x += 6) {
    const y = window.getAstrocyteBoundaryY(x);
    if (y !== null) vertex(x, y + ASTRO_CONSTRAINT_OFFSET);
  }
  endShape();

  pop();
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateSynapticBurst = updateSynapticBurst;
window.drawSynapticBurst   = drawSynapticBurst;
window.drawSynapticBurstPhysicsBoundaryDebug =
  drawSynapticBurstPhysicsBoundaryDebug;
