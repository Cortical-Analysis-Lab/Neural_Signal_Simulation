// =====================================================
// MYELINATED AXON ACTION POTENTIAL (CONTINUOUS + OCCLUDED)
// =====================================================
// ✔ Continuous conduction along axon
// ✔ Faster than unmyelinated (configurable)
// ✔ Invisible ONLY under myelin sheaths
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters (INTENTIONALLY SLOW FOR DEBUGGING)
// -----------------------------------------------------
const MYELIN_CONDUCTION_SPEED = 0.01; // 🔥 slow on purpose
const AP_RADIUS = 10;

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!window.myelinEnabled) return;

  // prevent overlap at hillock
  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.phase < 0.08) return;
  }

  myelinAPs.push({
    phase: 0
  });
}

// -----------------------------------------------------
// Update AP propagation
// -----------------------------------------------------
function updateMyelinAPs() {
  for (let i = myelinAPs.length - 1; i >= 0; i--) {
    const ap = myelinAPs[i];
    ap.phase += MYELIN_CONDUCTION_SPEED;

    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Helper — is this phase under a myelin sheath?
// -----------------------------------------------------
function isPhaseUnderMyelin(phase, sheathCount = 4) {
  const gapCount = sheathCount + 1;

  for (let s = 1; s <= sheathCount; s++) {
    const center = s / (sheathCount + 1);
    const halfWidth = 0.02; // 👈 controls sheath length (DEBUG FRIENDLY)

    if (phase > center - halfWidth && phase < center + halfWidth) {
      return true;
    }
  }
  return false;
}

// -----------------------------------------------------
// Draw AP (visible only in gaps)
// -----------------------------------------------------
function drawMyelinAPs() {
  myelinAPs.forEach(ap => {

    // ❌ hide AP only when under myelin
    if (isPhaseUnderMyelin(ap.phase)) return;

    const p = getAxonPoint(ap.phase);

    push();
    noStroke();
    fill(getColor("ap"));
    ellipse(p.x, p.y, AP_RADIUS, AP_RADIUS);
    pop();
  });
}

// -----------------------------------------------------
// Public API
// -----------------------------------------------------
window.spawnMyelinAP   = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;
