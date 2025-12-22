// =====================================================
// MYELINATED AXON ACTION POTENTIAL (SALTATORY-LIKE)
// =====================================================
// Continuous propagation like axonSpike.js
// ✔ Faster conduction
// ✔ Invisible through myelin sheaths
// ✔ Visible in gaps / AIS / terminal region
// ❌ No terminal branching yet
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Speed parameters
// -----------------------------------------------------
const MYELIN_SPEED_VISIBLE = 0.045; // slightly faster than unmyelinated
const MYELIN_SPEED_HIDDEN  = 0.22;  // very fast under myelin

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Compute myelin sheath PHASE intervals
// (must match visual sheath placement)
// -----------------------------------------------------
function getMyelinPhaseIntervals(neuron, sheathCount = 4, sheathFrac = 0.06) {
  const intervals = [];

  for (let s = 1; s <= sheathCount; s++) {
    const center = s / (sheathCount + 1);
    const half   = sheathFrac * 0.5;

    intervals.push({
      start: center - half,
      end:   center + half
    });
  }

  return intervals;
}

// -----------------------------------------------------
// Spawn myelinated AP at AIS
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!window.myelinEnabled) return;
  if (!neuron) return;

  // Prevent overlap near AIS
  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.phase < 0.1) return;
  }

  myelinAPs.push({
    phase: 0,
    intervals: getMyelinPhaseIntervals(neuron)
  });
}

// -----------------------------------------------------
// Update propagation
// -----------------------------------------------------
function updateMyelinAPs() {
  for (let i = myelinAPs.length - 1; i >= 0; i--) {
    const ap = myelinAPs[i];

    const inSheath = ap.intervals.some(
      seg => ap.phase >= seg.start && ap.phase <= seg.end
    );

    ap.phase += inSheath
      ? MYELIN_SPEED_HIDDEN
      : MYELIN_SPEED_VISIBLE;

    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP (ONLY when not under myelin)
// -----------------------------------------------------
function drawMyelinAPs() {
  myelinAPs.forEach(ap => {

    const hidden = ap.intervals.some(
      seg => ap.phase >= seg.start && ap.phase <= seg.end
    );

    if (hidden) return;

    const p = getAxonPoint(ap.phase);

    push();
    noStroke();
    fill(getColor("ap"));
    ellipse(p.x, p.y, 10, 10);
    pop();
  });
}

// -----------------------------------------------------
// Public API
// -----------------------------------------------------
window.spawnMyelinAP   = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;
