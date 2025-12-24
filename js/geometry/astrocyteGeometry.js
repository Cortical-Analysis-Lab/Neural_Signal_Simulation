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
  arms: [],

  endfootGlow: 0,
  somaGlow: 0
};

// -----------------------------------------------------
// Glow timing (frames)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 18;
const SOMA_GLOW_DELAY    = 10;
const SOMA_GLOW_FRAMES   = 22;

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // =====================================================
  // PLACE SOMA BETWEEN NEURON 2 & 3
  // =====================================================
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;

  // =====================================================
  // BASE ORGANIC ARMS
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
  // TARGETED PERISYNAPTIC ARMS
  // =====================================================
  const targets = [];

  if (neuron2?.synapses?.length) {
    targets.push(...neuron2.synapses.slice(0, 2));
  }

  if (neuron3?.synapses?.length) {
    targets.push(...neuron3.synapses.slice(0, 2));
  }

  targets.forEach(s => {
    astrocyte.arms.push({
      angle: atan2(s.y - astrocyte.y, s.x - astrocyte.x),
      length: dist(astrocyte.x, astrocyte.y, s.x, s.y) * 0.7,
      wobble: random(TWO_PI),
      target: s
    });
  });
}

// -----------------------------------------------------
// Triggered by vesicle release
// -----------------------------------------------------
function triggerAstrocyteResponse() {
  astrocyte.endfootGlow = ENDFOOT_GLOW_FRAMES;

  setTimeout(() => {
    astrocyte.somaGlow = SOMA_GLOW_FRAMES;
  }, SOMA_GLOW_DELAY * 16);
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
  const somaColor =
    astrocyte.somaGlow > 0
      ? color(255, 235, 120)
      : getColor("astrocyte");

  noStroke();
  fill(somaColor);
  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // =====================================================
  // ARMS
  // =====================================================
  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 4;

    let L = a.length;

    // 🔑 extend perisynaptic arms slightly
    if (a.target) L *= 1.15;

    // direction to synapse
    let ux = 0, uy = 0;
    if (a.target) {
      const dx = a.target.x - astrocyte.x;
      const dy = a.target.y - astrocyte.y;
      const mag = sqrt(dx * dx + dy * dy) || 1;
      ux = dx / mag;
      uy = dy / mag;
    }

    // arm endpoint now biased TOWARD cleft
    const x3 = cos(a.angle) * (L + wob) + ux * 6;
    const y3 = sin(a.angle) * (L + wob) + uy * 6;

    const x2 = cos(a.angle + 0.25) * (L * 0.5);
    const y2 = sin(a.angle + 0.25) * (L * 0.5);

    const armColor =
      a.target && astrocyte.endfootGlow > 0
        ? lerpColor(getColor("astrocyte"), color(255, 235, 120), 0.8)
        : getColor("astrocyte");

    stroke(armColor);
    strokeWeight(5);
    noFill();

    beginShape();
    vertex(0, 0);
    quadraticVertex(x2, y2, x3, y3);
    endShape();

    // =================================================
    // PERISYNAPTIC ENDFOOT (PAST PSD)
    // =================================================
    if (a.target) {

      const px = -uy * 6 + ux * 8;
      const py =  ux * 6 + uy * 8;

      const footColor =
        astrocyte.endfootGlow > 0
          ? color(255, 235, 120)
          : getColor("astrocyte");

      push();
      translate(x3 + px, y3 + py);
      noStroke();
      fill(footColor);
      ellipse(0, 0, 10, 6);
      pop();
    }
  });

  pop();

  // --------------------------------------------------
  // Glow decay
  // --------------------------------------------------
  astrocyte.endfootGlow = max(0, astrocyte.endfootGlow - 1);
  astrocyte.somaGlow    = max(0, astrocyte.somaGlow - 1);
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
