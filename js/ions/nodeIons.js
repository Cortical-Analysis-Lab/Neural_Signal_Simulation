// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Node-authoritative (node center is ground truth)
// ✔ Na⁺ spawns in halo → drawn INTO node only
// ✔ K⁺ expelled → relaxes locally around node halo
// ✔ No sheath interaction possible
// ✔ Works for all nodes including first
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// GEOMETRY (MATCH AXON HALO)
// -----------------------------------------------------
const NODE_HALO_RADIUS    = 28;
const NODE_HALO_THICKNESS = 4;
const AXON_RADIUS        = 10;

// -----------------------------------------------------
// TUNING
// -----------------------------------------------------
const NODE_NA_LIFETIME = 22;
const NODE_K_LIFETIME  = 34;

const NODE_NA_BURST_PER_SIDE = 4;
const NODE_K_BURST_COUNT    = 5;

const NA_INWARD_FORCE = 0.18;
const K_RELAX         = 0.86;

// -----------------------------------------------------
// Utility — robust node normal (visual only)
// -----------------------------------------------------
function getNodeNormal(nodeIdx) {

  const path = neuron?.axon?.path;
  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!path || !node || path.length < 2) return { nx: 0, ny: 0 };

  let idx = constrain(node.pathIndex ?? 0, 0, path.length - 2);

  const p1 = path[idx];
  const p2 = path[idx + 1];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  return {
    nx: -dy / len,
    ny:  dx / len
  };
}

// -----------------------------------------------------
// Na⁺ INFLUX — HALO → NODE CENTER
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let side of [-1, +1]) {
    for (let i = 0; i < NODE_NA_BURST_PER_SIDE; i++) {

      const angle = random(TWO_PI);
      const r = random(
        NODE_HALO_RADIUS,
        NODE_HALO_RADIUS + NODE_HALO_THICKNESS
      );

      const x = node.x + cos(angle) * r;
      const y = node.y + sin(angle) * r;

      ecsIons.NodeNa.push({
        x,
        y,
        targetX: node.x,
        targetY: node.y,
        vx: 0,
        vy: 0,
        life: NODE_NA_LIFETIME
      });
    }
  }
}

// -----------------------------------------------------
// K⁺ EFFLUX — NODE → LOCAL HALO
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let i = 0; i < NODE_K_BURST_COUNT; i++) {

    const angle = random(TWO_PI);
    const r = random(
      NODE_HALO_RADIUS,
      NODE_HALO_RADIUS + NODE_HALO_THICKNESS
    );

    const x0 = node.x + cos(angle) * r;
    const y0 = node.y + sin(angle) * r;

    ecsIons.NodeK.push({
      x: node.x,
      y: node.y,
      x0,
      y0,
      vx: (x0 - node.x) * 0.08,
      vy: (y0 - node.y) * 0.08,
      life: NODE_K_LIFETIME
    });
  }
}

// -----------------------------------------------------
// DRAW
// -----------------------------------------------------
function drawNodeIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -----------------------------
  // Na⁺ — ATTRACTED INTO NODE
  // -----------------------------
  fill(getColor("sodium", 190));

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;

    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;

    p.vx += dx * NA_INWARD_FORCE;
    p.vy += dy * NA_INWARD_FORCE;

    p.vx *= 0.72;
    p.vy *= 0.72;

    p.x += p.vx;
    p.y += p.vy;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -----------------------------
  // K⁺ — RELAXES IN NODE HALO
  // -----------------------------
  fill(getColor("potassium", 160));

  ecsIons.NodeK = ecsIons.NodeK.filter(p => {
    p.life--;

    p.vx += (p.x0 - p.x) * 0.04;
    p.vy += (p.y0 - p.y) * 0.04;

    p.vx *= K_RELAX;
    p.vy *= K_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
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
