// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (NEURON 2 ↔ 3)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: []
};

// -----------------------------------------------------
// Helper: point adjacent to synaptic cleft (NOT attached)
// -----------------------------------------------------
function getCleftAdjacentPoint(pre, post, offset = 12) {
  const mx = (pre.x + post.x) * 0.5;
  const my = (pre.y + post.y) * 0.5;

  const dx = post.x - pre.x;
  const dy = post.y - pre.y;
  const len = Math.hypot(dx, dy) || 1;

  // perpendicular (normal) to synapse axis
  const nx = -dy / len;
  const ny =  dx / len;

  return {
    x: mx + nx * offset,
    y: my + ny * offset
  };
}

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (
    !neuron?.synapses?.length ||
    !neuron2?.soma ||
    !neuron3?.soma
  ) return;

  // -------------------------------------------------
  // Soma position: BETWEEN neuron 2 & 3 somas
  // -------------------------------------------------
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5;

  astrocyte.arms.length = [];

  // -------------------------------------------------
  // LOCKED ARMS — synaptic gaps (tripartite)
  // -------------------------------------------------
  const lockedTargets = [];

  // neuron 1 → neuron 2 synapse
  if (neuron.synapses[0] && neuron2.synapses[0]) {
    lockedTargets.push(
      getCleftAdjacentPoint(
        neuron.synapses[0],
        neuron2.synapses[0],
        12
      )
    );
  }

  // neuron 1 → neuron 3 synapse
  if (neuron.synapses[1] && neuron3.synapses[0]) {
    lockedTargets.push(
      getCleftAdjacentPoint(
        neuron.synapses[1],
        neuron3.synapses[0],
        12
      )
    );
  }

  lockedTargets.forEach(t => {
    const dx = t.x - astrocyte.x;
    const dy = t.y - astrocyte.y;

    astrocyte.arms.push({
      locked: true,
      targetX: t.x,
      targetY: t.y,
      angle: Math.atan2(dy, dx),
      length: Math.hypot(dx, dy),
      wobble: random(TWO_PI)
    });
  });

  // -------------------------------------------------
  // FREE ARMS — background astrocyte morphology
  // -------------------------------------------------
  const FREE_ARM_COUNT = 7;

  for (let i = 0; i < FREE_ARM_COUNT; i++) {
    astrocyte.arms.push({
      locked: false,
      angle: random(TWO_PI),
      length: random(45, 70),
      wobble: random(TWO_PI)
    });
  }
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.arms.length) return;

  push();
  translate(astrocyte.x, astrocyte.y);

  // -----------------------------
  // Soma
  // -----------------------------
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  fill(180, 60, 200);
  ellipse(0, 0, 10);

  // -----------------------------
  // Arms
  // -----------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 3;

    let x3, y3;

    if (a.locked) {
      // stop short of synaptic cleft (ensheath, don't contact)
      const shrink = 6;
      const dx = a.targetX - astrocyte.x;
      const dy = a.targetY - astrocyte.y;
      const len = Math.hypot(dx, dy) || 1;

      x3 = dx * ((len - shrink) / len);
      y3 = dy * ((len - shrink) / len);
    } else {
      x3 = cos(a.angle) * (a.length + wob);
      y3 = sin(a.angle) * (a.length + wob);
    }

    const x2 = x3 * 0.6;
    const y2 = y3 * 0.6;

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte  = initAstrocyte;
window.drawAstrocyte  = drawAstrocyte;
