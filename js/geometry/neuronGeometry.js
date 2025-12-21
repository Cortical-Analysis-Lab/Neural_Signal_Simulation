// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
// =====================================================
console.log("geometry loaded");

const neuron = {
  somaRadius: 42,

  dendrites: [],
  synapses: [],

  hillock: {
    length: 16
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
// Build dendritic trunk → branch → twig (ATTACHED)
// -----------------------------------------------------
function createDendriticTree(baseAngle) {

  const branches = [];

  // === SOMA ATTACHMENT (CRITICAL FIX) ===
  const attachAngle = baseAngle + random(-4, 4);
  const somaAttach = polarToCartesian(
    attachAngle,
    neuron.somaRadius
  );

  // === PRIMARY TRUNK ===
  const trunkAngle = attachAngle + random(-6, 6);

  const trunkMid = polarToCartesian(
    trunkAngle + random(-4, 4),
    neuron.somaRadius + random(35, 50)
  );

  const trunkEnd = polarToCartesian(
    trunkAngle + random(-6, 6),
    neuron.somaRadius + random(70, 90)
  );

  const trunk = [
    { x: somaAttach.x, y: somaAttach.y, r: 9.0 },
    { x: trunkMid.x,  y: trunkMid.y,  r: 6.5 },
    { x: trunkEnd.x,  y: trunkEnd.y,  r: 5.2 }
  ];

  // === SECONDARY BRANCHES ===
  const branchCount = floor(random(2, 3));

  for (let i = 0; i < branchCount; i++) {

    const branchAngle = trunkAngle + random(-45, 45);

    const branchMid = {
      x: trunkEnd.x + cos(radians(branchAngle)) * random(30, 45),
      y: trunkEnd.y + sin(radians(branchAngle)) * random(30, 45)
    };

    const branchEnd = {
      x: branchMid.x + cos(radians(branchAngle)) * random(30, 45),
      y: branchMid.y + sin(radians(branchAngle)) * random(30, 45)
    };

    const branch = [
      trunk[2],
      { x: branchMid.x, y: branchMid.y, r: 3.8 },
      { x: branchEnd.x, y: branchEnd.y, r: 3.0 }
    ];

    // === TERMINAL TWIGS ===
    const twigCount = floor(random(2, 4));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle = branchAngle + random(-30, 30);

      const twigEnd = {
        x: branchEnd.x + cos(radians(twigAngle)) * random(22, 36),
        y: branchEnd.y + sin(radians(twigAngle)) * random(22, 36)
      };

      branches.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 2.0 }
      ]);
    }
  }

  return branches;
}

// -----------------------------------------------------
// Build EPSP path (tip → soma)
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

  // 🔥 THREE TRUE DENDRITIC TRUNKS
  const trunkAngles = [150, 225, 300];

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
// Excitatory / inhibitory balance
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
// Axon geometry
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
// Global axon helper
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
}  // === TRUNK (SHORT + THICK) ===
  const trunkAngle = baseAngle + random(-5, 5);

  const trunkBase = polarToCartesian(
    trunkAngle,
    neuron.somaRadius + 2   // START AT SOMA SURFACE
  );

  const trunkMid = polarToCartesian(
    trunkAngle + random(-3, 3),
    neuron.somaRadius + random(35, 45)
  );

  const trunkEnd = polarToCartesian(
    trunkAngle + random(-6, 6),
    neuron.somaRadius + random(45, 55)
  );

  const trunk = [
    { x: trunkBase.x, y: trunkBase.y, r: 8.5 },
    { x: trunkMid.x,  y: trunkMid.y,  r: 6.8 },
    { x: trunkEnd.x,  y: trunkEnd.y,  r: 5.6 }
  ];

  // === SECONDARY BRANCHES ===
  const branchCount = floor(random(2, 3));

  for (let i = 0; i < branchCount; i++) {

    const branchAngle = trunkAngle + random(-40, 40);

    const branchMid = {
      x: trunkEnd.x + cos(radians(branchAngle)) * random(30, 40),
      y: trunkEnd.y + sin(radians(branchAngle)) * random(30, 40)
    };

    const branchEnd = {
      x: branchMid.x + cos(radians(branchAngle)) * random(30, 45),
      y: branchMid.y + sin(radians(branchAngle)) * random(30, 45)
    };

    const branch = [
      trunk[2],
      { x: branchMid.x, y: branchMid.y, r: 4.2 },
      { x: branchEnd.x, y: branchEnd.y, r: 3.4 }
    ];

    // === TERMINAL TWIGS ===
    const twigCount = floor(random(2, 4));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle = branchAngle + random(-25, 25);

      const twigEnd = {
        x: branchEnd.x + cos(radians(twigAngle)) * random(22, 34),
        y: branchEnd.y + sin(radians(twigAngle)) * random(22, 34)
      };

      branches.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 2.2 }
      ]);
    }
  }

  return branches;
}

// -----------------------------------------------------
// Build EPSP path (tip → soma)
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

  // 🔥 THREE PRIMARY DENDRITIC TRUNKS
  const trunkAngles = [145, 225, 305];

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
