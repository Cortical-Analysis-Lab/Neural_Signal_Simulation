// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
// =====================================================
console.log("geometry loaded");

const neuron = {
  somaRadius: 42,
  dendrites: [],
  synapses: [],
  hillock: { length: 14, width: 8 },

  axon: {
    length: 160,
    terminalBranches: []
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
// LOCAL axon endpoint helper (GEOMETRY-ONLY)
// -----------------------------------------------------
function getAxonEndPoint() {
  const x0 = neuron.somaRadius + 10;

  return {
    x: bezierPoint(
      x0,
      neuron.somaRadius + 70,
      neuron.somaRadius + 120,
      neuron.somaRadius + neuron.axon.length,
      1
    ),
    y: bezierPoint(
      0,
      14,
      -14,
      0,
      1
    )
  };
}

// -----------------------------------------------------
// Build a continuous path from synapse → soma
// -----------------------------------------------------
function buildPathToSoma(branch) {
  const path = [];
  for (let i = branch.length - 1; i >= 0; i--) {
    path.push({ x: branch[i].x, y: branch[i].y });
  }
  path.push({ x: 0, y: 0 });
  return path;
}

// -----------------------------------------------------
// Initialize dendrites + synapses ONCE
// -----------------------------------------------------
function initSynapses() {
  neuron.dendrites = [];
  neuron.synapses = [];
  neuron.axon.terminalBranches = [];

  const primaryAngles = [150, 170, 200, 220, 250, 270];
  let synapseId = 0;

  primaryAngles.forEach(angle => {

    const base   = polarToCartesian(angle, neuron.somaRadius + 6);
    const mid    = polarToCartesian(angle + random(-12, 12), 110);
    const distal = polarToCartesian(angle + random(-18, 18), 190);

    const primaryBranch = [
      { x: base.x,   y: base.y,   r: 4 },
      { x: mid.x,    y: mid.y,    r: 3 },
      { x: distal.x, y: distal.y, r: 2 }
    ];

    neuron.dendrites.push(primaryBranch);

    const branchEnd = primaryBranch[primaryBranch.length - 1];

    neuron.synapses.push({
      id: synapseId++,
      x: branchEnd.x + random(-8, 8),
      y: branchEnd.y + random(-8, 8),
      radius: 12,
      hovered: false,
      selected: false,
      type: null,
      path: buildPathToSoma(primaryBranch)
    });
  });

  assignSynapseTypes();
  initAxonTerminalBranches();
}

// -----------------------------------------------------
// Enforce 3–4 excitatory, 2–3 inhibitory synapses
// -----------------------------------------------------
function assignSynapseTypes() {
  const syns = neuron.synapses;
  if (syns.length === 0) return;

  const inhCount = random() < 0.5 ? 2 : 3;
  const indices = syns.map((_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < inhCount; i++) syns[indices[i]].type = "inh";
  for (let i = inhCount; i < indices.length; i++) syns[indices[i]].type = "exc";
}

// -----------------------------------------------------
// Curved axon terminal branching + boutons (DISTAL)
// -----------------------------------------------------
function initAxonTerminalBranches() {

  const base = getAxonEndPoint();

  neuron.axon.terminalBranches = [
    createTerminalBranch(base, 40, -22),
    createTerminalBranch(base, 48, 4),
    createTerminalBranch(base, 36, 24)
  ];
}

// -----------------------------------------------------
function createTerminalBranch(base, dx, dy) {

  return {
    start: { x: base.x, y: base.y },

    ctrl: {
      x: base.x + dx * 0.6,
      y: base.y + dy * 0.6 + random(-6, 6)
    },

    end: {
      x: base.x + dx,
      y: base.y + dy
    },

    boutonRadius: 6
  };
}
