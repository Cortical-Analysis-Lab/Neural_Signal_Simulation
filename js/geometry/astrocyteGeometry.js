// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (N1↔N2, N1↔N3)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 28,
  arms: []
};

// -----------------------------------------------------
// Initialize astrocyte between neuron 2 & 3 somas
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma || !neuron?.synapses) return;

  // -------------------------------------------------
  // Soma position: midpoint between neuron 2 & 3 somas
  // -------------------------------------------------
  astrocyte.x =
    (neuron2.soma.x + neuron3.soma.x) * 0.5;

  astrocyte.y =
    (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;

  // -------------------------------------------------
  // Target synapses from neuron 1 → (2 & 3)
  // -------------------------------------------------
  const targets = [];

  neuron.synapses.forEach(s => {
    const d = dist(s.x, s.y, astrocyte.x, astrocyte.y);
    if (d < 140) targets.push(s);
  });

  targets.slice(0, 2).forEach(s => {
    astrocyte.arms.push({
      targetX: s.x,
      targetY: s.y,
      phase: random(TWO_PI),
      curl: random(-0.4, 0.4)
    });
  });
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.arms.length) return;

  push();
  translate(astrocyte.x, astrocyte.y);

  // =============================
  // SOMA (star-like, not jelly)
  // =============================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // nucleus
  fill(180, 70, 200);
  ellipse(0, 0, 11);

  // =============================
  // PRIMARY ARMS (branch-like)
  // =============================
  astrocyte.arms.forEach(a => {

    const tx = a.targetX - astrocyte.x;
    const ty = a.targetY - astrocyte.y;

    const d = sqrt(tx * tx + ty * ty) || 1;
    const ux = tx / d;
    const uy = ty / d;

    const wob =
      sin(state.time * 0.001 + a.phase) * 6;

    // control point — gives dendrite-like curvature
    const cx =
      ux * d * 0.45 - uy * (18 + wob) + a.curl * 20;
    const cy =
      uy * d * 0.45 + ux * (18 + wob);

    stroke(getColor("astrocyte"));
    strokeWeight(5);
    noFill();

    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, tx, ty);
    endShape();

    // =============================
    // ENDFOOT / SPINE CAP
    // =============================
    noStroke();
    fill(getColor("astrocyte"));
    ellipse(tx, ty, 14, 9);
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
