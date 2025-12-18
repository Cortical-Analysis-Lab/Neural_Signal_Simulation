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
function polarToCartesian(angleDeg, r) {
  const a = radians(angleDeg);
  return { x: cos(a) * r, y: sin(a) * r };
}

function buildPathToSoma(branch) {
  const path = [];
  for (let i = branch.length - 1; i >= 0; i--) {
    path.push({ x: branch[i].x, y: branch[i].y });
  }
  path.push({ x: 0, y: 0 });
  return path;
}

// -----------------------------------------------------
function initSynapses() {
  neuron.dendrites = [];
  neuron.synapses = [];

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

    let sideBranch = null;
    if (random() < 1.0) {
      const sideAngle = angle + random(-40, -20);
      const s1 = polarToCartesian(sideAngle, 140);
      const s2 = { x: s1.x + random(-15, -25), y: s1.y + random(-10, 10) };
      sideBranch = [
        { x: mid.x, y: mid.y, r: 2.5 },
        { x: s1.x,  y: s1.y,  r: 1.8 },
        { x: s2.x,  y: s2.y,  r: 1.2 }
      ];
      neuron.dendrites.push(sideBranch);
    }

    const targetBranch = (sideBranch && random() < 0.5) ? sideBranch : primaryBranch;
    const end = targetBranch[targetBranch.length - 1];

    neuron.synapses.push({
      id: synapseId++,
      x: end.x + random(-8, 8),
      y: end.y + random(-8, 8),
      radius: 12,
      hovered: false,
      type: random() < 0.75 ? "exc" : "inh", // ← 75% excitatory
      path: buildPathToSoma(targetBranch)
    });
  });
}
