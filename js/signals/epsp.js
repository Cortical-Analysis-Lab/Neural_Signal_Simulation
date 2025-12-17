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

function drawEPSPs() {
  if (!neuron.synapses || neuron.synapses.length === 0) return;

  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    const d = neuron.dendrites[e.synapseId];
    if (!syn || !d) return;

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
