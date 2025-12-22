// =====================================================
// INHIBITORY INTERNEURON GEOMETRY (NEURON 3)
// =====================================================
console.log("neuron3 geometry loaded");

// -----------------------------------------------------
const NEURON3_SOMA_OFFSET = { x: -160, y: -180 }; // ⬅️ up + left
const NEURON3_DENDRITE_SECTOR = [210, 330];       // degrees (exclusive)

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

  const bouton = {
    x: topBranch.end.x,
    y: topBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Postsynaptic contact
  // ---------------------------------------------------
  const dendriteContact = {
    x: bouton.x - 28,
    y: bouton.y - 6
  };

  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });

  // ---------------------------------------------------
  // 3) Soma position (FORCED up + left)
  // ---------------------------------------------------
  neuron3.soma.x = dendriteContact.x + NEURON3_SOMA_OFFSET.x;
  neuron3.soma.y = dendriteContact.y + NEURON3_SOMA_OFFSET.y;

  // ---------------------------------------------------
  // 4) Dendrites (sector-limited, no overlap possible)
  // ---------------------------------------------------
  const trunkCount = 3;

  for (let i = 0; i < trunkCount; i++) {

    const baseAngle = random(
      NEURON3_DENDRITE_SECTOR[0],
      NEURON3_DENDRITE_SECTOR[1]
    );

    const trunkLength = random(110, 150);
    const trunk = [];

    trunk.push({
      x: neuron3.soma.x,
      y: neuron3.soma.y,
      r: 5.4
    });

    const segments = 4;
    for (let s = 1; s <= segments; s++) {

      const t = s / segments;
      const bend = sin(t * PI) * random(-4, 4);

      const p = polarToCartesian(baseAngle + bend, trunkLength * t);

      trunk.push({
        x: neuron3.soma.x + p.x,
        y: neuron3.soma.y + p.y,
        r: lerp(5.4, 2.2, t)
      });
    }

    neuron3.dendrites.push(trunk);
  }
}
