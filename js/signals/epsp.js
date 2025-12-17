// =====================================================
// EPSP SIGNAL MODEL
// =====================================================

const epsps = [];

function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    progress: 0,
    amplitude: synapse.radius,
    speed: 0.006,
    decay: 0.995
  });
}

function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];
    e.progress += e.speed;
    e.amplitude *= e.decay;

    if (e.progress >= 1 || e.amplitude < 1) {
      epsps.splice(i, 1);
    }
  }
}

function drawEPSPs() {
  if (!window.neuron || !neuron.synapses) return;

  epsps.forEach(e => {
    const d = neuron.dendrites[e.synapseId];
    if (!d) return;

    const start = polarToCartesian(d.angle, d.length);
    const x = lerp(start.x, 0, e.progress);
    const y = lerp(start.y, 0, e.progress);

    push();
    stroke(80, 150, 255); // EPSP BLUE
    strokeWeight(map(e.amplitude, 6, 30, 4, 10));
    point(x, y);
    pop();
  });
}
