console.log("🫧 NTmotion loaded — MOTION & CLEFT CONSTRAINT AUTHORITY");

// =====================================================
// NEUROTRANSMITTER MOTION — FORCE & INTEGRATION ONLY
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Brownian motion
// ✔ Directed advection toward postsynapse
// ✔ Drag
// ✔ OPTIONAL elastic confinement to synaptic cleft
//
// HARD RULES:
// • NEVER draw NTs
// • NEVER spawn NTs
// • NEVER define geometry
// • NEVER fade alpha
// • NEVER clamp position directly
//
// ALL CONSTRAINT GEOMETRY IS OWNED BY:
// → cleftGeometry.js
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
// 🔧 CLEFT CONSTRAINT RESPONSE (ELASTIC)
// -----------------------------------------------------

// Spring strength pulling NT back into cleft
const CLEFT_WALL_K = 0.12;

// Tangential damping when contacting cleft wall
const CLEFT_TANGENTIAL_DAMPING = 0.88;


// -----------------------------------------------------
// 🔍 DETECT WHETHER CLEFT PHYSICS IS ACTIVE
// -----------------------------------------------------
//
// If cleftGeometry is in DEBUG mode, these functions
// are pass-through stubs and confinement must be skipped.
//
function cleftPhysicsEnabled() {

  if (
    typeof window.isInsideSynapticCleft !== "function" ||
    typeof window.projectToSynapticCleft !== "function"
  ) {
    return false;
  }

  // Heuristic: debug stubs always return true
  // We test with an impossible point
  return window.isInsideSynapticCleft(1e9, 1e9) === false;
}


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

  const useCleftConstraint = cleftPhysicsEnabled();

  for (const p of nts) {

    // ---------------------------------------------
    // 1️⃣ Apply free-space forces
    // ---------------------------------------------
    p.vx += NT_ADVECT_X;
    p.vx += random(-NT_BROWNIAN, NT_BROWNIAN);
    p.vy += random(-NT_BROWNIAN, NT_BROWNIAN);


    // ---------------------------------------------
    // 2️⃣ Predict next position
    // ---------------------------------------------
    const nx = p.x + p.vx;
    const ny = p.y + p.vy;


    // ---------------------------------------------
    // 3️⃣ OPTIONAL cleft confinement
    // ---------------------------------------------
    if (useCleftConstraint && !window.isInsideSynapticCleft(nx, ny)) {

      const projected =
        window.projectToSynapticCleft(nx, ny);

      const dx = projected.x - nx;
      const dy = projected.y - ny;

      // Elastic normal response
      p.vx += dx * CLEFT_WALL_K;
      p.vy += dy * CLEFT_WALL_K;

      // Tangential damping
      p.vx *= CLEFT_TANGENTIAL_DAMPING;
      p.vy *= CLEFT_TANGENTIAL_DAMPING;
    }


    // ---------------------------------------------
    // 4️⃣ Drag
    // ---------------------------------------------
    p.vx *= NT_DRAG;
    p.vy *= NT_DRAG;


    // ---------------------------------------------
    // 5️⃣ Safety speed clamp
    // ---------------------------------------------
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > NT_MAX_SPEED) {
      const k = NT_MAX_SPEED / speed;
      p.vx *= k;
      p.vy *= k;
    }


    // ---------------------------------------------
    // 6️⃣ Integrate (ONLY place position changes)
    // ---------------------------------------------
    p.x += p.vx;
    p.y += p.vy;
  }
};


// -----------------------------------------------------
// 🟠 DEBUG DRAW — DELEGATED
// -----------------------------------------------------
window.drawNTConstraintDebug = function () {

  if (!window.SHOW_SYNAPSE_DEBUG) return;

  window.drawSynapticCleftDebug?.();
};


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 NTmotion contract: FORCE + INTEGRATION ONLY");
}
