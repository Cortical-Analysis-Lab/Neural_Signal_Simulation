// =====================================================
// MYELINATED AXON ACTION POTENTIAL (CONTINUOUS + OCCLUDED)
// =====================================================
// ✔ Continuous conduction along axon
// ✔ Faster under myelin
// ✔ Slower and visible at gaps (nodes)
// ✔ Same axon geometry as unmyelinated AP
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters (INTENTIONALLY SLOW FOR DEBUGGING)
// -----------------------------------------------------
const MYELIN_SPEED_NODE   = 0.035; // slow + visible
const MYELIN_SPEED_SHEATH = 0.08;  // fast + invisible
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

  // Prevent overlapping APs at hillock
  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.phase < 0.08) return;
  }

  myelinAPs.push({
    phase: 0
  });
}

// -----------------------------------------------------
// Helper — is this phase under a myelin sheath?
// -----------------------------------------------------
function isPhaseUnderMyelin(phase, sheathCount = 4) {
  for (let s = 1; s <= sheathCount; s++) {
    const center = s / (sheathCount + 1);
    const halfWidth = 0.03; // 👈 sheath length (DEBUG FRIENDLY)

    if (phase > center - halfWidth && phase < center + halfWidth) {
      return true;
    }
  }
  return false;
}

// -----------------------------------------------------
// Update AP propagation (variable speed)
// -----------------------------------------------------
function updateMyelinAPs() {
  for (let i = myelinAPs.length - 1; i >= 0; i--) {
    const ap = myelinAPs[i];

    const underMyelin = isPhaseUnderMyelin(ap.phase);

    ap.phase += underMyelin
      ? MYELIN_SPEED_SHEATH   // fast + hidden
      : MYELIN_SPEED_NODE;    // slow + visible

    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP (VISIBLE ONLY AT GAPS)
// -----------------------------------------------------
function drawMyelinAPs() {
  myelinAPs.forEach(ap => {

    // ❌ Hidden while under myelin
    if (isPhaseUnderMyelin(ap.phase)) return;

    const p = getAxonPoint(ap.phase);
    if (!p) return;

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
