// =====================================================
// INHIBITORY POSTSYNAPTIC NEURON GEOMETRY (NEURON 3)
// MATCHES NEURON 2 STYLE (TRUNK → BRANCH → TWIG)
// =====================================================
console.log("neuron3 geometry loaded");

// -----------------------------------------------------
// Tunable biological parameters
// -----------------------------------------------------
const SYNAPTIC_CLEFT_3 = 30;
const SOMA_OFFSET_3    = 160;

// -----------------------------------------------------
const neuron3 = {
  somaRadius: 32,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: [],

  axon: {
    length: 220,
    angle: -140   // points away (not functionally used yet)
  }
};

// -----------------------------------------------------
// Initialize neuron 3 geometry
// MUST be called AFTER neuron 1 axon terminals exist
// -----------------------------------------------------
function initNeuron3() {

  neuron3.dendrites = [];
  neuron3.synapses  = [];

  // ---------------------------------------------------
  // 1) Lock to a DIFFERENT presynaptic terminal branch
  //    (avoid neuron 2 overlap)
  // ---------------------------------------------------
  const preBranch = neuron.axon.terminalBranches[2];

  const presynapticBouton = {
    x: preBranch.end.x,
    y: preBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Postsynaptic dendritic contact
  // ---------------------------------------------------
  const dendriteContact = {
    x: presynapticBouton.x + SYNAPTIC_CLEFT_3,
    y: presynapticBouton.y + random(-4, 4)
  };

  // ---------------------------------------------------
  // 3) Soma placement (TOP-RIGHT OFFSET)
  // ---------------------------------------------------
  neuron3.soma.x = dendriteContact.x + SOMA_OFFSET_3;
  neuron3.soma.y = dendriteContact.y - 140; // lift upward to avoid neuron 2

  // ---------------------------------------------------
  // 4) THREE PRIMARY DENDRITIC TRUNKS
  // ---------------------------------------------------
  const baseAngles = [
    degrees(
      atan2(
        dendriteContact.y - neuron3.soma.y,
        dendriteContact.x - neuron3.soma.x
      )
    ),   // trunk aligned to synapse
    110,
    240
  ];

  baseAngles.forEach((baseAngle, trunkIndex) => {

    const trunkLength = trunkIndex === 0
      ? dist(
          neuron3.soma.x,
          neuron3.soma.y,
          dendriteContact.x,
          dendriteContact.y
        )
      : random(110, 150);

    const trunkSegments = 4;
    const trunk = [];

    trunk.push({
      x: neuron3.soma.x,
      y: neuron3.soma.y,
      r: 5.8
    });

    for (let i = 1; i <= trunkSegments; i++) {

      const t = i / trunkSegments;
      const bend = sin(t * PI) * random(-4, 4);

      const p = polarToCartesian(
        baseAngle + bend,
        trunkLength * t
      );

      trunk.push({
        x: neuron3.soma.x + p.x,
        y: neuron3.soma.y + p.y,
        r: lerp(5.8, 2.4, t)
      });
    }

    // Store trunk
    neuron3.dendrites.push(trunk);

    // -------------------------------------------------
    // 5) SECONDARY BRANCHES
    // -------------------------------------------------
    const branchCount = trunkIndex === 0 ? 2 : 3;

    for (let i = 0; i < branchCount; i++) {

      const idx = floor(random(1, trunk.length - 1));
      const origin = trunk[idx];

      const side = random() < 0.5 ? -1 : 1;
      const branchAngle = baseAngle + side * random(40, 65);
      const branchLength = random(50, 70);

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
        { x: end.x, y: end.y, r: 2.1 }
      ];

      // -----------------------------------------------
      // 6) TERMINAL TWIGS
      // -----------------------------------------------
      const twigCount = floor(random(1, 3));

      for (let j = 0; j < twigCount; j++) {

        const twigAngle = branchAngle + random(-25, 25);

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
  });

  // ---------------------------------------------------
  // 7) POSTSYNAPTIC DENSITY (INHIBITORY)
  // ---------------------------------------------------
  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7,
    type: "inh"   // 🔴 critical for IPSP
  });
}
