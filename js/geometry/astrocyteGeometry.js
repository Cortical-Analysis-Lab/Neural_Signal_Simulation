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
  // 1. PLACE SOMA BETWEEN NEURON 2 & 3 SOMAS
  // =====================================================
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  // =====================================================
  // 2. CLEAR OLD ARMS
  // =====================================================
  astrocyte.arms.length = 0;

  // =====================================================
  // 3. BASE ORGANIC RADIAL ARMS (STRUCTURE)
  // =====================================================
  const baseArmCount = 7;

  for (let i = 0; i < baseArmCount; i++) {
    const angle = TWO_PI * (i / baseArmCount) + random(-0.3, 0.3);
    const len   = random(55, 85);

    astrocyte.arms.push({
      angle,
      length: len,
      wobble: random(TWO_PI),
      target: null
    });
  }

  // =====================================================
  // 4. TARGETED PERISYNAPTIC ARMS (FUNCTION)
  // =====================================================
  const targets = [];

  if (neuron2?.synapses?.length) {
    targets.push(...neuron2.synapses.slice(0, 2));
  }

  if (neuron3?.synapses?.length) {
    targets.push(...neuron3.synapses.slice(0, 2));
  }

  targets.forEach(s => {
    const dx = s.x - astrocyte.x;
    const dy = s.y - astrocyte.y;

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      length: dist(astrocyte.x, astrocyte.y, s.x, s.y) * 0.65,
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
  // ARMS (ORGANIC + PERISYNAPTIC)
  // =====================================================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 4;

    const x1 = cos(a.angle) * astrocyte.radius;
    const y1 = sin(a.angle) * astrocyte.radius;

    const x2 = cos(a.angle + 0.25) * (a.length * 0.5);
    const y2 = sin(a.angle + 0.25) * (a.length * 0.5);

    const x3 = cos(a.angle) * (a.length + wob);
    const y3 = sin(a.angle) * (a.length + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();

    // ---------------------------------------------------
    // Perisynaptic endfoot (visual cue)
    // ---------------------------------------------------
    if (a.target) {
      push();
      translate(x3, y3);
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(0, 0, 10, 6);
      pop();
    }
  });

  pop();
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte  = initAstrocyte;
window.drawAstrocyte  = drawAstrocyte;
