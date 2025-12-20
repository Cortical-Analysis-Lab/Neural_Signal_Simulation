// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// =====================================================
console.log("neuron2 geometry loaded");

// -----------------------------------------------------
// Tunable biological parameters
// -----------------------------------------------------
const SYNAPTIC_CLEFT = 14;   // visible synaptic gap (px)
const SOMA_OFFSET    = 110;  // distance from synapse to soma

// -----------------------------------------------------
const neuron2 = {
  somaRadius: 34,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: []
};

// -----------------------------------------------------
// Initialize neuron 2 geometry
// MUST be called AFTER neuron 1 axon terminals exist
// -----------------------------------------------------
function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses  = [];

  // ---------------------------------------------------
  // 1) Choose ONE presynaptic terminal branch (LOCKED)
  // ---------------------------------------------------
  const preBranch = neuron.axon.terminalBranches[1];

  const presynapticBouton = {
    x: preBranch.end.x,
    y: preBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Postsynaptic contact point (dendritic tip)
  // ---------------------------------------------------
  const dendriteContact = {
    x: presynapticBouton.x + SYNAPTIC_CLEFT,
    y: presynapticBouton.y + random(-3, 3)
  };

  // ---------------------------------------------------
  // 3) Soma placement (well separated)
  // ---------------------------------------------------
  neuron2.soma.x = dendriteContact.x + SOMA_OFFSET;
  neuron2.soma.y = dendriteContact.y + random(-20, 20);

  // ---------------------------------------------------
  // 4) PRIMARY DENDRITE (CONNECTED TO AXON TERMINAL)
  //    Built distal → proximal for smooth rendering
  // ---------------------------------------------------
  const primaryDendrite = [
    {
      x: dendriteContact.x,
      y: dendriteContact.y,
      r: 2.2
    },
    {
      x: lerp(dendriteContact.x, neuron2.soma.x, 0.45),
      y: lerp(dendriteContact.y, neuron2.soma.y, 0.45),
      r: 3.2
    },
    {
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 4.4
    }
  ];

  neuron2.dendrites.push(primaryDendrite);

  // ---------------------------------------------------
  // 5) SECONDARY DENDRITES (FREE BRANCHING)
  // ---------------------------------------------------
  const branchAngles = [140, 200, 250];

  branchAngles.forEach(angle => {

    const base = polarToCartesian(angle, neuron2.somaRadius + 8);
    const mid  = polarToCartesian(angle + random(-10, 10), 90);
    const tip  = polarToCartesian(angle + random(-18, 18), 150);

    neuron2.dendrites.push([
      {
        x: neuron2.soma.x + tip.x,
        y: neuron2.soma.y + tip.y,
        r: 1.6
      },
      {
        x: neuron2.soma.x + mid.x,
        y: neuron2.soma.y + mid.y,
        r: 2.4
      },
      {
        x: neuron2.soma.x + base.x,
        y: neuron2.soma.y + base.y,
        r: 3.6
      }
    ]);
  });

  // ---------------------------------------------------
  // 6) POSTSYNAPTIC DENSITY (VISUAL MARKER ONLY)
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });
}
