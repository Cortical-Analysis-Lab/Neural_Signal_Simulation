// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Node-of-Ranvier only
// ✔ Event-driven
// ✔ Directed transmembrane flux
// ✔ Na⁺ drawn INTO axon
// ✔ K⁺ expelled OUT of axon
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// VISUAL / PHYSIOLOGY TUNING
// -----------------------------------------------------

// Radii
const NODE_RADIUS          = 10;
const NODE_NA_SPAWN_RADIUS = 20;
const NODE_K_SPAWN_RADIUS  = 12;

// Lifetimes
const NODE_NA_LIFETIME = 34;
const NODE_K_LIFETIME  = 46;

// Burst sizes
const NODE_NA_BURST_PER_SIDE = 4;
const NODE_K_BURST_COUNT    = 6;

// Force magnitudes
const NA_ATTRACTION_FORCE = 0.9;   // pull inward
const K_REPULSION_FORCE   = 1.4;   // push outward

// Damping
const NA_DAMPING = 0.90;
const K_DAMPING  = 0.88;

// -----------------------------------------------------
// Na⁺ INFLUX — STRONGLY INWARD
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  [-1, +1].forEach(side => {
    for (let i = 0; i < NODE_NA_BURST_PER_SIDE; i++) {

      const x = node.x + side * NODE_NA_SPAWN_RADIUS;
      const y = node.y + random(-6, 6);

      ecsIons.NodeNa.push({
        x,
        y,

        // initial velocity toward node
        vx: (node.x - x) * 0.08,
        vy: (node.y - y) * 0.08,

        life: NODE_NA_LIFETIME + random(-6, 6)
      });
    }
  });
}

// -----------------------------------------------------
// K⁺ EFFLUX — STRONGLY OUTWARD
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let i = 0; i < NODE_K_BURST_COUNT; i++) {

    const angle = random(TWO_PI);
    const r = NODE_K_SPAWN_RADIUS;

    const x = node.x + cos(angle) * r;
    const y = node.y + sin(angle) * r;

    ecsIons.NodeK.push({
      x,
      y,

      // initial velocity away from node
      vx: cos(angle) * K_REPULSION_FORCE,
      vy: sin(angle) * K_REPULSION_FORCE,

      life: NODE_K_LIFETIME + random(-8, 8)
    });
  }
}

// -----------------------------------------------------
// DRAW — APPLY FORCE FIELDS EACH FRAME
// -----------------------------------------------------
function drawNodeIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -----------------------------
  // Na⁺ — ATTRACTIVE FIELD
  // -----------------------------
  fill(getColor("sodium", 200));

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;

    // Pull toward nearest node center
    const node = findClosestNode(p.x, p.y);
    if (node) {
      const dx = node.x - p.x;
      const dy = node.y - p.y;
      p.vx += dx * 0.02 * NA_ATTRACTION_FORCE;
      p.vy += dy * 0.02 * NA_ATTRACTION_FORCE;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NA_DAMPING;
    p.vy *= NA_DAMPING;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -----------------------------
  // K⁺ — REPULSIVE FIELD
  // -----------------------------
  fill(getColor("potassium", 180));

  ecsIons.NodeK = ecsIons.NodeK.filter(p => {
    p.life--;

    const node = findClosestNode(p.x, p.y);
    if (node) {
      const dx = p.x - node.x;
      const dy = p.y - node.y;
      p.vx += dx * 0.03 * K_REPULSION_FORCE;
      p.vy += dy * 0.03 * K_REPULSION_FORCE;
    }

    p.x += p.vx;
    p.y += p.vy;
    p.vx *= K_DAMPING;
    p.vy *= K_DAMPING;

    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

// -----------------------------------------------------
// UTILITY — NEAREST NODE
// -----------------------------------------------------
function findClosestNode(x, y) {
  const nodes = neuron?.axon?.nodes;
  if (!nodes || nodes.length === 0) return null;

  let best = null;
  let bestD = Infinity;

  for (const n of nodes) {
    const d = dist(x, y, n.x, n.y);
    if (d < bestD) {
      bestD = d;
      best = n;
    }
  }
  return best;
}

// -----------------------------------------------------
// RESET
// -----------------------------------------------------
function initNodeIons() {
  ecsIons.NodeNa.length = 0;
  ecsIons.NodeK.length  = 0;
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.triggerNodeNaInflux = triggerNodeNaInflux;
window.triggerNodeKEfflux = triggerNodeKEfflux;
window.drawNodeIons       = drawNodeIons;
window.initNodeIons       = initNodeIons;
