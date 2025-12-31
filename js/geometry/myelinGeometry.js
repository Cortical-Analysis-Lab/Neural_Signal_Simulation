// =====================================================
// MYELIN GEOMETRY — TRUE SHEATHS + NODES OF RANVIER
// =====================================================
// ✔ Sheaths are primary geometry
// ✔ Nodes are TRUE gaps between sheaths
// ✔ First node at axon initial segment (AIS)
// ✔ Node phase computed from TRUE path distance
// ✔ Debug rectangles match visual gaps exactly
// ✔ Nodes draggable with mouse (NO keyboard)
// ✔ Right-click dumps coordinates
// =====================================================

console.log("myelinGeometry loaded");

// -----------------------------------------------------
// TEACHING PARAMETERS
// -----------------------------------------------------
const SHEATH_LENGTH = 28;
const NODE_LENGTH   = 10;

// -----------------------------------------------------
// INTERNAL STATE
// -----------------------------------------------------
let draggedNode = null;

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
  // PRECOMPUTE CUMULATIVE PATH LENGTH
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
  // WALK PATH IN TRUE PHYSICAL BLOCKS
  // -----------------------------------------------
  let nextDistance  = 0;
  let placingSheath = false; // start with NODE at AIS

  for (let i = 0; i < axonPath.length - 1; i++) {

    const p1 = axonPath[i];
    const p2 = axonPath[i + 1];

    const segStart = cumulative[i];
    const segEnd   = cumulative[i + 1];
    const segLen   = segEnd - segStart;

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
// DEBUG DRAW — NODE RECTANGLES
// -----------------------------------------------------
function drawMyelinNodeDebug() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes) return;

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
// MOUSE — PRESS
// Returns TRUE if click was consumed
// -----------------------------------------------------
function handleNodeMousePressed(mx, my, button = LEFT) {

  const nodes = neuron?.axon?.nodes;
  if (!nodes) return false;

  for (let n of nodes) {

    const hit =
      abs(mx - n.x) < n.length &&
      abs(my - n.y) < n.length;

    if (hit) {

      // Right-click → dump immediately
      if (button === RIGHT) {
        dumpNodeCoordinates();
        return true;
      }

      // Left-click → drag
      draggedNode = n;
      return true; // 🔑 consume click (blocks synapse click)
    }
  }

  return false; // let synapse system handle it
}

// -----------------------------------------------------
// MOUSE — DRAG
// -----------------------------------------------------
function handleNodeMouseDragged(mx, my) {
  if (draggedNode) {
    draggedNode.x = mx;
    draggedNode.y = my;
  }
}

// -----------------------------------------------------
// MOUSE — RELEASE
// -----------------------------------------------------
function handleNodeMouseReleased() {
  draggedNode = null;
}

// -----------------------------------------------------
// DUMP NODE COORDINATES
// -----------------------------------------------------
function dumpNodeCoordinates() {

  const nodes = neuron?.axon?.nodes;
  if (!nodes) return;

  console.log("🟦 HARD-CODED NODE LIST:");
  console.log(JSON.stringify(
    nodes.map(n => ({
      x: Number(n.x.toFixed(2)),
      y: Number(n.y.toFixed(2)),
      phase: Number(n.phase.toFixed(4))
    })),
    null,
    2
  ));
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.generateMyelinGeometry  = generateMyelinGeometry;
window.drawMyelinNodeDebug     = drawMyelinNodeDebug;
window.handleNodeMousePressed  = handleNodeMousePressed;
window.handleNodeMouseDragged  = handleNodeMouseDragged;
window.handleNodeMouseReleased = handleNodeMouseReleased;
