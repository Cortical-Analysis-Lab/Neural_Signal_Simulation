// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY
// =====================================================

const neuron = {
  somaRadius: 42,

  dendrites: [],      // array of branch paths (arrays of points)
  synapses: [],       // boutons anchored to dendrites

  hillock: {
    length: 14,
    width: 8
  },

  axon: {
    length: 160,
    curvature: 0.15
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
// Geometry Initialization (called once in setup)
// -----------------------------------------------------
function initSynapses() {

  neuron.dendrites = [];
  neuron.synapses = [];

  const primaryAngles = [160, 200, 240]; // LEFT-facing fan
  let synapseId = 0;

  primaryAngles.forEach((angle, i) => {

    const base = polarToCartesian(angle, neuron.somaRadius + 6);
    const mid  = polarToCartesian(angle + random(-12, 12), 110);
    const end  = polarToCartesian(angle + random(-18, 18), 190);

    const branch = [
      { x: base.x, y: base.y, r: 4 },
      { x: mid.x,  y: mid.y,  r: 3 },
      { x: end.x,  y: end.y,  r: 2 }
    ];

    neuron.dendrites.push(branch);

    // Optional small side branch (1 max)
    if (random() < 0.7) {
      const sideAngle = angle + random(-40, -20);
      const side = polarToCartesian(sideAngle, 140);

      neuron.dendrites.push([
        { x: mid.x, y: mid.y, r: 2.5 },
        { x: side.x, y: side.y, r: 1.5 }
      ]);
    }

    // Synapse near distal end of primary branch
    neuron.synapses.push({
      id: synapseId++,
      x: end.x + random(-6, 6),
      y: end.y + random(-6, 6),
      radius: 12,
      hovered: false,
      dendriteIndex: neuron.dendrites.length - 1
    });
  });
}
