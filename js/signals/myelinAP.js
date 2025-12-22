// =====================================================
// MYELINATED AXON ACTION POTENTIAL (SALTATORY-LIKE)
// =====================================================
// Continuous axon propagation
// ✔ Faster than unmyelinated
// ✔ Invisible ONLY under myelin
// ✔ Clearly visible in gaps
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Speed tuning (CRITICAL)
// -----------------------------------------------------
const MYELIN_SPEED_VISIBLE = 0.035; // visible & smooth
const MYELIN_SPEED_HIDDEN  = 0.12; // fast but not teleporting

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Myelin sheath PHASE intervals (tight!)
// -----------------------------------------------------
function getMyelinPhaseIntervals(neuron) {
  const SHEATH_COUNT = 4;
  const SHEATH_WIDTH = 0.02; // 👈 VERY IMPORTANT (small!)

  const intervals = [];

  for (let s = 1; s <= SHEATH_COUNT; s++) {
    const center = s / (SHEATH_COUNT + 1);
    intervals.push({
      start: center - SHEATH_WIDTH * 0.5,
      end:   center + SHEATH_WIDTH * 0.5
    });
  }

  return intervals;
}

// -----------------------------------------------------
// Spawn AP at AIS
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!window.myelinEnabled) return;

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

    const hidden = ap.intervals.some(
      seg => ap.phase >= seg.start && ap.phase <= seg.end
    );

    ap.phase += hidden
      ? MYELIN_SPEED_HIDDEN
      : MYELIN_SPEED_VISIBLE;

    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP (ONLY in gaps)
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
