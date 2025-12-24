// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (LOCKED)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// Astrocyte state
// -----------------------------------------------------
const astrocyte = {
  soma: { x: 0, y: 0, r: 24 },
  endfeet: []   // fixed endfeet at synaptic gaps
};

// -----------------------------------------------------
// Utility: perpendicular normal
// -----------------------------------------------------
function perp(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

// -----------------------------------------------------
// Initialize astrocyte (ONE TIME)
// -----------------------------------------------------
function initAstrocyte() {

  astrocyte.endfeet.length = 0;

  if (
    !neuron?.synapses?.length ||
    !neuron2?.synapses?.length ||
    !neuron3?.synapses?.length
  ) {
    console.warn("Astrocyte init skipped — missing synapses");
    return;
  }

  // ---------------------------------------------------
  // Select EXACT synapses to serve (explicit, stable)
  // ---------------------------------------------------
  const syn12 = neuron.synapses[0];   // neuron1 → neuron2
  const syn13 = neuron.synapses[1];   // neuron1 → neuron3

  const post2 = neuron2.synapses[0];
  const post3 = neuron3.synapses[0];

  // ---------------------------------------------------
  // Compute synaptic gaps
  // ---------------------------------------------------
  function synapticGap(pre, post) {
    return {
      x: (pre.x + post.x) * 0.5,
      y: (pre.y + post.y) * 0.5,
      dx: post.x - pre.x,
      dy: post.y - pre.y
    };
  }

  const gapA = synapticGap(syn12, post2);
  const gapB = synapticGap(syn13, post3);

  // ---------------------------------------------------
  // Place astrocytic endfeet (adjacent to cleft)
  // ---------------------------------------------------
  [gapA, gapB].forEach(gap => {

    const n = perp(gap.dx, gap.dy);

    astrocyte.endfeet.push({
      x1: gap.x - n.x * 6,
      y1: gap.y - n.y * 6,
      x2: gap.x + n.x * 6,
      y2: gap.y + n.y * 6,
      cx: gap.x,
      cy: gap.y
    });
  });

  // ---------------------------------------------------
  // Place soma BETWEEN neuron 2 & 3 somas
  // (manual offset is intentional & biological)
  // ---------------------------------------------------
  astrocyte.soma.x =
    (neuron2.soma.x + neuron3.soma.x) * 0.5;

  astrocyte.soma.y =
    (neuron2.soma.y + neuron3.soma.y) * 0.5 - 35;

  console.log("🟣 Astrocyte initialized");
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.endfeet.length) return;

  push();

  // -----------------------------
  // Draw endfeet FIRST (clefts)
  // -----------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  strokeCap(ROUND);
  noFill();

  astrocyte.endfeet.forEach(e => {
    line(e.x1, e.y1, e.x2, e.y2);
  });

  // -----------------------------
  // Draw short processes (no reach)
  // -----------------------------
  strokeWeight(3);

  astrocyte.endfeet.forEach(e => {
    line(
      astrocyte.soma.x,
      astrocyte.soma.y,
      e.cx,
      e.cy
    );
  });

  // -----------------------------
  // Soma
  // -----------------------------
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(
    astrocyte.soma.x,
    astrocyte.soma.y,
    astrocyte.soma.r * 2
  );

  // Nucleus
  fill(180, 60, 200);
  ellipse(
    astrocyte.soma.x,
    astrocyte.soma.y,
    10
  );

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
