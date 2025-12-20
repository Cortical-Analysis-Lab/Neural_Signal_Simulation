// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// =====================================================
console.log("neuron2 geometry loaded");

const SYNAPTIC_CLEFT = 10;

const neuron2 = {
  somaRadius: 34,
  soma: { x: 260, y: 0 },
  dendrites: [],
  synapses: []
};

// -----------------------------------------------------
// Initialize neuron 2 geometry
// -----------------------------------------------------
function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses = [];

  // ---------------------------------------------------
  // 1️⃣ Choose ONE presynaptic terminal branch
  // ---------------------------------------------------
  const presynapticBranch = neuron.axon.terminalBranches[1]; // stable index

  const target = {
    x: presynapticBranch.end.x + SYNAPTIC_CLEFT,
    y: presynapticBranch.end.y
  };

  // ---------------------------------------------------
  // 2️⃣ Position soma downstream of synapse
  // ---------------------------------------------------
  neuron2.soma.x = target.x + 60;
  neuron2.soma.y = target.y + random(-20, 20);

  // ---------------------------------------------------
  // 3️⃣ Primary dendrite toward presynaptic terminal
  // ---------------------------------------------------
  const primary = [
    {
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 4
    },
    {
      x: lerp(neuron2.soma.x, target.x, 0.5),
      y: lerp(neuron2.soma.y, target.y, 0.5),
      r: 3
    },
    {
      x: target.x,
      y: target.y,
      r: 2
    }
  ];

  neuron2.dendrites.push(primary);

  // ---------------------------------------------------
  // 4️⃣ Additional dendritic branches
  // ---------------------------------------------------
  const angles = [140, 200, 240];

  angles.forEach(a => {
    const base = polarToCartesian(a, neuron2.somaRadius + 6);
    const mid  = polarToCartesian(a + random(-10, 10), 90);
    const tip  = polarToCartesian(a + random(-15, 15), 140);

    neuron2.dendrites.push([
      { x: neuron2.soma.x + base.x, y: neuron2.soma.y + base.y, r: 3 },
      { x: neuron2.soma.x + mid.x,  y: neuron2.soma.y + mid.y,  r: 2 },
      { x: neuron2.soma.x + tip.x,  y: neuron2.soma.y + tip.y,  r: 1.5 }
    ]);
  });

  // ---------------------------------------------------
  // 5️⃣ Postsynaptic site (visual only for now)
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: target.x,
    y: target.y,
    radius: 7
  });
}
