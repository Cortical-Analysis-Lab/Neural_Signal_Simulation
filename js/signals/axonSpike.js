// =====================================================
// AXON ACTION POTENTIAL PROPAGATION (BRANCHED, BIOLOGICAL)
// =====================================================
console.log("axonSpike loaded");

// Shared conduction speed
const AXON_CONDUCTION_SPEED = 0.035;

// Active spikes
const axonSpikes = [];

// -----------------------------------------------------
// Axon branch definitions
// -----------------------------------------------------
const axonBranches = [
  {
    id: "main",
    targetsNeuron2: false,
    getPoint: t => getAxonPoint(t)
  },
  {
    id: "toNeuron2",
    targetsNeuron2: true,
    getPoint: t => getAxonBranchToNeuron2(t)
  }
];

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
// Draw spikes on ALL branches
// -----------------------------------------------------
function drawAxonSpikes() {
  axonSpikes.forEach(s => {
    axonBranches.forEach(branch => {
      const p = branch.getPoint(constrain(s.t, 0, 1));

      push();
      noStroke();
      fill(0, 255, 120);
      ellipse(p.x, p.y, 10, 10);
      pop();
    });
  });
}

// -----------------------------------------------------
// Axon branch geometry → neuron 2 dendrite
// -----------------------------------------------------
function getAxonBranchToNeuron2(t) {

  // Axon origin (hillock)
  const x0 = neuron.somaRadius + 10;
  const y0 = 0;

  // Target: distal end of first neuron2 dendrite
  const dendrite = neuron2.dendrites[0];
  const distal = dendrite[dendrite.length - 1];

  // Control points for smooth biological curvature
  const cx1 = lerp(x0, distal.x, 0.35);
  const cy1 = -40;

  const cx2 = lerp(x0, distal.x, 0.65);
  const cy2 = distal.y + 30;

  return {
    x: bezierPoint(x0, cx1, cx2, distal.x, t),
    y: bezierPoint(y0, cy1, cy2, distal.y, t)
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
