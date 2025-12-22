// =====================================================
// INHIBITORY INTERNEURON GEOMETRY (NEURON 3)
// =====================================================
console.log("neuron3 geometry loaded");

// -----------------------------------------------------
const neuron3 = {
  somaRadius: 30,
  soma: { x: 0, y: 0 },
  dendrites: [],
  synapses: []
};

// -----------------------------------------------------
// Initialize neuron 3
// -----------------------------------------------------
function initNeuron3() {

  neuron3.dendrites = [];
  neuron3.synapses  = [];

  // ---------------------------------------------------
  // 1) Select TOPMOST axon terminal from neuron 1
  // ---------------------------------------------------
  let topBranch = null;
  let minY = Infinity;

  neuron.axon.terminalBranches.forEach(b => {
    if (b.end.y < minY) {
      minY = b.end.y;
      topBranch = b;
    }
  });

  if (!topBranch) return;

  const bouton = {
    x: topBranch.end.x,
    y: topBranch.end.y
  };

  // ---------------------------------------------------
  // 2) Postsynaptic contact (IPSP site)
  // ---------------------------------------------------
  const dendriteContact = {
    x: bouton.x - 26,
    y: bouton.y - 10
  };

  neuron3.synapses.push({
    x: dendriteContact.x,
    y: dendriteContact.y,
    radius: 7
  });

  // ---------------------------------------------------
  // 3) Soma placement (open upper space)
  // ---------------------------------------------------
  const SOMA_DISTANCE = 170;
  const somaAngle = radians(-70); // up-left relative to bouton

  neuron3.soma.x = dendriteContact.x + cos(somaAngle) * SOMA_DISTANCE;
  neuron3.soma.y = dendriteContact.y + sin(somaAngle) * SOMA_DISTANCE;

  // ---------------------------------------------------
  // 4) PRIMARY SYNAPTIC TRUNK (MUST CONNECT)
  // ---------------------------------------------------
  const synTrunk = [];
  const synSegments = 5;

  synTrunk.push({
    x: neuron3.soma.x,
    y: neuron3.soma.y,
    r: 5.8
  });

  const synAngle = degrees(
    atan2(
      dendriteContact.y - neuron3.soma.y,
      dendriteContact.x - neuron3.soma.x
    )
  );

  const synLength = dist(
    neuron3.soma.x,
    neuron3.soma.y,
    dendriteContact.x,
    dendriteContact.y
  );

  for (let i = 1; i <= synSegments; i++) {
    const t = i / synSegments;
    const bend = sin(t * PI) * 4;

    const p = polarToCartesian(
      synAngle + bend,
      synLength * t
    );

    synTrunk.push({
      x: neuron3.soma.x + p.x,
      y: neuron3.soma.y + p.y,
      r: lerp(5.8, 2.6, t)
    });
  }

  neuron3.dendrites.push(synTrunk);

  // ---------------------------------------------------
  // 5) ADDITIONAL PRIMARY TRUNKS (SHORT, DIVERGENT)
  // ---------------------------------------------------
  const extraTrunkAngles = [
    synAngle + 110,
    synAngle - 110
  ];

  extraTrunkAngles.forEach(baseAngle => {

    const trunkLength = random(70, 95);
    const segments = 4;
    const trunk = [];

    trunk.push({
      x: neuron3.soma.x,
      y: neuron3.soma.y,
      r: 5.2
    });

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const bend = sin(t * PI) * random(3, 5);

      const p = polarToCartesian(
        baseAngle + bend,
        trunkLength * t
      );

      const px = neuron3.soma.x + p.x;
      const py = neuron3.soma.y + p.y;

      // Radial exclusion: never re-enter soma zone
      if (dist(px, py, neuron3.soma.x, neuron3.soma.y) <
          neuron3.somaRadius + 14) {
        continue;
      }

      trunk.push({
        x: px,
        y: py,
        r: lerp(5.2, 2.4, t)
      });
    }

    neuron3.dendrites.push(trunk);

    // -------------------------------------------------
    // 6) SECONDARY BRANCHES (VERY SHORT)
    // -------------------------------------------------
    const branchCount = 2;

    for (let i = 0; i < branchCount; i++) {

      const idx = floor(random(1, trunk.length - 1));
      const origin = trunk[idx];

      const branchAngle = baseAngle + random(-35, 35);
      const branchLength = random(32, 48);

      const mid = {
        x: origin.x + cos(radians(branchAngle)) * branchLength * 0.5,
        y: origin.y + sin(radians(branchAngle)) * branchLength * 0.5
      };

      const end = {
        x: origin.x + cos(radians(branchAngle)) * branchLength,
        y: origin.y + sin(radians(branchAngle)) * branchLength
      };

      // Enforce outward growth
      if (
        dist(end.x, end.y, neuron3.soma.x, neuron3.soma.y) <=
        dist(origin.x, origin.y, neuron3.soma.x, neuron3.soma.y)
      ) {
        continue;
      }

      const branch = [
        origin,
        { x: mid.x, y: mid.y, r: 2.4 },
        { x: end.x, y: end.y, r: 2.0 }
      ];

      neuron3.dendrites.push(branch);

      // -----------------------------------------------
      // 7) TERMINAL TWIGS (MINIMAL)
      // -----------------------------------------------
      const twigCount = floor(random(1, 2));

      for (let j = 0; j < twigCount; j++) {

        const twigAngle = branchAngle + random(-20, 20);

        const twigEnd = {
          x: end.x + cos(radians(twigAngle)) * random(12, 18),
          y: end.y + sin(radians(twigAngle)) * random(12, 18)
        };

        neuron3.dendrites.push([
          ...branch,
          { x: twigEnd.x, y: twigEnd.y, r: 1.5 }
        ]);
      }
    }
  });
}
