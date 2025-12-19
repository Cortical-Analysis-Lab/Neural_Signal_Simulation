// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
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

// -----------------------------------------------------
// Build a continuous path from synapse → soma
// -----------------------------------------------------
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
// Initialize dendrites + synapses ONCE
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

    const branchEnd = targetBranch[targetBranch.length - 1];

    neuron.synapses.push({
      id: synapseId++,
      x: branchEnd.x + random(-8, 8),
      y: branchEnd.y + random(-8, 8),
      radius: 12,
      hovered: false,
      selected: false,
      type: null, // assigned below
      path: buildPathToSoma(targetBranch)
    });
  });

  assignSynapseTypes();
}

// -----------------------------------------------------
// Enforce 3–4 excitatory, 2–3 inhibitory synapses
// -----------------------------------------------------
function assignSynapseTypes() {
  const syns = neuron.synapses;
  if (syns.length === 0) return;

  // Decide inhibitory count (2 or 3)
  const inhCount = random() < 0.5 ? 2 : 3;

  // Shuffle indices
  const indices = syns.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Assign inhibitory
  for (let i = 0; i < inhCount; i++) {
    syns[indices[i]].type = "inh";
  }

  // Assign remaining excitatory
  for (let i = inhCount; i < indices.length; i++) {
    syns[indices[i]].type = "exc";
  }
}
