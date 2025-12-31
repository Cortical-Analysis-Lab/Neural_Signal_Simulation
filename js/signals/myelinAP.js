// =====================================================
// MYELINATED AXON ACTION POTENTIAL (CONTINUOUS + OCCLUDED)
// =====================================================
// ✔ Continuous electrical conduction under myelin
// ✔ Faster under myelin, slower at nodes
// ✔ Visible at nodes only
// ✔ Na⁺ influx triggered JUST BEFORE node
// ✔ K⁺ efflux triggered AT node
// ✔ Geometry-accurate (path-index based, NOT guessed)
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const MYELIN_SPEED_NODE   = 0.035;
const MYELIN_SPEED_SHEATH = 0.08;
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

  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.phase < 0.08) return;
  }

  myelinAPs.push({
    phase: 0,
    lastPhase: 0,
    firedNa: new Set(),
    firedK:  new Set()
  });
}

// -----------------------------------------------------
// Helper — is phase under myelin?
// (visual-only gating, not physiology)
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
// Helper — convert node.pathIndex → phase
// -----------------------------------------------------
function nodePhaseFromPathIndex(node) {
  const path = neuron?.axon?.path;
  if (!path || path.length < 2) return null;

  return node.pathIndex / (path.length - 1);
}

// -----------------------------------------------------
// Update AP propagation + node-gated ion flow
// -----------------------------------------------------
function updateMyelinAPs() {

  const nodes = neuron?.axon?.nodes;
  const path  = neuron?.axon?.path;
  if (!nodes || !path || nodes.length === 0) return;

  for (let i = myelinAPs.length - 1; i >= 0; i--) {

    const ap = myelinAPs[i];
    ap.lastPhase = ap.phase;

    // -----------------------------
    // Continuous conduction
    // -----------------------------
    const underMyelin = isPhaseUnderMyelin(ap.phase);

    ap.phase += underMyelin
      ? MYELIN_SPEED_SHEATH
      : MYELIN_SPEED_NODE;

    // -----------------------------
    // NODE-CROSSED DETECTION
    // -----------------------------
    for (let n = 0; n < nodes.length; n++) {

      const node = nodes[n];
      const nodePhase = nodePhaseFromPathIndex(node);
      if (nodePhase == null) continue;

      // 🔵 Na⁺ — just BEFORE node
      if (
        ap.lastPhase < nodePhase &&
        ap.phase >= nodePhase &&
        !ap.firedNa.has(n)
      ) {
        ap.firedNa.add(n);

        if (typeof triggerNodeNaInflux === "function") {
          triggerNodeNaInflux(n);
        }
      }

      // 🟣 K⁺ — AT node (same crossing)
      if (
        ap.lastPhase < nodePhase &&
        ap.phase >= nodePhase &&
        !ap.firedK.has(n)
      ) {
        ap.firedK.add(n);

        if (typeof triggerNodeKEfflux === "function") {
          triggerNodeKEfflux(n);
        }
      }
    }

    // -----------------------------
    // Terminal handoff
    // -----------------------------
    if (ap.phase >= AXON_TERMINAL_START) {

      if (typeof spawnTerminalSpikes === "function") {
        spawnTerminalSpikes();
      }

      myelinAPs.splice(i, 1);
      continue;
    }

    // Safety cleanup
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
window.spawnMyelinAP    = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;
