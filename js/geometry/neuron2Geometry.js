// =====================================================
// POSTSYNAPTIC NEURON (PARTIAL, VISUAL)
// =====================================================
console.log("neuron2 geometry loaded");

const neuron2 = {
  somaRadius: 32,
  soma: { x: 340, y: 0 },   // downstream from axon
  dendrites: [],
  synapses: []
};

function initNeuron2() {
  neuron2.dendrites = [];
  neuron2.synapses = [];

  const baseAngle = 160;
  const angles = [140, 180, 220];

  angles.forEach(a => {
    const base = polarToCartesian(a, neuron2.somaRadius + 4);
    const mid  = polarToCartesian(a + random(-10, 10), 70);
    const tip  = polarToCartesian(a + random(-15, 15), 120);

    const branch = [
      { x: neuron2.soma.x + base.x, y: neuron2.soma.y + base.y, r: 3 },
      { x: neuron2.soma.x + mid.x,  y: neuron2.soma.y + mid.y,  r: 2 },
      { x: neuron2.soma.x + tip.x,  y: neuron2.soma.y + tip.y,  r: 1.5 }
    ];

    neuron2.dendrites.push(branch);

    // Single postsynaptic synapse target
    neuron2.synapses.push({
      x: branch[branch.length - 1].x,
      y: branch[branch.length - 1].y,
      radius: 10,
      type: "exc"
    });
  });
}
