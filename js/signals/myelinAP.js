// =====================================================
// MYELINATED AXON ACTION POTENTIAL (CONTINUOUS + OCCLUDED)
// =====================================================
// ✔ Continuous electrical conduction under myelin
// ✔ Faster under myelin, slower at nodes
// ✔ Visible at nodes only
// ✔ Na⁺ influx triggered at NEXT node (pre-node segment)
// ✔ K⁺ efflux triggered AT node
// ✔ Reuses terminal propagation + neurotransmitter release
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters (still slow for verification)
// -----------------------------------------------------
const MYELIN_SPEED_NODE   = 0.035; // exposed / nodal
const MYELIN_SPEED_SHEATH = 0.08;  // insulated / internodal
const AP_RADIUS = 10;

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Node trigger guards (prevent retriggering)
// -----------------------------------------------------
let lastNaNodeIdx = -1;
let lastKNodeIdx  = -1;

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
// Update AP propagation + node-gated ion flow
// -----------------------------------------------------
function updateMyelinAPs() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes || nodes.length < 2) return;

  for (let i = myelinAPs.length - 1; i >= 0; i--) {

    const ap = myelinAPs[i];

    // -----------------------------
    // Continuous conduction
    // -----------------------------
    const underMyelin = isPhaseUnderMyelin(ap.phase);

    ap.phase += underMyelin
      ? MYELIN_SPEED_SHEATH
      : MYELIN_SPEED_NODE;

    // -----------------------------
    // Map phase → node index
    // -----------------------------
    const nodeFloat = ap.phase * (nodes.length - 1);
    const nodeIdx   = Math.floor(nodeFloat);

    // -----------------------------
    // 🔵 Na⁺ INFLUX (PRE-NODE)
    // Triggered when AP enters the
    // segment BEFORE the node
    // -----------------------------
    if (
      nodeIdx > lastNaNodeIdx &&
      nodes[nodeIdx + 1]
    ) {
      lastNaNodeIdx = nodeIdx;

      if (typeof triggerNodeNaInflux === "function") {
        triggerNodeNaInflux(nodeIdx + 1);
      }
    }

    // -----------------------------
    // 🟣 K⁺ EFFLUX (AT NODE)
    // Triggered when AP reaches node
    // -----------------------------
    if (
      nodeIdx > lastKNodeIdx &&
      nodes[nodeIdx]
    ) {
      lastKNodeIdx = nodeIdx;

      if (typeof triggerNodeKEfflux === "function") {
        triggerNodeKEfflux(nodeIdx);
      }
    }

    // -----------------------------
    // Terminal handoff (unchanged)
    // -----------------------------
    if (ap.phase >= AXON_TERMINAL_START) {

      if (typeof spawnTerminalSpikes === "function") {
        spawnTerminalSpikes();
      }

      myelinAPs.splice(i, 1);
      lastNaNodeIdx = -1;
      lastKNodeIdx  = -1;
      continue;
    }

    // Safety cleanup
    if (ap.phase >= 1) {
      myelinAPs.splice(i, 1);
      lastNaNodeIdx = -1;
      lastKNodeIdx  = -1;
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
window.spawnMyelinAP    = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;
