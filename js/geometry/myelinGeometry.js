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
// =====================================================
// MYELIN GEOMETRY — TRUE NODES OF RANVIER
// =====================================================
// ✔ Nodes placed by continuous path walk
// ✔ First node anchored at axon origin
// ✔ Even internode spacing
// ✔ No sheath centering error
// =====================================================

function generateMyelinNodes(axonPath) {

  if (!axonPath || axonPath.length < 2) return [];

  const nodes = [];

  const NODE_SPACING = 38; // internode distance (gap → gap)

  let distSinceLastNode = 0;
  let nextNodeDistance = 0;
  let walked = 0;

  // ---------------------------------------------------
  // FORCE FIRST NODE AT AXON START
  // ---------------------------------------------------
  nodes.push({
    x: axonPath[0].x,
    y: axonPath[0].y,
    pathIndex: 0,
    isFirst: true
  });

  nextNodeDistance = NODE_SPACING;

  // ---------------------------------------------------
  // WALK THE POLYLINE
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

      const x = lerp(p1.x, p2.x, t);
      const y = lerp(p1.y, p2.y, t);

      nodes.push({
        x,
        y,
        pathIndex: i,
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
