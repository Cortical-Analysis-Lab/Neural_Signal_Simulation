// =====================================================
// AXON ACTION POTENTIAL PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// Active axon spikes
const axonSpikes = [];
const AXON_CONDUCTION_SPEED = 0.035;

// -----------------------------------------------------
// Spawn spike at hillock
// -----------------------------------------------------
function spawnAxonSpike() {

  // Prevent visually overlapping spikes
  if (axonSpikes.length > 0) {
    const last = axonSpikes[axonSpikes.length - 1];
    if (last.t < 0.05) return;
  }

  axonSpikes.push({
    t: 0
  });
}

// -----------------------------------------------------
// Update spike motion
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    axonSpikes[i].t += AXON_CONDUCTION_SPEED;

    // Spike reached terminal
    if (axonSpikes[i].t >= 1) {
      axonSpikes.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw traveling spikes
// -----------------------------------------------------
function drawAxonSpikes() {
  axonSpikes.forEach(s => {
    const p = getAxonPoint(s.t);

    push();
    noStroke();
    fill(0, 255, 120);
    ellipse(p.x, p.y, 12, 12);
    pop();
  });
}
