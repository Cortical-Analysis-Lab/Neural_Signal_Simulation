// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
// =====================================================
console.log("geometry loaded");

const neuron = {
  somaRadius: 42,
  dendrites: [],
  synapses: [],

  hillock: { length: 16 },

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

  // --- Soma attachment ---
  const attachAngle = baseAngle + random(-3, 3);
  const somaAttach = polarToCartesian(attachAngle, neuron.somaRadius);

  // --- Trunk parameters ---
  const trunkAngle = attachAngle + random(-5, 5);
  const trunkLength = random(90, 120);
  const trunkSegments = 4;

  const trunk = [];
  trunk.push({ x: somaAttach.x, y: somaAttach.y, r: 9.5 });

  // Build a smooth trunk spline
  for (let i = 1; i <= trunkSegments; i++) {
    const t = i / trunkSegments;

    const bend =
      sin(t * PI) * random(-8, 8); // gentle curvature, not noise

    const p = polarToCartesian(
      trunkAngle + bend,
      neuron.somaRadius + trunkLength * t
    );

    trunk.push({
      x: p.x,
      y: p.y,
      r: lerp(9.5, 4.8, t)
    });
  }

  // --- Branches grow FROM the trunk ---
  const branchCount = floor(random(3, 4));

  for (let i = 0; i < branchCount; i++) {

    // pick a point along the trunk (not the base)
    const trunkIndex = floor(random(2, trunk.length - 1));
    const trunkPoint = trunk[trunkIndex];

    const side = random() < 0.5 ? -1 : 1;
    const branchAngle =
      trunkAngle + side * random(35, 55);

    const branchLength = random(45, 65);

    const branchMid = {
      x: trunkPoint.x + cos(radians(branchAngle)) * branchLength * 0.5,
      y: trunkPoint.y + sin(radians(branchAngle)) * branchLength * 0.5
    };

    const branchEnd = {
      x: trunkPoint.x + cos(radians(branchAngle)) * branchLength,
      y: trunkPoint.y + sin(radians(branchAngle)) * branchLength
    };

    const branch = [
      trunkPoint,
      { x: branchMid.x, y: branchMid.y, r: 3.8 },
      { x: branchEnd.x, y: branchEnd.y, r: 3.0 }
    ];

    // --- Terminal twigs ---
    const twigCount = floor(random(2, 4));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle =
        branchAngle + random(-25, 25);

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
}
