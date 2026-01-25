console.log("🫧 NTmotion loaded — MOTION & CLEFT CONSTRAINT AUTHORITY");

// =====================================================
// NEUROTRANSMITTER MOTION — FORCE & INTEGRATION ONLY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Brownian motion
// ✔ Directed advection toward postsynapse
// ✔ Drag
// ✔ Elastic confinement to synaptic cleft
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

// Safety clamp
const NT_MAX_SPEED = 0.6;


// -----------------------------------------------------
// 🔧 CLEFT CONSTRAINT RESPONSE (ELASTIC, NO SLABS)
// -----------------------------------------------------

// Spring strength pulling NT back into cleft
const CLEFT_WALL_K = 0.12;

// Tangential damping when contacting cleft wall
const CLEFT_TANGENTIAL_DAMPING = 0.88;


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

  // cleftGeometry.js MUST be loaded
  if (
    typeof window.isInsideSynapticCleft !== "function" ||
    typeof window.projectToSynapticCleft !== "function"
  ) {
    console.warn("⚠️ NTmotion: cleftGeometry not available");
    return;
  }

  for (const p of nts) {

    // ---------------------------------------------
    // 1️⃣ Apply forces
    // ---------------------------------------------
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);

    // ---------------------------------------------
    // 2️⃣ Elastic synaptic cleft confinement
    // ---------------------------------------------
    if (!window.isInsideSynapticCleft(p.x, p.y)) {

      const projected =
        window.projectToSynapticCleft(p.x, p.y);

      // Spring force toward interior
      p.vx += (projected.x - p.x) * CLEFT_WALL_K;
      p.vy += (projected.y - p.y) * CLEFT_WALL_K;

      // Tangential damping
      p.vx *= CLEFT_TANGENTIAL_DAMPING;
      p.vy *= CLEFT_TANGENTIAL_DAMPING;
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
      const k = NT_MAX_SPEED / speed;
      p.vx *= k;
      p.vy *= k;
    }

    // ---------------------------------------------
    // 5️⃣ Integrate (ONLY place where position moves)
    // ---------------------------------------------
    p.x += p.vx;
    p.y += p.vy;
  }
};


// =====================================================
// 🟠 DEBUG DRAW — CLEFT CONSTRAINT (PHYSICS TRUTH)
// =====================================================
//
// Delegated to cleftGeometry.js
// This function exists ONLY for SynapseView compatibility
//
// =====================================================
window.drawNTConstraintDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  window.drawSynapticCleftDebug?.();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 NTmotion contract: FORCE + INTEGRATION ONLY (CLEFT-BOUND)");
}
