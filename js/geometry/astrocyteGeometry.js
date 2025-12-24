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
// Activity (Ca2+ glow)
// -----------------------------------------------------
let astrocyteGlow = 0;

function triggerAstrocyteGlow(strength = 1.0) {
  astrocyteGlow = max(astrocyteGlow, 60 * strength);
}

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // =====================================================
  // 1. PLACE SOMA BETWEEN NEURON 2 & 3
  // =====================================================
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;

  // =====================================================
  // 2. BASE ORGANIC ARMS
  // =====================================================
  const baseArmCount = 7;

  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount) + random(-0.3, 0.3),
      length: random(55, 85),
      wobble: random(TWO_PI),
      target: null
    });
  }

  // =====================================================
  // 3. PERISYNAPTIC TARGETED ARMS
  // =====================================================
  const targets = [];

  if (neuron2?.synapses?.length) targets.push(...neuron2.synapses.slice(0, 2));
  if (neuron3?.synapses?.length) targets.push(...neuron3.synapses.slice(0, 2));

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

  astrocyteGlow = max(astrocyteGlow - 2, 0);

  push();
  translate(astrocyte.x, astrocyte.y);

  // =====================================================
  // SOMA
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  // Ca2+ glow
  if (astrocyteGlow > 0) {
    fill(120, 200, 255, map(astrocyteGlow, 0, 60, 0, 140));
    ellipse(0, 0, astrocyte.radius * 2.6);
  }

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

    const wob = sin(state.time * 0.001 + a.wobble) * 4;

    let lengthScale = 1.0;
    if (a.target && cos(a.angle) < 0) lengthScale = 1.25;

    const L = a.length * lengthScale;

    const x2 = cos(a.angle + 0.25) * (L * 0.5);
    const y2 = sin(a.angle + 0.25) * (L * 0.5);

    const x3 = cos(a.angle) * (L + wob);
    const y3 = sin(a.angle) * (L + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();

    // --------------------------------------------------
    // 🔑 Perisynaptic endfoot — shifted OFF the synapse
    // --------------------------------------------------
    if (a.target) {

      // perpendicular offset (¼ arm width)
      const px = -sin(a.angle) * 6;
      const py =  cos(a.angle) * 6;

      push();
      translate(x3 + px, y3 + py);

      noStroke();
      fill(
        astrocyteGlow > 0
          ? color(120, 220, 255)
          : getColor("astrocyte")
      );

      ellipse(0, 0, 10, 6);
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
window.triggerAstrocyteGlow = triggerAstrocyteGlow;
