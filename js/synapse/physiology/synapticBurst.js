console.log("🫧 synapticBurst loaded — EMISSION + LIFETIME ONLY");

// =====================================================
// SYNAPTIC NEUROTRANSMITTER BURST — ORCHESTRATOR
// =====================================================
//
// RESPONSIBILITIES:
// ✔ Receive synapticRelease events
// ✔ Emit NTs over time (streaming)
// ✔ Manage NT lifetime + alpha
// ✔ Delegate motion to NTmotion.js
// ✔ Delegate drawing to NTgeometry.js
//
// HARD RULES:
// • NO geometry definitions
// • NO constraint logic
// • NO membrane math
// • NO position clamping
// • NO force application
//
// =====================================================


// -----------------------------------------------------
// STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.synapticNTs       = window.synapticNTs       || [];
window.activeNTEmitters = window.activeNTEmitters || [];


// -----------------------------------------------------
// EMISSION TUNING (TIME DOMAIN ONLY)
// -----------------------------------------------------
const NT_STREAM_DURATION_MIN = 16;
const NT_STREAM_DURATION_MAX = 28;

const NT_PER_FRAME_MIN = 1;
const NT_PER_FRAME_MAX = 2;

const NT_LIFE_MIN = 1100;
const NT_LIFE_MAX = 1400;


// -----------------------------------------------------
// RELEASE EVENT — ENTRY POINT FROM VESICLES
// -----------------------------------------------------
//
// vesicleRelease.js is the ONLY file allowed
// to dispatch this event.
//
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
// NT FACTORY — STRUCTURE ONLY
// -----------------------------------------------------
//
// NO forces
// NO constraints
// NO geometry
//
function makeNT(x, y) {

  return {
    x: x + random(-4, 4),
    y: y + random(-6, 6),

    vx: random(-0.05, 0.05),
    vy: random(-0.05, 0.05),

    life: random(NT_LIFE_MIN, NT_LIFE_MAX),
    alpha: 255
  };
}


// -----------------------------------------------------
// MAIN UPDATE — ORCHESTRATION ONLY
// -----------------------------------------------------
function updateSynapticBurst() {

  const nts      = window.synapticNTs;
  const emitters = window.activeNTEmitters;

  // ---------------------------------------------------
  // 1️⃣ EMISSION (TIME-BASED STREAMING)
  // ---------------------------------------------------
  for (let i = emitters.length - 1; i >= 0; i--) {

    const e = emitters[i];
    const count = Math.floor(
      random(NT_PER_FRAME_MIN, NT_PER_FRAME_MAX + 1)
    );

    for (let k = 0; k < count; k++) {
      nts.push(makeNT(e.x, e.y));
    }

    if (--e.framesLeft <= 0) {
      emitters.splice(i, 1);
    }
  }

  if (!nts.length) return;

  // ---------------------------------------------------
  // 2️⃣ MOTION + CONSTRAINTS (DELEGATED)
  // ---------------------------------------------------
  //
  // NTmotion.js is the ONLY file allowed
  // to move NTs or apply membrane interaction
  //
  window.updateNTMotion?.(nts);

  // ---------------------------------------------------
  // 3️⃣ LIFETIME + ALPHA (OWNED HERE)
  // ---------------------------------------------------
  for (let i = nts.length - 1; i >= 0; i--) {

    const p = nts[i];
    p.life--;

    p.alpha = map(p.life, 0, NT_LIFE_MAX, 0, 255, true);

    if (p.life <= 0) {
      nts.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// DRAW — PURE DELEGATION
// -----------------------------------------------------
//
// NTgeometry.js is the ONLY file
// that knows how NTs look
//
function drawSynapticBurst() {

  if (!window.synapticNTs.length) return;
  window.drawNTGeometry?.(window.synapticNTs);
}


// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.updateSynapticBurst = updateSynapticBurst;
window.drawSynapticBurst   = drawSynapticBurst;


// -----------------------------------------------------
// 🔒 CONTRACT ASSERTION
// -----------------------------------------------------
if (window.DEBUG_SYNapseContracts) {
  console.log("🔒 synapticBurst contract: EMISSION + LIFETIME ONLY");
}
