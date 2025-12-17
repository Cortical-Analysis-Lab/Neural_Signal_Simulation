// =====================================================
// NEURON GEOMETRY
// =====================================================

const neuron = {
  somaRadius: 40,

  dendrites: [
    { angle: -140, length: 220 },
    { angle: -60,  length: 240 },
    { angle: 30,   length: 200 }
  ],

  synapses: [] // filled during initialization
};

// Convert polar to Cartesian
function polarToCartesian(angleDeg, r) {
  const a = radians(angleDeg);
  return {
    x: cos(a) * r,
    y: sin(a) * r
  };
}

// Initialize synapses at the end of dendrites
function initSynapses() {
  neuron.synapses = neuron.dendrites.map((d, i) => {
    const pos = polarToCartesian(d.angle, d.length);
    return {
      id: i,
      x: pos.x,
      y: pos.y,
      radius: 12,   // bouton size (will encode strength later)
      hovered: false
    };
  });
}
