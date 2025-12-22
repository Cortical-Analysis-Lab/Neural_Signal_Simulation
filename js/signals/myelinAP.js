// =====================================================
// MYELINATED AXON ACTION POTENTIAL (CONTINUOUS + OCCLUDED)
// =====================================================
// ✔ Continuous conduction along axon
// ✔ Faster under myelin
// ✔ Visible at nodes only
// ✔ Piggybacks terminal propagation + neurotransmitter release
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters (still slow for verification)
// -----------------------------------------------------
const MYELIN_SPEED_NODE   = 0.006; // visible
const MYELIN_SPEED_SHEATH = 0.04;  // invisible + fast
const AP_RADIUS = 10;

// Must match axonSpike.js
const AXON_TERMINAL_START = 0.75;

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Spawn AP at axon hillock
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!window.myelinEnabled) return;

  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.phase < 0.08) return;
  }

  myelinAPs.push({ phase: 0 });
}

// -----------------------------------------------------
// Helper — is phase under myelin?
// -----------------------------------------------------
function isPhaseUnderMyelin(phase, sheathCount = 4) {
  for (let s = 1; s <= sheathCount; s++) {
    const center = s / (sheathCount + 1);
    const halfWidth = 0.03;

    if (phase > center - halfWidth && phase < center + halfWidth) {
      return true;
    }
  }
  return false;
}

// -----------------------------------------------------
// Update AP propagation + terminal handoff
// -----------------------------------------------------
function updateMyelinAPs() {
  for (let i = myelinAPs.length - 1; i >= 0; i--) {
    const ap = myelinAPs[i];

    const underMyelin = isPhaseUnderMyelin(ap.phase);

    ap.phase += underMyelin
      ? MYELIN_SPEED_SHEATH
      : MYELIN_SPEED_NODE;

    // 🔑 HANDOFF TO TERMINAL LOGIC
    if (ap.phase >= AXON_TERMINAL_START) {
      if (typeof spawnTerminalSpikes === "function") {
        spawnTerminalSpikes(); // reuse existing machinery
      }
      myelinAPs.splice(i, 1);
      continue;
    }

    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw AP (visible only at nodes)
// -----------------------------------------------------
function drawMyelinAPs() {
  myelinAPs.forEach(ap => {
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
