console.log("🫧 NTmotion loaded — MOTION & CONSTRAINT AUTHORITY");

// =====================================================
// NEUROTRANSMITTER MOTION — FORCE & INTEGRATION ONLY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Brownian motion
// ✔ Directed advection toward postsynapse
// ✔ Drag
// ✔ Elastic astrocyte membrane confinement (NO SLABS)
//
// HARD RULES:
// • NEVER draw NTs
// • NEVER spawn NTs
// • NEVER define geometry
// • NEVER fade alpha
// • NEVER clamp position directly
//
// =====================================================


// -----------------------------------------------------
// 🔧 MOTION TUNING (PHYSICS ONLY)
// -----------------------------------------------------

// Mean forward drift (toward postsynapse)
const NT_ADVECT_X = 0.01;

// Brownian noise
const NT_BROWNIAN = 0.003;

// Global drag
const NT_DRAG = 0.985;


// -----------------------------------------------------
// 🔧 ASTROCYTE CONSTRAINT (ELASTIC — NO SLAB)
// -----------------------------------------------------

// Spring response to penetration
const ASTRO_WALL_K = 0.12;

// Tangential damping when contacting membrane
const ASTRO_TANGENTIAL_DAMPING = 0.88;

// Safety clamp
const NT_MAX_SPEED = 0.6;


// -----------------------------------------------------
// MAIN UPDATE — FORCE + INTEGRATION ONLY
// -----------------------------------------------------
//
// Expects NT objects of shape:
//   { x, y, vx, vy }
//
// -----------------------------------------------------
window.updateNTMotion = function (nts) {

  if (!Array.isArray(nts) || nts.length === 0) return;
  if (typeof window.getAstrocytePenetration !== "function") return;

  for (const p of nts) {

    // ---------------------------------------------
    // 1️⃣ Apply forces
    // ---------------------------------------------
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // ---------------------------------------------
    // 2️⃣ Elastic astrocyte confinement
    // ---------------------------------------------
    //
    // penetration > 0 → NT is inside astrocyte
    //
    const penetration = window.getAstrocytePenetration(p.x, p.y);

    if (penetration !== null && penetration > 0) {

      // Normal push OUT of astrocyte
      p.vy += penetration * ASTRO_WALL_K;

      // Kill inward normal velocity
      if (p.vy < 0) p.vy = 0;

      // Tangential settling along membrane
      p.vx *= ASTRO_TANGENTIAL_DAMPING;
    }

    // ---------------------------------------------
    // 3️⃣ Drag
    // ---------------------------------------------
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;

    // ---------------------------------------------
    // 4️⃣ Safety speed clamp
    // ---------------------------------------------
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > NT_MAX_SPEED) {
      p.vx *= NT_MAX_SPEED / speed;
      p.vy *= NT_MAX_SPEED / speed;
    }

    // ---------------------------------------------
    // 5️⃣ Integrate (ONLY place where position moves)
    // ---------------------------------------------
    p.x += p.vx;
    p.y += p.vy;
  }
};


// =====================================================
// 🟠 DEBUG DRAW — NT CONSTRAINT SURFACE (PHYSICS TRUTH)
// =====================================================
//
// • Draws the ACTUAL constraint used by NT physics
// • Samples authoritative astrocyte geometry
// • NO slabs possible
// • Visual only
//
// =====================================================
window.drawNTConstraintDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;
  if (typeof window.getAstrocyteMembraneY !== "function") return;

  push();
  stroke(255, 160, 40, 220); // orange
  strokeWeight(2);
  noFill();

  beginShape();
  for (let x = window.ASTRO_X_MIN; x <= window.ASTRO_X_MAX; x += 6) {
    const y = window.getAstrocyteMembraneY(x);
    if (y !== null) vertex(x, y);
  }
  endShape();

  pop();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 NTmotion contract: FORCE + INTEGRATION ONLY");
}
