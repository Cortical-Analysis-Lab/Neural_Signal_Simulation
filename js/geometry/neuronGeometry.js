// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
// =====================================================
console.log("geometry loaded");

const neuron = {
  somaRadius: 42,

  // Cellular substructure (VISUAL ONLY)
  nucleus: {
    radius: 14,
    offset: { x: 4, y: -3 }
  },

  nucleolus: {
    radius: 5,
    offset: { x: 7, y: -6 }
  },

  dendrites: [],
  synapses: [],

  hillock: {
    length: 16,
    widthStart: 10,
    widthEnd: 6
  },

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
  const x0 = neuron.somaRadius + neuron.hillock.length;

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

  const primaryAngles = [145, 165, 195, 220, 245, 270];
  let synapseId = 0;

  primaryAngles.forEach(angle => {

    // -----------------------------
    // Primary dendrite (organic curve)
    // -----------------------------
    const base   = polarToCartesian(angle, neuron.somaRadius + 6);

    const mid    = polarToCartesian(
      angle + random(-10, 10),
      110 + random(-6, 6)
    );

    const distal = polarToCartesian(
      angle + random(-18, 18),
      190 + random(-10, 10)
    );

    const primaryBranch = [
      { x: base.x,   y: base.y,   r: 4.2 },
      { x: mid.x,    y: mid.y,    r: 3.2 },
      { x: distal.x, y: distal.y, r: 2.4 }
    ];

    neuron.dendrites.push(primaryBranch);

    // -----------------------------
    // Synapse near distal tip
    // -----------------------------
    const branchEnd = primaryBranch[primaryBranch.length - 1];

    neuron.synapses.push({
      id: synapseId++,
      x: branchEnd.x + random(-6, 6),
      y: branchEnd.y + random(-6, 6),
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

  for (let i = 0; i < inhCount; i++) {
    syns[indices[i]].type = "inh";
  }

  for (let i = inhCount; i < indices.length; i++) {
    syns[indices[i]].type = "exc";
  }
}

// -----------------------------------------------------
// Curved axon terminal branching + boutons (DISTAL)
// -----------------------------------------------------
function initAxonTerminalBranches() {

  const base = getAxonEndPoint();

  neuron.axon.terminalBranches = [
    createTerminalBranch(base, 44, -26),
    createTerminalBranch(base, 56,   0),
    createTerminalBranch(base, 44,  28)
  ];
}

// -----------------------------------------------------
// Individual terminal branch generator
// -----------------------------------------------------
function createTerminalBranch(base, dx, dy) {

  return {
    start: { x: base.x, y: base.y },

    ctrl: {
      x: base.x + dx * 0.55,
      y: base.y + dy * 0.55 + random(-8, 8)
    },

    end: {
      x: base.x + dx,
      y: base.y + dy
    },

    boutonRadius: 6
  };
}

// =====================================================
// GLOBAL AXON GEOMETRY HELPER (USED BY SIGNALS)
// =====================================================
function getAxonPoint(t) {

  const x0 = neuron.somaRadius + neuron.hillock.length;

  return {
    x: bezierPoint(
      x0,
      neuron.somaRadius + 70,
      neuron.somaRadius + 120,
      neuron.somaRadius + neuron.axon.length,
      t
    ),
    y: bezierPoint(
      0,
      14,
      -14,
      0,
      t
    )
  };
}
