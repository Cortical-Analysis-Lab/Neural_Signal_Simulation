// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY
// =====================================================
console.log("geometry loaded");

const neuron = {
  somaRadius: 42,
  dendrites: [],
  synapses: [],
  hillock: { length: 14, width: 8 },
  axon: { length: 160 }
};

// -----------------------------------------------------
// Utility
// -----------------------------------------------------
function polarToCartesian(angleDeg, r) {
  const a = radians(angleDeg);
  return { x: cos(a) * r, y: sin(a) * r };
}

// Build a continuous path from synapse → soma
function buildPathToSoma(branch) {
  const path = [];

  // distal → proximal
  for (let i = branch.length - 1; i >= 0; i--) {
    path.push({ x: branch[i].x, y: branch[i].y });
  }

  // final soma target
  path.push({ x: 0, y: 0 });

  return path;
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

    // ---------- Primary dendrite ----------
    const base   = polarToCartesian(angle, neuron.somaRadius + 6);
    const mid    = polarToCartesian(angle + random(-12, 12), 110);
    const distal = polarToCartesian(angle + random(-18, 18), 190);

    const primaryBranch = [
      { x: base.x,   y: base.y,   r: 4 },
      { x: mid.x,    y: mid.y,    r: 3 },
      { x: distal.x, y: distal.y, r: 2 }
    ];

    neuron.dendrites.push(primaryBranch);

    // ---------- Optional side branch ----------
    let sideBranch = null;

    if (random() < 1.0) {
      const sideAngle = angle + random(-40, -20);
      const side1 = polarToCartesian(sideAngle, 140);
      const side2 = {
        x: side1.x + random(-15, -25),
        y: side1.y + random(-10, 10)
      };

      sideBranch = [
        { x: mid.x,   y: mid.y,   r: 2.5 },
        { x: side1.x, y: side1.y, r: 1.8 },
        { x: side2.x, y: side2.y, r: 1.2 }
      ];

      neuron.dendrites.push(sideBranch);
    }

    // ---------- Choose synapse location ----------
    let targetBranch = primaryBranch;
    if (sideBranch && random() < 0.5) {
      targetBranch = sideBranch;
    }

    // ✅ THIS WAS THE BUG — branchEnd MUST be defined
    const branchEnd = targetBranch[targetBranch.length - 1];

    neuron.synapses.push({
      id: synapseId++,
      x: branchEnd.x + random(-8, 8),
      y: branchEnd.y + random(-8, 8),
      radius: 12,
      hovered: false,
      type: random() < 0.7 ? "exc" : "inh", // <-- ready for E/I demo
      path: buildPathToSoma(targetBranch)
    });
  });
}

function recenterNeuronGeometry() {
  let xs = [];
  let ys = [];

  // Collect all dendrite points
  neuron.dendrites.forEach(branch => {
    branch.forEach(p => {
      xs.push(p.x);
      ys.push(p.y);
    });
  });

  // Include synapse positions
  neuron.synapses.forEach(s => {
    xs.push(s.x);
    ys.push(s.y);
  });

  if (xs.length === 0) return;

  // Compute centroid
  const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const cy = ys.reduce((a, b) => a + b, 0) / ys.length;

  // Shift dendrites
  neuron.dendrites.forEach(branch => {
    branch.forEach(p => {
      p.x -= cx;
      p.y -= cy;
    });
  });

  // Shift synapses + their paths
  neuron.synapses.forEach(s => {
    s.x -= cx;
    s.y -= cy;

    if (s.path) {
      s.path.forEach(p => {
        p.x -= cx;
        p.y -= cy;
      });
    }
  });
}

