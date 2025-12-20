// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// =====================================================
console.log("neuron2 geometry loaded");

const SYNAPTIC_CLEFT = 14;   // visible gap
const SOMA_OFFSET    = 90;   // keep soma well away from synapse

const neuron2 = {
  somaRadius: 34,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: []
};

// -----------------------------------------------------
// Initialize neuron 2 geometry (STRUCTURAL ONLY)
// -----------------------------------------------------
function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses  = [];

  // ---------------------------------------------------
  // 1) Choose ONE presynaptic terminal branch (stable)
  // ---------------------------------------------------
  const preBranch = neuron.axon.terminalBranches[1];

  const presynapticBouton = {
    x: preBranch.end.x,
    y: preBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Define postsynaptic contact point (on dendrite)
  // ---------------------------------------------------
  const dendriteContact = {
    x: presynapticBouton.x + SYNAPTIC_CLEFT,
    y: presynapticBouton.y
  };

  // ---------------------------------------------------
  // 3) Place soma FARTHER DOWNSTREAM
  // ---------------------------------------------------
  neuron2.soma.x = dendriteContact.x + SOMA_OFFSET;
  neuron2.soma.y = dendriteContact.y + random(-25, 25);

  // ---------------------------------------------------
  // 4) PRIMARY DENDRITE (CONNECTED TO TERMINAL)
  // ---------------------------------------------------
  const primaryDendrite = [
    {
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 4
    },
    {
      x: lerp(neuron2.soma.x, dendriteContact.x, 0.55),
      y: lerp(neuron2.soma.y, dendriteContact.y, 0.55),
      r: 3
    },
    {
      x: dendriteContact.x,
      y: dendriteContact.y,
      r: 2
    }
  ];

  neuron2.dendrites.push(primaryDendrite);

  // ---------------------------------------------------
  // 5) SECONDARY DENDRITES (FREE BRANCHING)
  // ---------------------------------------------------
  const branchAngles = [150, 210, 245];

  branchAngles.forEach(a => {
    const base = polarToCartesian(a, neuron2.somaRadius + 6);
    const mid  = polarToCartesian(a + random(-12, 12), 80);
    const tip  = polarToCartesian(a + random(-18, 18), 130);

    neuron2.dendrites.push([
      {
        x: neuron2.soma.x + base.x,
        y: neuron2.soma.y + base.y,
        r: 3
      },
      {
        x: neuron2.soma.x + mid.x,
        y: neuron2.soma.y + mid.y,
        r: 2
      },
      {
        x: neuron2.soma.x + tip.x,
        y: neuron2.soma.y + tip.y,
        r: 1.5
      }
    ]);
  });

  // ---------------------------------------------------
  // 6) POSTSYNAPTIC DENSITY (VISUAL ONLY)
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });
}
