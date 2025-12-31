// =====================================================
// MYELIN GEOMETRY — NODES OF RANVIER (NEURON 1)
// =====================================================
// ✔ Nodes are TRUE gaps (not sheath centers)
// ✔ First node at axon initial segment
// ✔ Even spacing thereafter
// ✔ Phase-aware (for AP timing)
// ✔ Optional debug drawing
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// TEACHING PARAMETERS
// -----------------------------------------------------
const NODE_LENGTH      = 10;   // visual gap length
const INTERNODE_LENGTH = 28;   // myelin sheath length

// -----------------------------------------------------
// Generate Nodes of Ranvier along axon path
// -----------------------------------------------------
function generateMyelinNodes(axonPath) {

  if (!axonPath || axonPath.length < 2) return [];

  const nodes = [];

  // ---------------------------------------------------
  // Compute total axon length (for phase mapping)
  // ---------------------------------------------------
  let totalLength = 0;
  for (let i = 0; i < axonPath.length - 1; i++) {
    totalLength += dist(
      axonPath[i].x, axonPath[i].y,
      axonPath[i + 1].x, axonPath[i + 1].y
    );
  }

  let distanceAlong = 0;
  let nextNodeAt = 0; // first node at hillock

  for (let i = 0; i < axonPath.length - 1; i++) {

    const p1 = axonPath[i];
    const p2 = axonPath[i + 1];

    const segLen = dist(p1.x, p1.y, p2.x, p2.y);

    while (distanceAlong + segLen >= nextNodeAt) {

      const t = (nextNodeAt - distanceAlong) / segLen;
      if (t < 0 || t > 1) break;

      const x = lerp(p1.x, p2.x, t);
      const y = lerp(p1.y, p2.y, t);

      const phase = nextNodeAt / totalLength;

      nodes.push({
        x,
        y,
        pathIndex: i,
        length: NODE_LENGTH,
        phase     // 🔑 CRITICAL: AP timing anchor
      });

      nextNodeAt += INTERNODE_LENGTH + NODE_LENGTH;
      break;
    }

    distanceAlong += segLen;
  }

  return nodes;
}

// -----------------------------------------------------
// DEBUG DRAW — NODE LOCATIONS
// -----------------------------------------------------
function drawMyelinNodeDebug() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes) return;

  push();
  rectMode(CENTER);
  noFill();
  stroke(80, 140, 255, 180); // blue
  strokeWeight(1);

  nodes.forEach(n => {
    rect(n.x, n.y, n.length * 2, n.length * 2);
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.generateMyelinNodes = generateMyelinNodes;
window.drawMyelinNodeDebug = drawMyelinNodeDebug;
