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

function getSaltatoryTargets(neuron, sheathCount = 3) {
  const path = neuron.axon.path;
  if (!path || path.length < 2) return [];

  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum[i] = cum[i - 1] +
      dist(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y);
  }
  const L = cum[cum.length - 1];

  const gapCount = sheathCount + 1;
  const targets = [];

  for (let g = 0; g <= gapCount; g++) {
    const d = (g / gapCount) * L;

    let idx = 0;
    while (idx < cum.length && cum[idx] < d) idx++;
    if (idx >= path.length) idx = path.length - 1;

    targets.push(path[idx]);
  }

  return targets;
}

// -----------------------------------------------------
// Spawn myelinated AP at first node
// -----------------------------------------------------
function spawnMyelinAP() {
  if (!window.myelinEnabled) return;
  if (!neuron?.axon?.path) return;

  const targets = getSaltatoryTargets(neuron);

  // prevent overlap at first gap
  if (myelinAPs.length > 0) {
    const last = myelinAPs[myelinAPs.length - 1];
    if (last.index === 0 && last.progress < 0.4) return;
  }

  myelinAPs.push({
    index: 0,
    progress: 0,
    targets
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
      ap.index++;

      // reached terminal end
      if (ap.index >= ap.targets.length - 1) {
        myelinAPs.splice(i, 1);
      }
    }
  }
}


// -----------------------------------------------------
// Draw saltatory AP (node-locked)
// -----------------------------------------------------
function drawMyelinAPs() {
  myelinAPs.forEach(ap => {
    const a = ap.targets[ap.index];
    const b = ap.targets[ap.index + 1];
    if (!a || !b) return;

    // Fast jump interpolation
    const t = constrain(ap.progress * 1.6, 0, 1);

    const x = lerp(a.x, b.x, t);
    const y = lerp(a.y, b.y, t);

    push();
    noStroke();
    fill(getColor("ap"));
    ellipse(x, y, NODE_GLOW_RADIUS, NODE_GLOW_RADIUS);
    pop();
  });
}


// -----------------------------------------------------
// Public API (for later switching)
// -----------------------------------------------------
window.spawnMyelinAP   = spawnMyelinAP;
window.updateMyelinAPs = updateMyelinAPs;
window.drawMyelinAPs   = drawMyelinAPs;

