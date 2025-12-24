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
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // =====================================================
  // 1. SOMA POSITION — BETWEEN NEURON 2 & 3
  // =====================================================
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;

  // =====================================================
  // 2. ORGANIC BACKGROUND ARMS
  // =====================================================
  const baseArmCount = 6;

  for (let i = 0; i < baseArmCount; i++) {
    const angle = TWO_PI * (i / baseArmCount) + random(-0.3, 0.3);

    astrocyte.arms.push({
      type: "organic",
      angle,
      length: random(55, 85),
      wobble: random(TWO_PI),
      target: null
    });
  }

  // =====================================================
  // 3. LOCKED PERISYNAPTIC ARMS (CRITICAL FIX)
  // =====================================================
  const lockedTargets = [];

  if (neuron2?.synapses?.length) lockedTargets.push(neuron2.synapses[0]);
  if (neuron3?.synapses?.length) lockedTargets.push(neuron3.synapses[0]);

  lockedTargets.forEach(s => {
    const dx = s.x - astrocyte.x;
    const dy = s.y - astrocyte.y;

    astrocyte.arms.push({
      type: "synaptic",
      angle: atan2(dy, dx),
      length: dist(astrocyte.x, astrocyte.y, s.x, s.y), // 🔑 FULL LENGTH
      wobble: random(TWO_PI),
      target: s
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

  // =====================================================
  // SOMA
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // =====================================================
  // ARMS
  // =====================================================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob =
      a.type === "organic"
        ? sin(state.time * 0.001 + a.wobble) * 4
        : 0; // 🔒 LOCKED arms do NOT wobble

    const x1 = cos(a.angle) * astrocyte.radius;
    const y1 = sin(a.angle) * astrocyte.radius;

    const x2 = cos(a.angle) * (a.length * 0.5);
    const y2 = sin(a.angle) * (a.length * 0.5);

    const x3 = cos(a.angle) * (a.length + wob);
    const y3 = sin(a.angle) * (a.length + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();

    // =================================================
    // END FOOT — FLATTENED AT SYNAPTIC GAP
    // =================================================
    if (a.type === "synaptic" && a.target) {
      push();
      translate(x3, y3);
      rotate(a.angle);
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(0, 0, 14, 6); // flattened endfoot
      pop();
    }
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
