// =====================================================
// INHIBITORY INTERNEURON GEOMETRY (NEURON 3)
// =====================================================
console.log("neuron3 geometry loaded");

// -----------------------------------------------------
// Placement tuning (used explicitly)
// -----------------------------------------------------
const NEURON3_OFFSET = { x: 110, y: -150 }; // open space above + right
const NEURON3_DENDRITE_SECTOR = [-120, -40]; // upward-facing only

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
  // 1) Select TOPMOST axon terminal from neuron 1
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
  // 2) Postsynaptic contact (fixed to bouton)
  // ---------------------------------------------------
  const dendriteContact = {
    x: bouton.x - 24,
    y: bouton.y - 8
  };

  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });

  // ---------------------------------------------------
  // 3) Soma placement — EXPLICIT OFFSET (no angles)
  // ---------------------------------------------------
  neuron3.soma.x = dendriteContact.x + NEURON3_OFFSET.x;
  neuron3.soma.y = dendriteContact.y + NEURON3_OFFSET.y;

  // ---------------------------------------------------
  // 4) PRIMARY DENDRITIC TRUNK (connects to synapse)
  // ---------------------------------------------------
  const trunk = [];
  const trunkSegments = 5;

  trunk.push({
    x: neuron3.soma.x,
    y: neuron3.soma.y,
    r: 5.6
  });

  const trunkAngle = degrees(
    atan2(
      dendriteContact.y - neuron3.soma.y,
      dendriteContact.x - neuron3.soma.x
    )
  );

  const trunkLength = dist(
    neuron3.soma.x,
    neuron3.soma.y,
    dendriteContact.x,
    dendriteContact.y
  );

  for (let i = 1; i <= trunkSegments; i++) {
    const t = i / trunkSegments;
    const bend = sin(t * PI) * 4;

    const p = polarToCartesian(
      trunkAngle + bend,
      trunkLength * t
    );

    trunk.push({
      x: neuron3.soma.x + p.x,
      y: neuron3.soma.y + p.y,
      r: lerp(5.6, 2.6, t)
    });
  }

  neuron3.dendrites.push(trunk);

  // ---------------------------------------------------
  // 5) SECONDARY DENDRITES (UPWARD ONLY, NO OVERLAP)
  // ---------------------------------------------------
  const secondaryCount = 3;

  for (let i = 0; i < secondaryCount; i++) {

    const originIdx = floor(random(1, trunk.length - 2));
    const origin = trunk[originIdx];

    const branchAngle = random(
      NEURON3_DENDRITE_SECTOR[0],
      NEURON3_DENDRITE_SECTOR[1]
    );

    const branchLength = random(55, 80);

    const mid = {
      x: origin.x + cos(radians(branchAngle)) * branchLength * 0.5,
      y: origin.y + sin(radians(branchAngle)) * branchLength * 0.5
    };

    const end = {
      x: origin.x + cos(radians(branchAngle)) * branchLength,
      y: origin.y + sin(radians(branchAngle)) * branchLength
    };

    const branch = [
      origin,
      { x: mid.x, y: mid.y, r: 2.6 },
      { x: end.x, y: end.y, r: 2.2 }
    ];

    neuron3.dendrites.push(branch);

    // -------------------------------------------------
    // 6) TERMINAL TWIGS
    // -------------------------------------------------
    const twigCount = floor(random(1, 3));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle = branchAngle + random(-25, 25);

      const twigEnd = {
        x: end.x + cos(radians(twigAngle)) * random(16, 30),
        y: end.y + sin(radians(twigAngle)) * random(16, 30)
      };

      neuron3.dendrites.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 1.7 }
      ]);
    }
  }
}
