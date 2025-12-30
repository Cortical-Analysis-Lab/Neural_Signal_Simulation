// =====================================================
// NODE IONS — MYELINATED AXON (Na⁺ / K⁺)
// =====================================================
// ✔ Node-of-Ranvier only
// ✔ Event-driven (no phase math)
// ✔ No internodal ion motion
// ✔ Teaching-first visuals
// =====================================================

console.log("🧬 nodeIons loaded");

// -----------------------------------------------------
// GLOBAL STORAGE (RELOAD SAFE)
// -----------------------------------------------------
window.ecsIons = window.ecsIons || {};
ecsIons.NodeNa = ecsIons.NodeNa || [];
ecsIons.NodeK  = ecsIons.NodeK  || [];

// -----------------------------------------------------
// TUNING PARAMETERS (LOCAL, SAFE)
// -----------------------------------------------------
const NODE_NA_RADIUS    = 10;
const NODE_NA_LIFETIME  = 20;
const NODE_K_RADIUS    = 14;
const NODE_K_LIFETIME  = 28;

const NODE_NA_SPREAD   = 0.4;
const NODE_K_SPREAD   = 1.2;

// -----------------------------------------------------
// Na⁺ INFLUX — NODE ONLY
// -----------------------------------------------------
function triggerNodeNaInflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  // Exactly one Na⁺ per side (mirrors axonIons philosophy)
  [-1, +1].forEach(side => {
    ecsIons.NodeNa.push({
      x: node.x + side * NODE_NA_RADIUS,
      y: node.y,
      vx: side * NODE_NA_SPREAD,
      vy: random(-0.3, 0.3),
      life: NODE_NA_LIFETIME
    });
  });
}

// -----------------------------------------------------
// K⁺ EFFLUX — NODE / PARANODE
// -----------------------------------------------------
function triggerNodeKEfflux(nodeIdx) {

  if (!window.myelinEnabled) return;

  const node = neuron?.axon?.nodes?.[nodeIdx];
  if (!node) return;

  for (let i = 0; i < 3; i++) {
    ecsIons.NodeK.push({
      x: node.x,
      y: node.y,
      vx: random(-NODE_K_SPREAD, NODE_K_SPREAD),
      vy: random(-NODE_K_SPREAD, NODE_K_SPREAD),
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
  // Na⁺ (NODE INFLUX)
  // -----------------------------
  fill(getColor("sodium", 150));

  ecsIons.NodeNa = ecsIons.NodeNa.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.92;
    p.vy *= 0.92;

    text("Na⁺", p.x, p.y);
    return p.life > 0;
  });

  // -----------------------------
  // K⁺ (NODE EFFLUX)
  // -----------------------------
  fill(getColor("potassium", 130));

  ecsIons.NodeK = ecsIons.NodeK.filter(p => {
    p.life--;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.90;
    p.vy *= 0.90;

    text("K⁺", p.x, p.y);
    return p.life > 0;
  });

  pop();
}

// -----------------------------------------------------
// RESET (FOR NEW SPIKES)
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
