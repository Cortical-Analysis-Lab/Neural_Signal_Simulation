// =====================================================
// POSTSYNAPTIC POTENTIAL (EPSP / IPSP) MODEL
// =====================================================
console.log("psp loaded");

// Active postsynaptic potentials
const epsps = [];
// Active postsynaptic potentials for neuron 2
const epsps2 = [];


// -----------------------------------------------------
// Spawn a PSP from a synapse
// (Backward-compatible name kept intentionally)
// -----------------------------------------------------
function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    path: synapse.path,

    progress: 0,                    // 0 → synapse, 1 → soma
    amplitude: synapse.radius,      // decays over time
    baseAmplitude: synapse.radius,  // fixed reference

    speed: 0.012,
    decay: 0.995,                   // ← stronger decay = weak PSPs fail

    type: synapse.type              // "exc" or "inh"
  });
}

// -----------------------------------------------------
// Update PSP propagation + decay
// -----------------------------------------------------
function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];

    e.progress += e.speed;
    e.amplitude *= e.decay;

    // PSP faded out before reaching soma
    if (e.amplitude < 0.6) {
      epsps.splice(i, 1);
      continue;
    }

    // Reached soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.baseAmplitude, e.type);
      epsps.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw PSPs along dendritic paths
// -----------------------------------------------------
function drawEPSPs() {
  epsps.forEach(e => {
    if (!e.path || e.path.length < 2) return;

    const segments = e.path.length - 1;
    const total = e.progress * segments;
    const idx = floor(total);
    const t = total - idx;

    const p0 = e.path[constrain(idx, 0, segments - 1)];
    const p1 = e.path[constrain(idx + 1, 0, segments)];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    // PSP shrinks visually as it decays
    const strength = map(e.amplitude, 6, 30, 0.4, 1.2, true);
    const w = map(e.baseAmplitude, 6, 30, 3, 12) * strength;

    // Use semantic colors
    const c =
      e.type === "exc"
        ? getColor("epsp")
        : getColor("ipsp");

    push();
    stroke(c);
    strokeWeight(w);
    point(x, y);
    pop();
  });
}

// -----------------------------------------------------
// Spawn EPSP on neuron 2 dendrite (from synapse)
// -----------------------------------------------------
function spawnNeuron2EPSP(postSynapse) {

  // Use the primary dendrite (index 0 by construction)
  const path = [...neuron2.dendrites[0]].reverse();

  epsps2.push({
    path,
    progress: 0,
    amplitude: 10,
    baseAmplitude: 10,
    speed: 0.01,
    decay: 0.992,
    type: "exc"
  });
}
function updateNeuron2EPSPs() {
  for (let i = epsps2.length - 1; i >= 0; i--) {
    const e = epsps2[i];
    e.progress += e.speed;
    e.amplitude *= e.decay;

    if (e.amplitude < 0.6) {
      epsps2.splice(i, 1);
      continue;
    }

    if (e.progress >= 1) {
      // (future) integrate into neuron2 soma here
      epsps2.splice(i, 1);
    }
  }
}

function drawNeuron2EPSPs() {
  epsps2.forEach(e => {
    const path = e.path;
    const segments = path.length - 1;
    const total = e.progress * segments;
    const idx = floor(total);
    const t = total - idx;

    const p0 = path[constrain(idx, 0, segments - 1)];
    const p1 = path[constrain(idx + 1, 0, segments)];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    const w = map(e.amplitude, 4, 12, 3, 8, true);

    push();
    stroke(getColor("epsp"));
    strokeWeight(w);
    point(x, y);
    pop();
  });
}

