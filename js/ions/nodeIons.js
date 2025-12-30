// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Node-of-Ranvier only
// ✔ Event-driven (no phase math)
// ✔ No internodal ion motion
// ✔ Strong, bursty teaching visuals
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// TUNING PARAMETERS (VISUAL SALIENCE)
// -----------------------------------------------------

// Radial distance from node
const NODE_NA_RADIUS    = 16;   // ↑ was 10
const NODE_K_RADIUS    = 22;   // ↑ was 14

// Lifetime (frames)
const NODE_NA_LIFETIME  = 32;   // ↑ was 20
const NODE_K_LIFETIME  = 44;   // ↑ was 28

// Velocity magnitude
const NODE_NA_SPREAD   = 0.9;  // ↑ was 0.4
const NODE_K_SPREAD   = 1.6;  // ↑ was 1.2

// Burst counts
const NODE_NA_BURST_PER_SIDE = 3;
const NODE_K_BURST_COUNT    = 5;

// Motion damping
const NODE_NA_DAMPING = 0.92;
const NODE_K_DAMPING  = 0.88;

// -----------------------------------------------------
// Na⁺ INFLUX — NODE ONLY (BURSTY, PRE-DOMINANT)
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  // Symmetric bilateral Na⁺ bursts
  [-1, +1].forEach(side => {
    for (let i = 0; i < NODE_NA_BURST_PER_SIDE; i++) {

      ecsIons.NodeNa.push({
        x: node.x + side * NODE_NA_RADIUS,
        y: node.y,
        vx: side * (NODE_NA_SPREAD + random(0.3)),
        vy: random(-0.8, 0.8),
        life: NODE_NA_LIFETIME + random(-6, 6)
      });

    }
  });
}

// -----------------------------------------------------
// K⁺ EFFLUX — NODE / PARANODE (DIFFUSE PLUME)
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let i = 0; i < NODE_K_BURST_COUNT; i++) {

    ecsIons.NodeK.push({
      x: node.x,
      y: node.y,
      vx: random(-NODE_K_SPREAD, NODE_K_SPREAD),
      vy: random(-NODE_K_SPREAD, NODE_K_SPREAD) + 0.8, // outward bias
      life: NODE_K_LIFETIME + random(-8, 8)
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
  // Na⁺ (NODE INFLUX)
  // -----------------------------
  fill(getColor("sodium", 190)); // ↑ stronger contrast

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NODE_NA_DAMPING;
    p.vy *= NODE_NA_DAMPING;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -----------------------------
  // K⁺ (NODE EFFLUX)
  // -----------------------------
  fill(getColor("potassium", 170)); // ↑ stronger contrast

  ecsIons.NodeK = ecsIons.NodeK.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= NODE_K_DAMPING;
    p.vy *= NODE_K_DAMPING;

    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

// -----------------------------------------------------
// RESET (FOR NEW SPIKES / MODE SWITCH)
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
