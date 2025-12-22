// =====================================================
// INHIBITORY INTERNEURON GEOMETRY (NEURON 3)
// =====================================================
console.log("neuron3 geometry loaded");

// -----------------------------------------------------
// Placement tuning (small, controlled shift)
// -----------------------------------------------------
const NEURON3_OFFSET = { x: 110, y: -150 }; // ⬅️ open upper-right space

// Secondary dendrites restricted upward only
const NEURON3_DENDRITE_SECTOR = [-120, -40]; // degrees

// -----------------------------------------------------
const neuron3 = {
  somaRadius: 30,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: []
};

// -----------------------------------------------------
// Initialize neuron 3
// -----------------------------------------------------
function initNeuron3() {

  neuron3.dendrites = [];
  neuron3.synapses  = [];

  // ---------------------------------------------------
  // 1) Find TOPMOST axon terminal from neuron 1
  // ---------------------------------------------------
  let topBranch = null;
  let minY = Infinity;

  neuron.axon.terminalBranches.forEach(b => {
    if (b.end.y < minY) {
      minY = b.end.y;
      topBranch = b;
    }
  });

  if (!topBranch) return;

  const bouton = { x: topBranch.end.x, y: topBranch.end.y };

  // ---------------------------------------------------
  // 2) Postsynaptic contact point
  // ---------------------------------------------------
  const dendriteContact = {
    x: bouton.x + 26,
    y: bouton.y - 6
  };

  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });

  // ---------------------------------------------------
  // 3) Soma placement (diagonal open space)
  // ---------------------------------------------------
  neuron3.soma.x = dendriteContact.x + NEURON3_OFFSET.x;
  neuron3.soma.y = dendriteContact.y + NEURON3_OFFSET.y;

  // ---------------------------------------------------
  // 4) PRIMARY CONNECTING DENDRITE (EXPLICIT)
  // ---------------------------------------------------
  neuron3.dendrites.push([
    { x: neuron3.soma.x, y: neuron3.soma.y, r: 5.2 },
    { x: dendriteContact.x, y: dendriteContact.y, r: 2.4 }
  ]);

  // ---------------------------------------------------
  // 5) SHORT SECONDARY DENDRITES (NON-OVERLAPPING)
  // ---------------------------------------------------
  const extraTrunks = 2;

  for (let i = 0; i < extraTrunks; i++) {

    const angle = random(
      NEURON3_DENDRITE_SECTOR[0],
      NEURON3_DENDRITE_SECTOR[1]
    );

    const length = random(55, 75);
    const trunk = [];

    trunk.push({
      x: neuron3.soma.x,
      y: neuron3.soma.y,
      r: 4.8
    });

    const segments = 3;
    for (let s = 1; s <= segments; s++) {

      const t = s / segments;
      const p = polarToCartesian(angle, length * t);

      trunk.push({
        x: neuron3.soma.x + p.x,
        y: neuron3.soma.y + p.y,
        r: lerp(4.8, 2.0, t)
      });
    }

    neuron3.dendrites.push(trunk);
  }
}
