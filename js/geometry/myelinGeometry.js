// =====================================================
// MYELIN GEOMETRY — NODES OF RANVIER (NEURON 1)
// =====================================================
// ✔ Nodes are TRUE gaps (not sheath centers)
// ✔ First node at axon initial segment
// ✔ Even spacing thereafter
// ✔ Phase-aware (for AP timing)
// ✔ High-visibility debug drawing
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// TEACHING PARAMETERS
// -----------------------------------------------------
const NODE_LENGTH      = 10;   // visual gap half-size
const INTERNODE_LENGTH = 28;   // sheath length
const NODE_SPACING     = NODE_LENGTH + INTERNODE_LENGTH;

// -----------------------------------------------------
// Generate Nodes of Ranvier along axon path
// -----------------------------------------------------
function generateMyelinNodes(axonPath) {

  if (!axonPath || axonPath.length < 2) return [];

  const nodes = [];

  let walked = 0;
  let nextNodeDistance = 0;

  // ---------------------------------------------------
  // FORCE FIRST NODE AT AXON ORIGIN
  // ---------------------------------------------------
  nodes.push({
    x: axonPath[0].x,
    y: axonPath[0].y,
    pathIndex: 0,
    length: NODE_LENGTH,
    isFirst: true
  });

  nextNodeDistance = NODE_SPACING;

  // ---------------------------------------------------
  // WALK THE POLYLINE CONTINUOUSLY
  // ---------------------------------------------------
  for (let i = 0; i < axonPath.length - 1; i++) {

    const p1 = axonPath[i];
    const p2 = axonPath[i + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.hypot(dx, dy);

    let segStartDist = 0;

    while (walked + segLen - segStartDist >= nextNodeDistance) {

      const t = (nextNodeDistance - walked + segStartDist) / segLen;
      if (t < 0 || t > 1) break;

      const x = lerp(p1.x, p2.x, t);
      const y = lerp(p1.y, p2.y, t);

      nodes.push({
        x,
        y,
        pathIndex: i,
        length: NODE_LENGTH,
        isFirst: false
      });

      nextNodeDistance += NODE_SPACING;
      segStartDist = t * segLen;
    }

    walked += segLen;
  }

  return nodes;
}

// -----------------------------------------------------
// DEBUG DRAW — NODE LOCATIONS (WORLD SPACE)
// -----------------------------------------------------
function drawMyelinNodeDebug() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes || nodes.length === 0) {
    console.warn("⚠️ No myelin nodes to draw");
    return;
  }

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(10);
  strokeWeight(2);

  nodes.forEach((n, i) => {

    // 🔵 First node highlighted
    if (n.isFirst) {
      stroke(0, 255, 255); // cyan
    } else {
      stroke(80, 140, 255); // blue
    }

    noFill();
    rect(n.x, n.y, n.length * 2, n.length * 2);

    // index label
    noStroke();
    fill(0, 200, 255);
    text(i, n.x, n.y - n.length - 6);
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.generateMyelinNodes = generateMyelinNodes;
window.drawMyelinNodeDebug = drawMyelinNodeDebug;
