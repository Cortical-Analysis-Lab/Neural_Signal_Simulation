// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// MATCHES NEURON 1 STYLE (TRUNK → BRANCH → TWIG)
// =====================================================
console.log("neuron2 geometry loaded");

// -----------------------------------------------------
// Tunable biological parameters
// -----------------------------------------------------
const SYNAPTIC_CLEFT = 30;   // visible synaptic gap (px)
const SOMA_OFFSET    = 140;  // distance from synapse to soma

// -----------------------------------------------------
const neuron2 = {
  somaRadius: 34,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: [],

  axon: {
    length: 260,
    angle: -20
  }
};

// -----------------------------------------------------
// Initialize neuron 2 geometry
// MUST be called AFTER neuron 1 axon terminals exist
// -----------------------------------------------------
function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses  = [];

  // ---------------------------------------------------
  // 1) Lock to one presynaptic terminal bouton
  // ---------------------------------------------------
  const preBranch = neuron.axon.terminalBranches[1];

  const presynapticBouton = {
    x: preBranch.end.x,
    y: preBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Postsynaptic dendritic contact
  // ---------------------------------------------------
  const dendriteContact = {
    x: presynapticBouton.x + SYNAPTIC_CLEFT,
    y: presynapticBouton.y + random(-3, 3)
  };

  // ---------------------------------------------------
  // 3) Soma placement
  // ---------------------------------------------------
  neuron2.soma.x = dendriteContact.x + SOMA_OFFSET;
  neuron2.soma.y = dendriteContact.y + random(-20, 20);

  // ---------------------------------------------------
  // 4) THREE PRIMARY DENDRITIC TRUNKS
  // ---------------------------------------------------
  const baseAngles = [
    degrees(
      atan2(
        dendriteContact.y - neuron2.soma.y,
        dendriteContact.x - neuron2.soma.x
      )
    ),   // trunk aligned to synapse
    140, // secondary trunk
    250  // secondary trunk
  ];

  baseAngles.forEach((baseAngle, trunkIndex) => {

    const trunkLength = trunkIndex === 0
      ? dist(
          neuron2.soma.x,
          neuron2.soma.y,
          dendriteContact.x,
          dendriteContact.y
        )
      : random(120, 160);

    const trunkSegments = 4;
    const trunk = [];

    trunk.push({
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 6.2
    });

    for (let i = 1; i <= trunkSegments; i++) {

      const t = i / trunkSegments;
      const bend = sin(t * PI) * random(-4, 4);

      const p = polarToCartesian(
        baseAngle + bend,
        trunkLength * t
      );

      trunk.push({
        x: neuron2.soma.x + p.x,
        y: neuron2.soma.y + p.y,
        r: lerp(6.2, 2.6, t)
      });
    }

    // Push trunk as visible geometry
    neuron2.dendrites.push(trunk);

    // -------------------------------------------------
    // 5) SECONDARY BRANCHES OFF EACH TRUNK
    // -------------------------------------------------
    const branchCount = trunkIndex === 0 ? 2 : 3;

    for (let i = 0; i < branchCount; i++) {

      const idx = floor(random(1, trunk.length - 1));
      const origin = trunk[idx];

      const side = random() < 0.5 ? -1 : 1;
      const branchAngle = baseAngle + side * random(40, 65);
      const branchLength = random(55, 75);

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

      // -----------------------------------------------
      // 6) TERMINAL TWIGS
      // -----------------------------------------------
      const twigCount = floor(random(1, 3));

      for (let j = 0; j < twigCount; j++) {

        const twigAngle = branchAngle + random(-25, 25);

        const twigEnd = {
          x: end.x + cos(radians(twigAngle)) * random(20, 34),
          y: end.y + sin(radians(twigAngle)) * random(20, 34)
        };

        neuron2.dendrites.push([
          ...branch,
          { x: twigEnd.x, y: twigEnd.y, r: 1.8 }
        ]);
      }
    }
  });

  // ---------------------------------------------------
  // 7) POSTSYNAPTIC DENSITY (VISUAL MARKER ONLY)
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });
}
