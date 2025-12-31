// =====================================================
// MYELIN GEOMETRY — SHEATHS + NODES OF RANVIER (NEURON 1)
// =====================================================
// ✔ Pure geometry
// ✔ No drawing
// ✔ No AP logic
// ✔ No ion logic
// ✔ Explicit sheath vs node separation
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// Generate myelin sheaths + nodes of Ranvier
// -----------------------------------------------------
// axonPath : [{ x, y }]
// spacing  : px between sheaths
//
// Returns:
// {
//   sheaths: [{ x, y, pathIndex }],
//   nodes:   [{ x, y, pathIndex }]
// }
// -----------------------------------------------------
function generateMyelinGeometry(axonPath, spacing = 36) {
  if (!axonPath || axonPath.length < 2) {
    return { sheaths: [], nodes: [] };
  }

  const sheaths = [];
  const nodes   = [];

  let accumulated = 0;

  // ---------------------------------------------------
  // 1) Generate MYELIN SHEATH CENTERS
  // ---------------------------------------------------
  for (let i = 1; i < axonPath.length; i++) {
    const a = axonPath[i - 1];
    const b = axonPath[i];

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const segLen = Math.hypot(dx, dy);

    accumulated += segLen;

    if (accumulated >= spacing) {
      sheaths.push({
        x: b.x,
        y: b.y,
        pathIndex: i
      });
      accumulated = 0;
    }
  }

  // ---------------------------------------------------
  // 2) Generate NODES OF RANVIER (GAPS)
  // ---------------------------------------------------

  // 🔑 First node — BEFORE first sheath (critical fix)
  nodes.push({
    x: axonPath[0].x,
    y: axonPath[0].y,
    pathIndex: 0
  });

  // Nodes BETWEEN sheaths
  for (let i = 0; i < sheaths.length - 1; i++) {
    const a = sheaths[i];
    const b = sheaths[i + 1];

    nodes.push({
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      pathIndex: Math.floor((a.pathIndex + b.pathIndex) / 2)
    });
  }

  return { sheaths, nodes };
}

// -----------------------------------------------------
// Public API
// -----------------------------------------------------
window.generateMyelinGeometry = generateMyelinGeometry;
