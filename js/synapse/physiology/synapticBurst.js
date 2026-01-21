console.log("🫧 synapticBurst loaded — FREE FLOW + ASTROCYTE CONSTRAINT (FUSION-PLANE STYLE)");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — BIASED FREE GAS
// =====================================================
//
// ✔ Continuous streaming
// ✔ Wide spatial plume
// ✔ Net drift toward postsynapse (+X)
// ✔ Minimal Brownian texture
// ✔ Time-based decay ONLY
// ✔ Astrocyte membrane = HARD CONSTRAINT SURFACE
//
// GUARANTEES:
// • NTs NEVER exist inside astrocyte
// • Constraint matches membrane exactly
// • NO slabs, NO hover layers
// • Crossing-based (IDENTICAL TO FUSION PLANE)
//
// DEBUG:
// • ORANGE = constraint surface used here
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

const NT_INITIAL_SPEED  = 0.26;
const NT_INITIAL_SPREAD = 0.95;

const NT_ADVECT_X = 0.018;
const NT_BROWNIAN = 0.003;
const NT_DRAG     = 0.985;

const NT_MEMBRANE_DAMPING = 0.85;

const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// GEOMETRY (DRAW ONLY)
// -----------------------------------------------------
const NT_RADIUS = 2.4;


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
// UPDATE LOOP — CROSSING-BASED CONSTRAINT
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

    // forces
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // store previous position
    const prevY = p.y;

    // --- integrate ---
    p.x += p.vx;
    p.y += p.vy;
    
    // -------------------------------------------------
    // ASTROCYTE HARD CONSTRAINT — HALF-SPACE ENFORCEMENT
    // -------------------------------------------------
    if (typeof window.getAstrocyteBoundaryY === "function") {
    
      const astroY = window.getAstrocyteBoundaryY(p.x);
    
      if (astroY !== null) {
    
        // NTs are only allowed BELOW the membrane (larger Y)
        if (p.y < astroY) {
    
          // Clamp exactly to membrane
          p.y = astroY;
    
          // Remove velocity INTO astrocyte
          if (p.vy < 0) p.vy = 0;
    
          // Tangential damping (slide & settle)
          p.vx *= NT_MEMBRANE_DAMPING;
        }
      }
    }


    // decay
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
// 🟠 DEBUG DRAW — CONSTRAINT SURFACE
// -----------------------------------------------------
function drawSynapticBurstPhysicsBoundaryDebug() {

  if (typeof window.getAstrocyteBoundaryY !== "function") return;

  push();
  stroke(255, 160, 40, 220);
  strokeWeight(2);
  noFill();

  beginShape();
  for (let x = window.ASTRO_X_MIN; x <= window.ASTRO_X_MAX; x += 6) {
    const y = window.getAstrocyteBoundaryY(x);
    if (y !== null) vertex(x, y);
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
