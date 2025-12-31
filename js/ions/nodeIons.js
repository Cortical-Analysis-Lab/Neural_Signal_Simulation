// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Geometry-correct (local membrane normal)
// ✔ Na⁺ enters ONLY at nodes
// ✔ K⁺ settles around node halo
// ✔ No sheath interaction
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// MATCH AXON HALO GEOMETRY
// -----------------------------------------------------
const NODE_HALO_RADIUS    = 28;
const NODE_HALO_THICKNESS = 4;
const AXON_RADIUS        = 10;

// -----------------------------------------------------
// TUNING
// -----------------------------------------------------
const NODE_NA_LIFETIME = 22;
const NODE_K_LIFETIME  = 34;

const NODE_NA_BURST_PER_SIDE = 3;
const NODE_K_BURST_COUNT    = 4;

const NA_INWARD_SPEED = 1.3;
const K_RELAX         = 0.86;

// -----------------------------------------------------
// Utility — local membrane normal at node
// -----------------------------------------------------
function getNodeNormal(nodeIdx) {
  const path = neuron?.axon?.path;
  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!path || !node) return null;

  // find closest path index to node
  let bestIdx = 0;
  let bestD = Infinity;

  for (let i = 0; i < path.length - 1; i++) {
    const d = dist(node.x, node.y, path[i].x, path[i].y);
    if (d < bestD) {
      bestD = d;
      bestIdx = i;
    }
  }

  const p1 = path[bestIdx];
  const p2 = path[bestIdx + 1];

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;

  // normal (perpendicular to tangent)
  return {
    nx: -dy / len,
    ny:  dx / len
  };
}

// -----------------------------------------------------
// Na⁺ INFLUX — HALO → NODE (NORMAL-ALIGNED)
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  const normal = getNodeNormal(nodeIdx);
  if (!node || !normal) return;

  const { nx, ny } = normal;

  [-1, +1].forEach(side => {
    for (let i = 0; i < NODE_NA_BURST_PER_SIDE; i++) {

      const r = random(
        NODE_HALO_RADIUS,
        NODE_HALO_RADIUS + NODE_HALO_THICKNESS
      );

      const x = node.x + nx * r * side;
      const y = node.y + ny * r * side;

      ecsIons.NodeNa.push({
        x,
        y,
        vx: -nx * NA_INWARD_SPEED * side,
        vy: -ny * NA_INWARD_SPEED * side,
        life: NODE_NA_LIFETIME
      });
    }
  });
}

// -----------------------------------------------------
// K⁺ EFFLUX — NODE → HALO (NORMAL-ALIGNED)
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  const normal = getNodeNormal(nodeIdx);
  if (!node || !normal) return;

  const { nx, ny } = normal;

  for (let i = 0; i < NODE_K_BURST_COUNT; i++) {

    const side = i % 2 === 0 ? 1 : -1;

    const r0 = NODE_HALO_RADIUS * 0.7;
    const rT = random(
      NODE_HALO_RADIUS,
      NODE_HALO_RADIUS + NODE_HALO_THICKNESS
    );

    const x = node.x + nx * r0 * side;
    const y = node.y + ny * r0 * side;

    const tx = node.x + nx * rT * side;
    const ty = node.y + ny * rT * side;

    ecsIons.NodeK.push({
      x,
      y,
      x0: tx,
      y0: ty,
      vx: (tx - x) * 0.08,
      vy: (ty - y) * 0.08,
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
  // Na⁺ — ENTERS AXON
  // -----------------------------
  fill(getColor("sodium", 190));

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;

    // remove once inside axon
    if (p.life <= 0) return false;

    text("Na⁺", p.x, p.y);
    return true;
  });

  // -----------------------------
  // K⁺ — SETTLES IN HALO
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
