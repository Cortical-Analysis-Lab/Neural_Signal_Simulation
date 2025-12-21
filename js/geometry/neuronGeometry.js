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
// Utilities
// -----------------------------------------------------
function polarToCartesian(angleDeg, r) {
  const a = radians(angleDeg);
  return { x: cos(a) * r, y: sin(a) * r };
}

// -----------------------------------------------------
// Build dendritic trunk → branches → twigs
// -----------------------------------------------------
function createDendriticTree(baseAngle) {

  const trees = [];

  // ---- Primary trunk ----
  const trunkLen = random(70, 90);
  const trunkAngle = baseAngle + random(-6, 6);

  const trunkEnd = polarToCartesian(
    trunkAngle,
    neuron.somaRadius + trunkLen
  );

  const trunk = [
    { x: 0, y: 0, r: 5.6 },
    { x: trunkEnd.x, y: trunkEnd.y, r: 4.6 }
  ];

  // ---- Secondary branches ----
  const branchCount = floor(random(2, 4));

  for (let i = 0; i < branchCount; i++) {

    const branchAngle =
      trunkAngle + random(-45, 45);

    const branchLen = random(50, 70);

    const branchEnd = {
      x: trunkEnd.x + cos(radians(branchAngle)) * branchLen,
      y: trunkEnd.y + sin(radians(branchAngle)) * branchLen
    };

    const branch = [
      trunk[1],
      { x: branchEnd.x, y: branchEnd.y, r: 3.2 }
    ];

    // ---- Terminal twigs ----
    const twigCount = floor(random(2, 4));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle =
        branchAngle + random(-30, 30);

      const twigLen = random(35, 55);

      const twigEnd = {
        x: branchEnd.x + cos(radians(twigAngle)) * twigLen,
        y: branchEnd.y + sin(radians(twigAngle)) * twigLen
      };

      trees.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 1.8 }
      ]);
    }
  }

  return trees;
}

// -----------------------------------------------------
// Build path from dendrite → soma (for EPSPs)
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
// Initialize dendrites + synapses
// -----------------------------------------------------
function initSynapses() {

  neuron.dendrites = [];
  neuron.synapses = [];
  neuron.axon.terminalBranches = [];

  let synapseId = 0;

  // 🔥 ONLY THREE PRIMARY TRUNKS
  const trunkAngles = [140, 220, 300];

  trunkAngles.forEach(angle => {

    const trees = createDendriticTree(angle);

    trees.forEach(branch => {

      neuron.dendrites.push(branch);

      const tip = branch[branch.length - 1];

      neuron.synapses.push({
        id: synapseId++,
        x: tip.x + random(-6, 6),
        y: tip.y + random(-6, 6),
        radius: 12,
        hovered: false,
        selected: false,
        type: null,
        path: buildPathToSoma(branch)
      });
    });
  });

  assignSynapseTypes();
  initAxonTerminalBranches();
}

// -----------------------------------------------------
// Enforce excitatory / inhibitory balance
// -----------------------------------------------------
function assignSynapseTypes() {

  const syns = neuron.synapses;
  if (!syns.length) return;

  const inhCount = min(3, floor(syns.length / 3));
  const indices = syns.map((_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < syns.length; i++) {
    syns[indices[i]].type = i < inhCount ? "inh" : "exc";
  }
}

// -----------------------------------------------------
// Axon terminal branching
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
    y: bezierPoint(0, 14, -14, 0, 1)
  };
}

function initAxonTerminalBranches() {

  const base = getAxonEndPoint();

  neuron.axon.terminalBranches = [
    createTerminalBranch(base, 44, -26),
    createTerminalBranch(base, 56,   0),
    createTerminalBranch(base, 44,  28)
  ];
}

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

// -----------------------------------------------------
// Global axon geometry helper
// -----------------------------------------------------
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
    y: bezierPoint(0, 14, -14, 0, t)
  };
}
