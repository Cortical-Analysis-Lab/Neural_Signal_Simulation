// =====================================================
// ASTROCYTE GEOMETRY — TRIPARTITE SYNAPSE (DEBUGGABLE)
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// DEBUG TOGGLE (TURN OFF WHEN DONE)
// -----------------------------------------------------
window.DEBUG_ASTROCYTE = true;

// -----------------------------------------------------
// Astrocyte object
// -----------------------------------------------------
const astrocyte = {
  x: 0,
  y: 0,
  radius: 26,
  arms: [],

  // Glow state
  endfootGlow: 0,
  somaGlow: 0,

  // Debug geometry
  debugClefts: []
};

// -----------------------------------------------------
// Glow timing (SLOWER, PROPAGATING)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 36;   // 2× slower
const SOMA_GLOW_DELAY    = 18;
const SOMA_GLOW_FRAMES   = 44;

// -----------------------------------------------------
// Helper: synaptic cleft midpoint
// -----------------------------------------------------
function getSynapticCleft(bouton, synapse) {
  return {
    x: (bouton.x + synapse.x) * 0.5,
    y: (bouton.y + synapse.y) * 0.5
  };
}

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron2?.soma || !neuron3?.soma) return;

  // ---------------------------------------------------
  // Place soma between neuron 2 & 3
  // ---------------------------------------------------
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;
  astrocyte.debugClefts.length = 0;

  // ---------------------------------------------------
  // Base organic arms (background structure)
  // ---------------------------------------------------
  const baseArmCount = 7;
  for (let i = 0; i < baseArmCount; i++) {
    astrocyte.arms.push({
      angle: TWO_PI * (i / baseArmCount) + random(-0.3, 0.3),
      length: random(55, 85),
      wobble: random(TWO_PI),
      target: null
    });
  }

  // ---------------------------------------------------
  // Targeted perisynaptic arms (TRUE cleft targeting)
  // ---------------------------------------------------
  const targets = [];

  neuron2?.synapses?.slice(0, 2).forEach(s => {
    targets.push({ synapse: s, bouton: neuron.synapses[0] });
  });

  neuron3?.synapses?.slice(0, 2).forEach(s => {
    targets.push({ synapse: s, bouton: neuron.synapses[0] });
  });

  targets.forEach(({ synapse, bouton }) => {

    if (!bouton || !synapse) return;

    const cleft = getSynapticCleft(bouton, synapse);
    astrocyte.debugClefts.push(cleft);

    const dx = cleft.x - astrocyte.x;
    const dy = cleft.y - astrocyte.y;

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      // 🔑 Overshoot to compensate for spline curvature
      length: dist(astrocyte.x, astrocyte.y, cleft.x, cleft.y) * 1.15,
      wobble: random(TWO_PI),
      target: cleft
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

  // ===================================================
  // SOMA (outline glow only)
  // ===================================================
  noFill();
  strokeWeight(4);

  stroke(
    astrocyte.somaGlow > 0
      ? color(255, 235, 120)
      : getColor("astrocyte")
  );

  ellipse(0, 0, astrocyte.radius * 2);

  // Nucleus
  noStroke();
  fill(190, 80, 210);
  ellipse(0, 0, 10);

  // ===================================================
  // ARMS
  // ===================================================
  stroke(getColor("astrocyte"));
  strokeWeight(5);
  noFill();

  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 3;

    const L = a.length;

    const cx = cos(a.angle + 0.25) * (L * 0.5);
    const cy = sin(a.angle + 0.25) * (L * 0.5);

    const ex = cos(a.angle) * (L + wob);
    const ey = sin(a.angle) * (L + wob);

    // Arm spline
    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, ex, ey);
    endShape();

    // --------------------------------------------------
    // DEBUG: arm vector
    // --------------------------------------------------
    if (window.DEBUG_ASTROCYTE && a.target) {
      stroke(0, 200, 255, 120);
      strokeWeight(2);
      line(0, 0, ex, ey);
      stroke(getColor("astrocyte"));
      strokeWeight(5);
    }

    // --------------------------------------------------
    // ENDFOOT (LOCKED to arm endpoint)
    // --------------------------------------------------
    if (a.target) {

      // Small directional push PAST the cleft
      const dx = a.target.x - astrocyte.x;
      const dy = a.target.y - astrocyte.y;
      const mag = sqrt(dx * dx + dy * dy) || 1;

      const ux = dx / mag;
      const uy = dy / mag;

      const fx = ex + ux * 6;
      const fy = ey + uy * 6;

      noFill();
      stroke(
        astrocyte.endfootGlow > 0
          ? color(255, 235, 120)
          : getColor("astrocyte")
      );
      strokeWeight(3);
      ellipse(fx, fy, 10, 6);
    }
  });

  // ===================================================
  // DEBUG: synaptic clefts
  // ===================================================
  if (window.DEBUG_ASTROCYTE) {
    noStroke();
    fill(255, 60, 60);
    astrocyte.debugClefts.forEach(c =>
      ellipse(c.x - astrocyte.x, c.y - astrocyte.y, 6)
    );

    fill(255);
    textSize(10);
    text(`EF: ${astrocyte.endfootGlow}`, -22, -42);
    text(`SO: ${astrocyte.somaGlow}`, -22, -30);
  }

  pop();

  // --------------------------------------------------
  // Glow decay (slow)
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
