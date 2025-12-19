// =====================================================
// AXON ACTION POTENTIAL PROPAGATION (BRANCHED, CORRECT)
// =====================================================
console.log("axonSpike loaded");

// Shared conduction speed
const AXON_CONDUCTION_SPEED = 0.035;

// Where axon bifurcates (0–1 along axon)
const AXON_BRANCH_POINT = 0.55;

// Active spikes
const axonSpikes = [];

// -----------------------------------------------------
// Spawn spike at hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // Visual spacing guard
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.t < 0.05) return;
  }

  axonSpikes.push({
    t: 0,
    delivered: false
  });
}

// -----------------------------------------------------
// Update spike motion
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    const s = axonSpikes[i];
    s.t += AXON_CONDUCTION_SPEED;

    // Terminal arrival (single delivery)
    if (s.t >= 1 && !s.delivered) {
      s.delivered = true;
      notifyAxonTerminalArrival();
    }

    // Remove after passing terminal
    if (s.t >= 1.1) {
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw spikes (shared shaft + branches)
// -----------------------------------------------------
function drawAxonSpikes() {
  axonSpikes.forEach(s => {

    // ---- Shared axon shaft ----
    const shaftT = constrain(s.t, 0, AXON_BRANCH_POINT);
    const shaftP = getAxonPoint(shaftT);

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(shaftP.x, shaftP.y, 10, 10);
    pop();

    // ---- Branches only after bifurcation ----
    if (s.t > AXON_BRANCH_POINT) {
      const branchT = map(
        s.t,
        AXON_BRANCH_POINT,
        1,
        0,
        1,
        true
      );

      // Main continuation
      const pMain = getAxonPoint(
        lerp(AXON_BRANCH_POINT, 1, branchT)
      );

      push();
      noStroke();
      fill(0, 255, 120);
      ellipse(pMain.x, pMain.y, 9, 9);
      pop();

      // Branch to neuron 2
      const pN2 = getAxonBranchToNeuron2(branchT);

      push();
      noStroke();
      fill(0, 255, 120);
      ellipse(pN2.x, pN2.y, 9, 9);
      pop();
    }
  });
}

// -----------------------------------------------------
// Axon branch geometry → neuron 2 SOMA FIELD
// -----------------------------------------------------
function getAxonBranchToNeuron2(t) {

  // Branch origin = axon at branch point
  const branchOrigin = getAxonPoint(AXON_BRANCH_POINT);

  const x0 = branchOrigin.x;
  const y0 = branchOrigin.y;

  // Stable target: neuron 2 soma
  const tx = neuron2.soma.x;
  const ty = neuron2.soma.y;

  // Smooth biological curvature
  const cx1 = lerp(x0, tx, 0.4);
  const cy1 = y0 - 40;

  const cx2 = lerp(x0, tx, 0.7);
  const cy2 = ty + 30;

  return {
    x: bezierPoint(x0, cx1, cx2, tx, t),
    y: bezierPoint(y0, cy1, cy2, ty, t)
  };
}

// -----------------------------------------------------
// Terminal arrival hook (wired in Overview)
// -----------------------------------------------------
let axonTerminalCallback = null;

function onAxonTerminalArrival(cb) {
  axonTerminalCallback = cb;
}

function notifyAxonTerminalArrival() {
  if (axonTerminalCallback) {
    axonTerminalCallback();
  }
}
