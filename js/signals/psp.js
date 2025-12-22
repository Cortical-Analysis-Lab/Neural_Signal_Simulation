// =====================================================
// POSTSYNAPTIC POTENTIAL (EPSP / IPSP) MODEL
// =====================================================
console.log("psp loaded");

// -----------------------------------------------------
// Active postsynaptic potentials (global PSP engine)
// -----------------------------------------------------
const epsps = [];   // neuron 1 + neuron 3 PSPs
const epsps2 = [];  // neuron 2 EPSPs (visual only for now)

// -----------------------------------------------------
// Spawn a PSP from a synapse (generic, neuron 1 legacy)
// -----------------------------------------------------
function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    path: synapse.path,

    progress: 0,                    // 0 → synapse, 1 → soma
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius,

    speed: 0.012,
    decay: 0.995,
    type: synapse.type              // "exc" or "inh"
  });
}

// -----------------------------------------------------
// Spawn EPSP on neuron 2 dendrite
// -----------------------------------------------------
function spawnNeuron2EPSP(postSynapse) {

  if (!neuron2 || !neuron2.dendrites.length) return;

  const path = [...neuron2.dendrites[0]].reverse();

  epsps2.push({
    path,
    progress: 0,
    amplitude: 40,
    baseAmplitude: 40,
    speed: 0.01,
    decay: 0.992,
    type: "exc"
  });
}

// -----------------------------------------------------
// Spawn IPSP on neuron 3 dendrite (NEW)
// -----------------------------------------------------
function spawnNeuron3IPSP(postSynapse) {

  if (!neuron3 || !neuron3.dendrites.length) return;

  // Primary synaptic trunk is index 0 by construction
  const path = [...neuron3.dendrites[0]].reverse();

  epsps.push({
    synapseId: "neuron3",
    path,

    progress: 0,
    amplitude: 20,
    baseAmplitude: 20,

    speed: 0.010,      // IPSPs slightly slower
    decay: 0.994,      // longer-lasting
    type: "inh"
  });
}

// -----------------------------------------------------
// Update PSP propagation + decay (GLOBAL)
// -----------------------------------------------------
function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];

    e.progress += e.speed;
    e.amplitude *= e.decay;

    // PSP fades out before reaching soma
    if (e.amplitude < 0.6) {
      epsps.splice(i, 1);
      continue;
    }

    // PSP reaches soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.baseAmplitude, e.type);
      epsps.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Update neuron 2 EPSPs (visual only)
// -----------------------------------------------------
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
      // (future) integrate into neuron2 soma
      epsps2.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw PSPs along dendritic paths (GLOBAL)
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

    // Visual tapering
    const strength = map(e.amplitude, 6, 30, 0.4, 1.2, true);
    const w = map(e.baseAmplitude, 6, 30, 3, 12) * strength;

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
// Draw neuron 2 EPSPs
// -----------------------------------------------------
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
