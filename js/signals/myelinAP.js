// =====================================================
// MYELINATED AXON ACTION POTENTIAL (SALTATORY)
// =====================================================
// Parallel conduction engine to axonSpike.js
// ❌ No terminal logic yet
// ❌ No synaptic release yet
// ✔ Node-to-node AP propagation
// =====================================================

console.log("myelinAP loaded");

// -----------------------------------------------------
// Parameters (visual + temporal)
// -----------------------------------------------------
const MYELIN_NODE_SPEED = 0.18;   // how fast AP jumps between nodes
const NODE_GLOW_RADIUS = 10;

// -----------------------------------------------------
// Active myelinated APs
// -----------------------------------------------------
const myelinAPs = [];

// -----------------------------------------------------
// Spawn myelinated AP at first node
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!neuron || !neuron.axon || !neuron.axon.myelinNodes) return;

  // prevent overlapping APs at first node
  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.nodeIndex === 0 && last.progress < 0.3) return;
  }

  myelinAPs.push({
    nodeIndex: 0,
    progress: 0
  });
}

// -----------------------------------------------------
// Update saltatory propagation
// -----------------------------------------------------
function updateMyelinAPs() {
  for (let i = myelinAPs.length - 1; i >= 0; i--) {
    const ap = myelinAPs[i];
    ap.progress += MYELIN_NODE_SPEED;

    if (ap.progress >= 1) {
      ap.progress = 0;
      ap.nodeIndex++;

      // reached end of axon (terminal logic later)
      if (ap.nodeIndex >= neuron.axon.myelinNodes.length) {
        myelinAPs.splice(i, 1);
      }
    }
  }
}

// -----------------------------------------------------
// Draw saltatory AP (node-locked)
// -----------------------------------------------------
function drawMyelinAPs() {
  if (!neuron || !neuron.axon || !neuron.axon.myelinNodes) return;

  myelinAPs.forEach(ap => {
    const node = neuron.axon.myelinNodes[ap.nodeIndex];
    if (!node) return;

    push();
    noStroke();
    fill(getColor("ap"));
    ellipse(node.x, node.y, NODE_GLOW_RADIUS, NODE_GLOW_RADIUS);
    pop();
  });
}

// -----------------------------------------------------
// Public API (for later switching)
// -----------------------------------------------------
window.spawnMyelinAP   = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;

