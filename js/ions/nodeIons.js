// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Node-of-Ranvier only
// ✔ Same spatial range as axon halo
// ✔ Directed Na⁺ influx (outer → membrane)
// ✔ Gentle K⁺ efflux (membrane → halo)
// ✔ No runaway trajectories
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// MATCH AXON HALO GEOMETRY
// -----------------------------------------------------
const NODE_HALO_RADIUS    = 28; // MATCHES AXON_HALO_RADIUS
const NODE_HALO_THICKNESS = 4;

// -----------------------------------------------------
// LIFETIME (SHORT, READABLE)
// -----------------------------------------------------
const NODE_NA_LIFETIME = 26;
const NODE_K_LIFETIME  = 34;

// -----------------------------------------------------
// BURST COUNTS
// -----------------------------------------------------
const NODE_NA_BURST_PER_SIDE = 3;
const NODE_K_BURST_COUNT    = 4;

// -----------------------------------------------------
// MOTION (HALO-BOUND)
// -----------------------------------------------------
const NA_INWARD_GAIN = 0.10;   // pull toward membrane
const K_OUTWARD_GAIN = 0.08;   // push toward halo center

const NA_RELAX = 0.88;
const K_RELAX  = 0.86;

// -----------------------------------------------------
// Na⁺ INFLUX — OUTER HALO → MEMBRANE
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;
  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  [-1, +1].forEach(side => {
    for (let i = 0; i < NODE_NA_BURST_PER_SIDE; i++) {

      const r = random(
        NODE_HALO_RADIUS,
        NODE_HALO_RADIUS + NODE_HALO_THICKNESS
      );

      const x = node.x + side * r;
      const y = node.y + random(-4, 4);

      ecsIons.NodeNa.push({
        x,
        y,
        x0: node.x + side * NODE_HALO_RADIUS,
        y0: node.y,
        vx: (node.x - x) * NA_INWARD_GAIN,
        vy: (node.y - y) * NA_INWARD_GAIN,
        life: NODE_NA_LIFETIME
      });
    }
  });
}

// -----------------------------------------------------
// K⁺ EFFLUX — MEMBRANE → HALO (SETTLES)
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;
  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let i = 0; i < NODE_K_BURST_COUNT; i++) {

    const angle = random(TWO_PI);
    const r0 = NODE_HALO_RADIUS * 0.7;
    const rT = random(
      NODE_HALO_RADIUS,
      NODE_HALO_RADIUS + NODE_HALO_THICKNESS
    );

    const x = node.x + cos(angle) * r0;
    const y = node.y + sin(angle) * r0;

    const tx = node.x + cos(angle) * rT;
    const ty = node.y + sin(angle) * rT;

    ecsIons.NodeK.push({
      x,
      y,
      x0: tx,
      y0: ty,
      vx: (tx - x) * K_OUTWARD_GAIN,
      vy: (ty - y) * K_OUTWARD_GAIN,
      life: NODE_K_LIFETIME
    });
  }
}

// -----------------------------------------------------
// DRAW — HALO-CONSTRAINED MOTION
// -----------------------------------------------------
function drawNodeIons() {
  push();
  textAlign(CENTER, CENTER);
  noStroke();

  // -----------------------------
  // Na⁺ — INWARD FLUX
  // -----------------------------
  fill(getColor("sodium", 180));

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;

    // gentle attraction toward membrane
    p.vx += (p.x0 - p.x) * 0.06;
    p.vy += (p.y0 - p.y) * 0.06;

    p.vx *= NA_RELAX;
    p.vy *= NA_RELAX;

    p.x += p.vx;
    p.y += p.vy;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -----------------------------
  // K⁺ — OUTWARD SETTLING
  // -----------------------------
  fill(getColor("potassium", 160));

  ecsIons.NodeK = ecsIons.NodeK.filter(p => {
    p.life--;

    // gentle attraction toward halo band
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
