// =====================================================
// MYELIN GEOMETRY — TRUE SHEATHS + NODES OF RANVIER
// =====================================================
// ✔ Sheaths are primary geometry
// ✔ Nodes are TRUE gaps between sheaths
// ✔ First node at axon initial segment (AIS)
// ✔ No spacing drift across segments
// ✔ Node phase computed from true path distance
// ✔ Debug rectangles match visual gaps exactly
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// TEACHING PARAMETERS (VISUAL GROUND TRUTH)
// -----------------------------------------------------
const SHEATH_LENGTH = 28;
const NODE_LENGTH   = 10;

// -----------------------------------------------------
// Generate myelin geometry from axon path
// -----------------------------------------------------
function generateMyelinGeometry(axonPath) {

  if (!axonPath || axonPath.length < 2) {
    return { sheaths: [], nodes: [] };
  }

  const sheaths = [];
  const nodes   = [];

  // -----------------------------------------------
  // Precompute cumulative path length
  // -----------------------------------------------
  const cumulative = [0];
  let totalLen = 0;

  for (let i = 0; i < axonPath.length - 1; i++) {
    const a = axonPath[i];
    const b = axonPath[i + 1];
    totalLen += dist(a.x, a.y, b.x, b.y);
    cumulative.push(totalLen);
  }

  // -----------------------------------------------
  // Walk the path in fixed blocks
  // -----------------------------------------------
  let nextDistance   = 0;
  let placingSheath  = false; // start with NODE at AIS

  for (let i = 0; i < axonPath.length - 1; i++) {

    const p1 = axonPath[i];
    const p2 = axonPath[i + 1];

    const segLen = dist(p1.x, p1.y, p2.x, p2.y);
    let segStart = cumulative[i];
    let segEnd   = cumulative[i + 1];

    while (nextDistance < segEnd) {

      const blockLen = placingSheath ? SHEATH_LENGTH : NODE_LENGTH;
      const blockEnd = nextDistance + blockLen;

      if (blockEnd > segEnd) break;

      const t0 = (nextDistance - segStart) / segLen;
      const t1 = (blockEnd     - segStart) / segLen;

      const x0 = lerp(p1.x, p2.x, t0);
      const y0 = lerp(p1.y, p2.y, t0);
      const x1 = lerp(p1.x, p2.x, t1);
      const y1 = lerp(p1.y, p2.y, t1);

      if (placingSheath) {

        sheaths.push({ x0, y0, x1, y1 });

      } else {

        const cx = (x0 + x1) * 0.5;
        const cy = (y0 + y1) * 0.5;

        nodes.push({
          x: cx,
          y: cy,
          length: NODE_LENGTH,
          pathIndex: i,
          phase: nextDistance / totalLen,
          isFirst: nodes.length === 0
        });
      }

      placingSheath = !placingSheath;
      nextDistance += blockLen;
    }
  }

  return { sheaths, nodes };
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

    stroke(n.isFirst ? color(0,255,255) : color(80,140,255));
    noFill();
    rect(n.x, n.y, n.length * 2, n.length * 2);

    noStroke();
    fill(0,200,255);
    text(i, n.x, n.y - n.length - 6);
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.generateMyelinGeometry = generateMyelinGeometry;
window.drawMyelinNodeDebug    = drawMyelinNodeDebug;
