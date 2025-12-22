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
// =====================================================
// INHIBITORY INTERNEURON GEOMETRY (NEURON 3)
// =====================================================
console.log("neuron3 geometry loaded");

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
  // 2) Synaptic contact (slightly offset from bouton)
  // ---------------------------------------------------
  const dendriteContact = {
    x: bouton.x - 26,
    y: bouton.y - 10
  };

  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });

  // ---------------------------------------------------
  // 3) Soma placement ABOVE the bouton (diagonal open space)
  // ---------------------------------------------------
  const SOMA_DISTANCE = 170;

  const somaAngle = radians(-70); // upward-left
  neuron3.soma.x = dendriteContact.x + cos(somaAngle) * SOMA_DISTANCE;
  neuron3.soma.y = dendriteContact.y + sin(somaAngle) * SOMA_DISTANCE;

  // ---------------------------------------------------
  // 4) PRIMARY DENDRITIC TRUNK (CONNECTS TO SYNAPSE)
  // ---------------------------------------------------
  const trunk = [];

  const trunkSegments = 5;

  trunk.push({
    x: neuron3.soma.x,
    y: neuron3.soma.y,
    r: 5.8
  });

  for (let i = 1; i <= trunkSegments; i++) {

    const t = i / trunkSegments;
    const bend = sin(t * PI) * 4;

    const p = polarToCartesian(
      degrees(atan2(
        dendriteContact.y - neuron3.soma.y,
        dendriteContact.x - neuron3.soma.x
      )) + bend,
      dist(
        neuron3.soma.x,
        neuron3.soma.y,
        dendriteContact.x,
        dendriteContact.y
      ) * t
    );

    trunk.push({
      x: neuron3.soma.x + p.x,
      y: neuron3.soma.y + p.y,
      r: lerp(5.8, 2.6, t)
    });
  }

  neuron3.dendrites.push(trunk);

  // ---------------------------------------------------
  // 5) SECONDARY BRANCHES (FAN AWAY FROM NEURON 2)
  // ---------------------------------------------------
  const secondaryCount = 3;

  for (let i = 0; i < secondaryCount; i++) {

    const originIdx = floor(random(1, trunk.length - 2));
    const origin = trunk[originIdx];

    const branchAngle = random(200, 310); // down-left sector
    const branchLength = random(60, 90);

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
      { x: mid.x, y: mid.y, r: 2.8 },
      { x: end.x, y: end.y, r: 2.2 }
    ];

    neuron3.dendrites.push(branch);

    // -------------------------------------------------
    // 6) TERMINAL TWIGS
    // -------------------------------------------------
    const twigCount = floor(random(1, 3));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle = branchAngle + random(-30, 30);

      const twigEnd = {
        x: end.x + cos(radians(twigAngle)) * random(18, 32),
        y: end.y + sin(radians(twigAngle)) * random(18, 32)
      };

      neuron3.dendrites.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 1.7 }
      ]);
    }
  }
}
