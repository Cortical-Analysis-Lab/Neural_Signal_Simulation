// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY
// =====================================================
console.log("geometry loaded");

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

  const primaryAngles = [150, 170, 200, 220, 250, 270];
  let synapseId = 0;

  primaryAngles.forEach(angle => {

    // Primary dendrite (curved, tapered)
    const base = polarToCartesian(angle, neuron.somaRadius + 6);
    const mid  = polarToCartesian(angle + random(-12, 12), 110);
    const distal = polarToCartesian(angle + random(-18, 18), 190);

    const primaryBranch = [
      { x: base.x, y: base.y, r: 4 },
      { x: mid.x,  y: mid.y,  r: 3 },
      { x: end.x,  y: end.y,  r: 2 }
    ];

    neuron.dendrites.push(primaryBranch);

    // Optional small side branch (biological but clean)
    let sideBranch = null;

    if (random() < 1.0) {
      const sideAngle = angle + random(-40, -20);
      const side1 = polarToCartesian(sideAngle, 140);
      const side2 = {
        x: side1.x + random(-15, -25),
        y: side1.y + random(-10, 10)
      };

      sideBranch = [
        { x: mid.x,  y: mid.y,  r: 2.5 },
        { x: side1.x, y: side1.y, r: 1.8 },
        { x: side2.x, y: side2.y, r: 1.2 }
      ];

      neuron.dendrites.push(sideBranch);
    }

    // -------------------------
    // ONE synapse per dendritic tree
    // -------------------------
    let targetBranch = primaryBranch;
    
    // 50% chance to place synapse on side branch if it exists
    if (sideBranch && random() < 0.5) {
      targetBranch = sideBranch;
    }
    
    const end = targetBranch[targetBranch.length - 1];
    
       neuron.synapses.push({
      id: synapseId++,
      x: end.x + random(-8, 8),
      y: end.y + random(-8, 8),
      radius: 12,
      hovered: false,
      branch: targetBranch
    });

  });
}     
