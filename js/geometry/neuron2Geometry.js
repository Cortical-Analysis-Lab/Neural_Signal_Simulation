// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// MATCHES NEURON 1 STYLE (TRUNK → BRANCH → TWIG)
// =====================================================
console.log("neuron2 geometry loaded");

// -----------------------------------------------------
// Tunable biological parameters
// -----------------------------------------------------
const SYNAPTIC_CLEFT = 30;
const SOMA_OFFSET    = 140;

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
  // 1) Lock to presynaptic bouton (neuron 1)
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
  // 3) Soma placement (pulled away from neuron 1)
  // ---------------------------------------------------
  neuron2.soma.x = dendriteContact.x + SOMA_OFFSET;
  neuron2.soma.y = dendriteContact.y + random(-20, 20);

  // ---------------------------------------------------
  // 4) PRIMARY DENDRITIC TRUNKS
  // ---------------------------------------------------
  const synapseAngle = degrees(
    atan2(
      dendriteContact.y - neuron2.soma.y,
      dendriteContact.x - neuron2.soma.x
    )
  );

  const trunkAngles = [
    synapseAngle,        // synaptic trunk
    synapseAngle + 110,  // lateral
    synapseAngle - 110   // lateral
  ];

  trunkAngles.forEach((baseAngle, trunkIndex) => {

    const trunkLength =
      trunkIndex === 0
        ? dist(
            neuron2.soma.x,
            neuron2.soma.y,
            dendriteContact.x,
            dendriteContact.y
          )
        : random(80, 100); // do NOT exceed neuron 1 scale

    const trunkSegments = 4;
    const trunk = [];

    trunk.push({
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 6.0
    });

    const curvatureBias =
      trunkIndex === 0 ? 0 :
      trunkIndex === 1 ? 4 : -4;

    for (let i = 1; i <= trunkSegments; i++) {
      const t = i / trunkSegments;
      const bend = sin(t * PI) * curvatureBias;

      const p = polarToCartesian(
        baseAngle + bend,
        trunkLength * t
      );

      trunk.push({
        x: neuron2.soma.x + p.x,
        y: neuron2.soma.y + p.y,
        r: lerp(6.0, 2.6, t)
      });
    }

    neuron2.dendrites.push(trunk);

    // -------------------------------------------------
    // 5) SECONDARY BRANCHES (SPARSE, BILATERAL)
    // -------------------------------------------------
    const branchCount = 2;

    for (let i = 0; i < branchCount; i++) {

      const idx = floor(random(1, trunk.length - 1));
      const origin = trunk[idx];

      const side = i % 2 === 0 ? 1 : -1;
      const branchAngle = baseAngle + side * random(35, 55);
      const branchLength = random(36, 50);

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

      neuron2.dendrites.push(branch);

      // -----------------------------------------------
      // 6) TERMINAL TWIGS (SHORT, OPPOSING PAIRS)
      // -----------------------------------------------
      const twigAngles = [
        branchAngle + random(-18, -8),
        branchAngle + random(8, 18)
      ];

      twigAngles.forEach(tAngle => {

        const twigLen = random(14, 22);

        const twigEnd = {
          x: end.x + cos(radians(tAngle)) * twigLen,
          y: end.y + sin(radians(tAngle)) * twigLen
        };

        neuron2.dendrites.push([
          ...branch,
          { x: twigEnd.x, y: twigEnd.y, r: 1.6 }
        ]);
      });
    }
  });

  // ---------------------------------------------------
  // 7) POSTSYNAPTIC DENSITY (VISUAL MARKER)
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });
}
