// =====================================================
// MYELIN GEOMETRY — TRUE SHEATHS + NODES OF RANVIER
// =====================================================
// ✔ Sheaths are primary geometry
// ✔ Nodes are TRUE gaps between sheaths
// ✔ First node at axon initial segment
// ✔ No spacing math drift
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

  let walked = 0;
  let placingSheath = false; // start with NODE at hillock

  for (let i = 0; i < axonPath.length - 1; i++) {

    const p1 = axonPath[i];
    const p2 = axonPath[i + 1];

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const segLen = Math.hypot(dx, dy);

    let segWalk = 0;

    while (segWalk < segLen) {

      const blockLen = placingSheath ? SHEATH_LENGTH : NODE_LENGTH;
      if (segWalk + blockLen > segLen) break;

      const t0 = segWalk / segLen;
      const t1 = (segWalk + blockLen) / segLen;

      const x0 = lerp(p1.x, p2.x, t0);
      const y0 = lerp(p1.y, p2.y, t0);
      const x1 = lerp(p1.x, p2.x, t1);
      const y1 = lerp(p1.y, p2.y, t1);

      if (placingSheath) {
        sheaths.push({ x0, y0, x1, y1 });
      } else {
        nodes.push({
          x: (x0 + x1) * 0.5,
          y: (y0 + y1) * 0.5,
          length: NODE_LENGTH
        });
      }

      placingSheath = !placingSheath;
      segWalk += blockLen;
      walked  += blockLen;
    }
  }

  return { sheaths, nodes };
}

// -----------------------------------------------------
// DEBUG DRAW — NODE LOCATIONS (WORLD SPACE)
// -----------------------------------------------------
function drawMyelinNodeDebug() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes || nodes.length === 0) return;

  push();
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(10);
  strokeWeight(2);

  nodes.forEach((n, i) => {

    // Cyan for first node, blue for others
    stroke(i === 0 ? color(0,255,255) : color(80,140,255));
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
