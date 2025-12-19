// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (VISUAL ONLY)
// =====================================================
console.log("neuron2 geometry loaded");

const neuron2 = {
  somaRadius: 32,
  soma: { x: 380, y: 0 },
  dendrites: [],
  synapses: []
};

function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses = [];

  neuron.axon.terminalBranches.forEach((t, i) => {

    const gap = 12;
    const dx = t.end.x - neuron2.soma.x;
    const dy = t.end.y - neuron2.soma.y;
    const mag = sqrt(dx * dx + dy * dy);

    const tip = {
      x: t.end.x + (dx / mag) * gap,
      y: t.end.y + (dy / mag) * gap
    };

    const mid = {
      x: lerp(neuron2.soma.x, tip.x, 0.6),
      y: lerp(neuron2.soma.y, tip.y, 0.6)
    };

    neuron2.dendrites.push([
      { x: neuron2.soma.x, y: neuron2.soma.y, r: 3 },
      { x: mid.x,          y: mid.y,          r: 2 },
      { x: tip.x,          y: tip.y,          r: 1.5 }
    ]);

    neuron2.synapses.push({
      x: tip.x,
      y: tip.y,
      radius: 6,
      type: "exc"
    });
  });
}
