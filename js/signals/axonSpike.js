// =====================================================
// AXON ACTION POTENTIAL PROPAGATION
// =====================================================
console.log("axonSpike loaded");

// Active axon spikes
const axonSpikes = [];

// -----------------------------------------------------
// Spawn spike at hillock
// -----------------------------------------------------
function spawnAxonSpike() {
  axonSpikes.push({
    t: 0,          // progress along axon (0 → 1)
    speed: 0.035   // conduction velocity
  });
}

// -----------------------------------------------------
// Update spike motion
// -----------------------------------------------------
function updateAxonSpikes() {
  for (let i = axonSpikes.length - 1; i >= 0; i--) {
    axonSpikes[i].t += axonSpikes[i].speed;

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
