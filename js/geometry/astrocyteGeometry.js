// =====================================================
// ASTROCYTE GEOMETRY — TRUE TRIPARTITE SYNAPSE
// =====================================================
console.log("astrocyteGeometry loaded");

// -----------------------------------------------------
// DEBUG
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

  endfootGlow: 0,
  somaGlow: 0
};

// -----------------------------------------------------
// Glow timing (slow propagation)
// -----------------------------------------------------
const ENDFOOT_GLOW_FRAMES = 36;
const SOMA_GLOW_DELAY    = 18;
const SOMA_GLOW_FRAMES   = 44;

// -----------------------------------------------------
// Compute synaptic cleft midpoint
// -----------------------------------------------------
function cleftMidpoint(bouton, psd) {
  return {
    x: (bouton.x + psd.x) * 0.5,
    y: (bouton.y + psd.y) * 0.5
  };
}

// -----------------------------------------------------
// Initialize astrocyte
// -----------------------------------------------------
function initAstrocyte() {

  if (!neuron?.synapses || !neuron2?.synapses || !neuron3?.synapses) return;

  // ---------------------------------------------------
  // Place soma between neuron 2 & 3
  // ---------------------------------------------------
  astrocyte.x = (neuron2.soma.x + neuron3.soma.x) * 0.5;
  astrocyte.y = (neuron2.soma.y + neuron3.soma.y) * 0.5 + 10;

  astrocyte.arms.length = 0;

  // ---------------------------------------------------
  // Identify ONE synapse per postsynaptic neuron
  // ---------------------------------------------------
  const targets = [];

  // Neuron 1 → Neuron 2
  if (neuron.synapses[0] && neuron2.synapses[0]) {
    targets.push({
      bouton: neuron.synapses[0],
      psd: neuron2.synapses[0]
    });
  }

  // Neuron 1 → Neuron 3
  if (neuron.synapses[1] && neuron3.synapses[0]) {
    targets.push({
      bouton: neuron.synapses[1],
      psd: neuron3.synapses[0]
    });
  }

  // ---------------------------------------------------
  // Create ONE arm per cleft
  // ---------------------------------------------------
  targets.forEach(({ bouton, psd }) => {

    const cleft = cleftMidpoint(bouton, psd);

    const dx = cleft.x - astrocyte.x;
    const dy = cleft.y - astrocyte.y;

    astrocyte.arms.push({
      angle: atan2(dy, dx),
      length: dist(astrocyte.x, astrocyte.y, cleft.x, cleft.y) * 1.1,
      wobble: random(TWO_PI),
      cleft
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

  // ---------------- SOMA (outline glow) ----------------
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

  // ---------------- ARMS ----------------
  astrocyte.arms.forEach(a => {

    const wob = sin(state.time * 0.001 + a.wobble) * 2;
    const L = a.length;

    const cx = cos(a.angle + 0.2) * (L * 0.5);
    const cy = sin(a.angle + 0.2) * (L * 0.5);

    const ex = cos(a.angle) * (L + wob);
    const ey = sin(a.angle) * (L + wob);

    // Arm
    stroke(getColor("astrocyte"));
    strokeWeight(5);
    noFill();
    beginShape();
    vertex(0, 0);
    quadraticVertex(cx, cy, ex, ey);
    endShape();

    // Endfoot (attached, past cleft)
    const dx = a.cleft.x - astrocyte.x;
    const dy = a.cleft.y - astrocyte.y;
    const mag = sqrt(dx * dx + dy * dy) || 1;

    const fx = ex + (dx / mag) * 6;
    const fy = ey + (dy / mag) * 6;

    noFill();
    strokeWeight(3);
    stroke(
      astrocyte.endfootGlow > 0
        ? color(255, 235, 120)
        : getColor("astrocyte")
    );
    ellipse(fx, fy, 10, 6);

    // DEBUG: cleft
    if (window.DEBUG_ASTROCYTE) {
      noStroke();
      fill(255, 60, 60);
      ellipse(a.cleft.x - astrocyte.x, a.cleft.y - astrocyte.y, 6);
    }
  });

  pop();

  // Glow decay
  astrocyte.endfootGlow = max(0, astrocyte.endfootGlow - 1);
  astrocyte.somaGlow    = max(0, astrocyte.somaGlow - 1);
}

// -----------------------------------------------------
// EXPORTS
// -----------------------------------------------------
window.initAstrocyte = initAstrocyte;
window.drawAstrocyte = drawAstrocyte;
window.triggerAstrocyteResponse = triggerAstrocyteResponse;
