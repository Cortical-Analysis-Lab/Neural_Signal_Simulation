// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (NEURON 2 ↔ 3)
// =====================================================
console.log("astrocyteGeometry loaded թվական");

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
      target: null,
      overshoot: 0
    });
  }

  // =====================================================
  // TARGETED PERISYNAPTIC ARMS
  // =====================================================
  const targets = [];

  if (neuron2?.synapses?.length) {
    targets.push(neuron2.synapses[0]); // 🔑 first synapse = special
  }

  if (neuron3?.synapses?.length) {
    targets.push(neuron3.synapses[0]);
  }

  targets.forEach((s, i) => {

    const dx = s.x - astrocyte.x;
    const dy = s.y - astrocyte.y;
    const d  = dist(astrocyte.x, astrocyte.y, s.x, s.y);

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      length: d * 0.65,
      wobble: random(TWO_PI),
      target: s,

      // 🔑 neuron-2 synapse arm passes PSD
      overshoot: (i === 0) ? 8 : 0
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
  // SOMA (fill stays purple; glow is outline only)
  // =====================================================
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  if (astrocyte.somaGlow > 0) {
    stroke(255, 230, 120, map(astrocyte.somaGlow, 0, SOMA_GLOW_FRAMES, 40, 160));
    strokeWeight(4);
    noFill();
    ellipse(0, 0, astrocyte.radius * 2.4);
  }

  // Nucleus
  noStroke();
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // =====================================================
  // ARMS + ENDFEET
  // =====================================================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 3;
    const L   = a.length + a.overshoot;

    const cx = cos(a.angle + 0.25) * (L * 0.5);
    const cy = sin(a.angle + 0.25) * (L * 0.5);

    const ex = cos(a.angle) * (L + wob);
    const ey = sin(a.angle) * (L + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, ex, ey);
    endShape();

    // -----------------------------
    // ENDFOOT (ATTACHED)
    // -----------------------------
    if (a.target) {

      // Base endfoot
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);

      // Glow halo ONLY
      if (astrocyte.endfootGlow > 0) {
        stroke(255, 235, 120,
          map(astrocyte.endfootGlow, 0, ENDFOOT_GLOW_FRAMES, 40, 180)
        );
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 16, 12);
      }
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
