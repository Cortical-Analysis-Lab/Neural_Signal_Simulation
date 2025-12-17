// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY
// =====================================================

const neuron = {
  somaRadius: 42,

  dendrites: [],   // array of branch paths (arrays of points)
  synapses: [],    // boutons anchored to branches

  hillock: {
    length: 14,
    width: 8
  },

  axon: {
    length: 160
  }
};

// -----------------------------------------------------
// Utility
// -----------------------------------------------------
function polarToCartesian(angleDeg, r) {
  const a = radians(angleDeg);
  return { x: cos(a) * r, y: sin(a) * r };
}

// -----------------------------------------------------
// Initialize geometry ONCE
// -----------------------------------------------------
function initSynapses() {

  neuron.dendrites = [];
  neuron.synapses = [];

  const primaryAngles = [160, 200, 240]; // LEFT-facing fan
  let synapseId = 0;

  primaryAngles.forEach(angle => {

    // Primary dendrite (curved, tapered)
    const base = polarToCartesian(angle, neuron.somaRadius + 6);
    const mid  = polarToCartesian(angle + random(-12, 12), 110);
    const end  = polarToCartesian(angle + random(-18, 18), 190);

    const primaryBranch = [
      { x: base.x, y: base.y, r: 4 },
      { x: mid.x,  y: mid.y,  r: 3 },
      { x: end.x,  y: end.y,  r: 2 }
    ];

    neuron.dendrites.push(primaryBranch);

    // Optional small side branch (biological but clean)
    if (random() < 0.9) {
      const sideAngle = angle + random(-40, -20);
      const side1 = polarToCartesian(sideAngle, 140);
      const side2 = {
        x: side1.x + random(-15, -25),
        y: side1.y + random(-10, 10)
      };

      neuron.dendrites.push([
        { x: mid.x,  y: mid.y,  r: 2.5 },
        { x: side1.x, y: side1.y, r: 1.8 },
        { x: side2.x, y: side2.y, r: 1.2 }
      ]);
    }

    // Synapse near distal end of primary dendrite
    neuron.synapses.push({
      id: synapseId++,
      x: end.x + random(-6, 6),
      y: end.y + random(-6, 6),
      radius: 12,
      hovered: false,

      // CRITICAL: store actual branch reference
      branch: primaryBranch
    });
  });
}
