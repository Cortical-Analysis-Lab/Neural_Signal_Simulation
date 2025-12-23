// =====================================================
// POSTSYNAPTIC NEURON GEOMETRY (NEURON 2)
// MILD SHOLL BIAS + CLEAR TRUNK → BRANCH → TWIG HIERARCHY
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
// Mild Sholl-style probability curve
// Peaks away from soma, suppresses clutter
// -----------------------------------------------------
function shollWeight(t) {
  // t = 0 (soma) → 1 (distal)
  return sin(t * PI); // very mild, symmetric
}

// -----------------------------------------------------
// Initialize neuron 2 geometry
// -----------------------------------------------------
function initNeuron2() {

  neuron2.dendrites = [];
  neuron2.synapses  = [];

  // ---------------------------------------------------
  // 1) Lock to presynaptic bouton
  // ---------------------------------------------------
  const preBranch = neuron.axon.terminalBranches[1];

  const presynapticBouton = {
    x: preBranch.end.x,
    y: preBranch.end.y
  };

  const dendriteContact = {
    x: presynapticBouton.x + SYNAPTIC_CLEFT,
    y: presynapticBouton.y + random(-3, 3)
  };

  // ---------------------------------------------------
  // 2) Soma placement
  // ---------------------------------------------------
  neuron2.soma.x = dendriteContact.x + SOMA_OFFSET;
  neuron2.soma.y = dendriteContact.y + random(-20, 20);

  // ---------------------------------------------------
  // 3) Trunk angles
  // ---------------------------------------------------
  const synapseAngle = degrees(
    atan2(
      dendriteContact.y - neuron2.soma.y,
      dendriteContact.x - neuron2.soma.x
    )
  );

  const trunkAngles = [
    synapseAngle,
    synapseAngle + 110,
    synapseAngle - 110
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
        : random(85, 100);

    const trunkSegments = 4;
    const trunk = [];

    // 🔑 THICK TRUNK BASE
    trunk.push({
      x: neuron2.soma.x,
      y: neuron2.soma.y,
      r: 7.2
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
        r: lerp(7.2, 3.4, t) // slower taper
      });
    }

    neuron2.dendrites.push(trunk);

    // -------------------------------------------------
    // 4) SECONDARY BRANCHES (SHOLL-BIASED)
    // -------------------------------------------------
    for (let i = 1; i < trunk.length - 1; i++) {

      const t = i / (trunk.length - 1);
      if (random() > shollWeight(t)) continue;

      const origin = trunk[i];

      const side = random() < 0.5 ? -1 : 1;
      const branchAngle = baseAngle + side * random(35, 55);
      const branchLength = random(34, 48);

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

      neuron2.dendrites.push(branch);

      // -----------------------------------------------
      // 5) TERMINAL TWIGS (SPARSE, OPPOSING)
      // -----------------------------------------------
      const twigAngles = [
        branchAngle + random(-18, -10),
        branchAngle + random(10, 18)
      ];

      twigAngles.forEach(tAngle => {

        if (random() < 0.4) return; // suppress clutter

        const twigLen = random(14, 22);

        const twigEnd = {
          x: end.x + cos(radians(tAngle)) * twigLen,
          y: end.y + sin(radians(tAngle)) * twigLen
        };

        neuron2.dendrites.push([
          ...branch,
          { x: twigEnd.x, y: twigEnd.y, r: 1.5 }
        ]);
      });
    }
  });

  // ---------------------------------------------------
  // 6) Postsynaptic density marker
  // ---------------------------------------------------
  neuron2.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });
}
