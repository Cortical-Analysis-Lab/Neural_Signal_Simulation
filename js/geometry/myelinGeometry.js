// =====================================================
// MYELIN GEOMETRY — NODES OF RANVIER (NEURON 1)
// =====================================================
// Pure geometry.
// ❌ No drawing
// ❌ No AP logic
// ❌ No timing
// ✔ Positions only
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// Generate Nodes of Ranvier along an axon path
// -----------------------------------------------------
// axonPath: array of { x, y } points describing the axon curve
// spacing: distance (px) between nodes
//
// Returns:
//   Array of nodes: [{ x, y, index }]
// -----------------------------------------------------
function generateMyelinNodes(axonPath, spacing = 28) {
  if (!axonPath || axonPath.length < 2) return [];

  const nodes = [];

  let accumulated = 0;
  let nodeIndex = 0;

  for (let i = 1; i < axonPath.length; i++) {
    const a = axonPath[i - 1];
    const b = axonPath[i];

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    accumulated += segLen;

    if (accumulated >= spacing) {
      nodes.push({
        x: b.x,
        y: b.y,
        index: nodeIndex++
      });

      accumulated = 0;
    }
  }

  return nodes;
}

// -----------------------------------------------------
// Public API (attached globally for now)
// -----------------------------------------------------
window.generateMyelinNodes = generateMyelinNodes;
