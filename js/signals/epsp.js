// =====================================================
// EPSP SIGNAL MODEL
// =====================================================

const epsps = [];

function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    progress: 0,               // 0 = synapse, 1 = soma
    amplitude: synapse.radius, // strength proxy
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
  stroke(80, 150, 255); // EPSP BLUE
  strokeWeight(3);
  noFill();

  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    const d = neuron.dendrites[e.synapseId];

    const start = polarToCartesian(d.angle, d.length);
    const end = { x: 0, y: 0 };

    const x = lerp(start.x, end.x, e.progress);
    const y = lerp(start.y, end.y, e.progress);

    push();
    strokeWeight(map(e.amplitude, 4, 30, 1, 6));
    point(x, y);
    pop();
  });
}
