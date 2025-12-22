// =====================================================
// BIOLOGICAL-BUT-CLEAN NEURON GEOMETRY (NEURON 1 ONLY)
// =====================================================
console.log("geometry loaded");

// -----------------------------------------------------
// Bouton density control (Neuron 1 only)
// -----------------------------------------------------
const BOUTON_DENSITY_SCALE = 0.6; // 60% of original boutons

// -----------------------------------------------------
// Neuron definition
// -----------------------------------------------------
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

  const segments = [];

  // --- Soma attachment ---
  const attachAngle = baseAngle + random(-2, 2);
  const somaAttach = polarToCartesian(attachAngle, neuron.somaRadius);

  // --- Trunk definition ---
  const trunkAngle = attachAngle + random(-4, 4);
  const trunkLength = random(120, 150);
  const trunkSegments = 5;

  const trunk = [];
  trunk.push({ x: somaAttach.x, y: somaAttach.y, r: 10.5 });

  for (let i = 1; i <= trunkSegments; i++) {
    const t = i / trunkSegments;
    const curvature = sin(t * PI) * random(-6, 6);

    const p = polarToCartesian(
      trunkAngle + curvature,
      neuron.somaRadius + trunkLength * t
    );

    trunk.push({
      x: p.x,
      y: p.y,
      r: lerp(10.5, 5.2, t)
    });
  }

  // 🔑 Trunk is explicit geometry (NO synapses)
  segments.push(trunk);

  // --- Branches grow off trunk ---
  const branchCount = floor(random(3, 4));

  for (let i = 0; i < branchCount; i++) {

    const idx = floor(random(2, trunk.length - 1));
    const origin = trunk[idx];

    const side = random() < 0.5 ? -1 : 1;
    const branchAngle = trunkAngle + side * random(45, 65);
    const branchLength = random(50, 70);

    const mid = {
      x: origin.x + cos(radians(branchAngle)) * branchLength * 0.5,
      y: origin.y + sin(radians(branchAngle)) * branchLength * 0.5
    };

    const end = {
      x: origin.x + cos(radians(branchAngle)) * branchLength,
      y: origin.y + sin(radians(branchAngle)) * branchLength
    };

    const branch = [
      origin,
      { x: mid.x, y: mid.y, r: 4.0 },
      { x: end.x, y: end.y, r: 3.0 }
    ];

    // --- Terminal twigs (ONLY these host synapses) ---
    const twigCount = floor(random(2, 3));

    for (let j = 0; j < twigCount; j++) {

      const twigAngle = branchAngle + random(-25, 25);

      const twigEnd = {
        x: end.x + cos(radians(twigAngle)) * random(22, 36),
        y: end.y + sin(radians(twigAngle)) * random(22, 36)
      };

      segments.push([
        ...branch,
        { x: twigEnd.x, y: twigEnd.y, r: 2.0 }
      ]);
    }
  }

  return segments;
}

// -----------------------------------------------------
// Build EPSP path (tip → soma)
// -----------------------------------------------------
function buildPathToSoma(branch) {

  const path = [];

  // Walk from distal → proximal
  for (let i = branch.length - 1; i >= 0; i--) {
    path.push({
      x: branch[i].x,
      y: branch[i].y
    });
  }

  // Explicit soma termination
  path.push({ x: 0, y: 0 });

  return path;
}

// -----------------------------------------------------
// Reduce bouton count while preserving E/I ratio
// -----------------------------------------------------
function reduceBoutonCountPreserveRatio() {

  if (!neuron.synapses.length) return;

  const targetCount = floor(
    neuron.synapses.length * BOUTON_DENSITY_SCALE
  );

  shuffle(neuron.synapses, true);
  neuron.synapses = neuron.synapses.slice(0, targetCount);
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

      // Always render dendrites
      neuron.dendrites.push(branch);

      // ❌ No synapses on trunks or mid-branches
      if (branch.length < 4) return;

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

  // 🔑 Reduce bouton count BEFORE type assignment
  reduceBoutonCountPreserveRatio();

  // Preserve original E/I ratio logic
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
