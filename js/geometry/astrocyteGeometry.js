// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (DEBUGGED)
// =====================================================
console.log("astrocyteGeometry loaded (debugged)");

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
// Glow timing (SLOWER + PROPAGATING)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 36;   // 2× slower
const SOMA_GLOW_FRAMES   = 44;
const SOMA_TRIGGER_POINT = 18;   // propagate halfway

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // --------------------------------------------------
  // Place soma between neuron 2 & 3
  // --------------------------------------------------
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = [];

  // --------------------------------------------------
  // Base structural arms
  // --------------------------------------------------
  const baseArmCount = 6;
  astrocyte.arms = [];

  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount) + random(-0.25, 0.25),
      length: random(55, 75),
      wobble: random(TWO_PI),
      target: null
    });
  }

  // --------------------------------------------------
  // Targeted perisynaptic arms (CLEF-BASED)
  // --------------------------------------------------
  const targets = [];

  if (neuron2?.synapses?.length && neuron?.axon?.terminalBranches?.length) {
    const s = neuron2.synapses[0];
    const b = neuron.axon.terminalBranches[0]?.end;
    if (b) targets.push({ synapse: s, bouton: b });
  }

  if (neuron3?.synapses?.length && neuron?.axon?.terminalBranches?.length) {
    const s = neuron3.synapses[0];
    const b = neuron.axon.terminalBranches[0]?.end;
    if (b) targets.push({ synapse: s, bouton: b });
  }

  targets.forEach(({ synapse, bouton }) => {

    // -------- compute cleft midpoint --------
    const cx = (synapse.x + bouton.x) * 0.5;
    const cy = (synapse.y + bouton.y) * 0.5;

    const dx = cx - astrocyte.x;
    const dy = cy - astrocyte.y;

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      length: dist(astrocyte.x, astrocyte.y, cx, cy) + 8, // 🔑 pass cleft
      wobble: random(TWO_PI),
      target: synapse
    });
  });
}

// -----------------------------------------------------
// Triggered by vesicle release
// -----------------------------------------------------
function triggerAstrocyteResponse() {
  astrocyte.endfootGlow = ENDFOOT_GLOW_FRAMES;
}

// -----------------------------------------------------
// Draw astrocyte
// -----------------------------------------------------
function drawAstrocyte() {

  if (!astrocyte.arms.length) return;

  push();
  translate(astrocyte.x, astrocyte.y);

  // --------------------------------------------------
  // Soma
  // --------------------------------------------------
  noStroke();
  fill(getColor("astrocyte"));
  ellipse(0, 0, astrocyte.radius * 2);

  if (astrocyte.somaGlow > 0) {
    stroke(255, 230, 120, map(astrocyte.somaGlow, 0, SOMA_GLOW_FRAMES, 40, 160));
    strokeWeight(4);
    noFill();
    ellipse(0, 0, astrocyte.radius * 2.5);
  }

  // --------------------------------------------------
  // Arms + Endfeet
  // --------------------------------------------------
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 3;

    const cx = cos(a.angle + 0.25) * (a.length * 0.5);
    const cy = sin(a.angle + 0.25) * (a.length * 0.5);

    const ex = cos(a.angle) * (a.length + wob);
    const ey = sin(a.angle) * (a.length + wob);

    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, ex, ey);
    endShape();

    if (a.target) {
      // Endfoot body
      noStroke();
      fill(getColor("astrocyte"));
      ellipse(ex, ey, 12, 8);

      // Endfoot glow halo
      if (astrocyte.endfootGlow > 0) {
        stroke(255, 235, 120,
          map(astrocyte.endfootGlow, 0, ENDFOOT_GLOW_FRAMES, 50, 200)
        );
        strokeWeight(3);
        noFill();
        ellipse(ex, ey, 18, 14);
      }
    }
  });

  pop();

  // --------------------------------------------------
  // Glow propagation + decay
  // --------------------------------------------------
  if (astrocyte.endfootGlow > 0) {
    astrocyte.endfootGlow--;

    if (
      astrocyte.endfootGlow === ENDFOOT_GLOW_FRAMES - SOMA_TRIGGER_POINT
    ) {
      astrocyte.somaGlow = SOMA_GLOW_FRAMES;
    }
  }

  if (astrocyte.somaGlow > 0) {
    astrocyte.somaGlow--;
  }
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
