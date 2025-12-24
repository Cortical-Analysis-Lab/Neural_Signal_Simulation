// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (CORRECTED)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],
  endfeet: []   // 🔑 synapse-local processes
};

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
  // Soma BETWEEN neuron 2 & 3 somas (not synapses)
  // -------------------------------------------------
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5;

  astrocyte.arms.length = 0;
  astrocyte.endfeet.length = 0;

  // -------------------------------------------------
  // TRIPARTITE END-FEET (SHORT, LOCAL)
  // -------------------------------------------------

  const pairs = [
    [neuron.synapses[0], neuron2.synapses[0]],
    [neuron.synapses[1], neuron3.synapses[0]]
  ];

  pairs.forEach(([pre, post]) => {
    if (!pre || !post) return;

    // Synaptic midpoint
    const mx = (pre.x + post.x) * 0.5;
    const my = (pre.y + post.y) * 0.5;

    // Synaptic axis
    const dx = post.x - pre.x;
    const dy = post.y - pre.y;
    const len = Math.hypot(dx, dy) || 1;

    // Perpendicular direction (astrocytic ensheathment)
    const nx = -dy / len;
    const ny =  dx / len;

    astrocyte.endfeet.push({
      x: mx + nx * 6,
      y: my + ny * 6,
      nx,
      ny
    });
  });

  // -------------------------------------------------
  // ORGANIC BACKGROUND ARMS (RADIAL, SHORT)
  // -------------------------------------------------
  const ARM_COUNT = 8;

  for (let i = 0; i < ARM_COUNT; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / ARM_COUNT) + random(-0.3, 0.3),
      length: random(28, 45),
      wobble: random(TWO_PI)
    });
  }
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

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
  // Background arms (organic)
  // -----------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {
    const wob = sin(state.time * 0.001 + a.wobble) * 3;

    const x2 = cos(a.angle) * (a.length * 0.6);
    const y2 = sin(a.angle) * (a.length * 0.6);

    const x3 = cos(a.angle) * (a.length + wob);
    const y3 = sin(a.angle) * (a.length + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();
  });

  pop();

  // -----------------------------
  // TRIPARTITE END-FEET (LOCAL)
  // -----------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(6);
  strokeCap(ROUND);

  astrocyte.endfeet.forEach(e => {

    const len = 12;

    line(
      e.x - e.nx * len * 0.5,
      e.y - e.ny * len * 0.5,
      e.x + e.nx * len * 0.5,
      e.y + e.ny * len * 0.5
    );
  });
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
