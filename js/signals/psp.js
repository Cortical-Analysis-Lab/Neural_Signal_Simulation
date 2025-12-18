// =====================================================
// POSTSYNAPTIC POTENTIAL (EPSP / IPSP) MODEL
// =====================================================
console.log("psp loaded");

// Active postsynaptic potentials
const epsps = [];

// -----------------------------------------------------
// Spawn a PSP from a synapse
// -----------------------------------------------------
// Backward compatibility
const spawnEPSP = spawnPSP;

function spawnPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,

    progress: 0,                    // 0 → synapse, 1 → soma
    amplitude: synapse.radius,      // dynamic decay
    baseAmplitude: synapse.radius,  // fixed reference for thickness

    speed: 0.012,
    decay: 0.995,

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

    // Reached soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.amplitude, e.type);
      epsps.splice(i, 1);
      continue;
    }

    // Fully decayed before reaching soma
    if (e.amplitude < 0.5) {
      epsps.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw PSPs along dendritic paths
// -----------------------------------------------------
function drawEPSPs() {
  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    if (!syn || !syn.path) return;

    const path = syn.path;
    const segments = path.length - 1;
    if (segments <= 0) return;

    // Map progress onto dendritic segments
    const total = e.progress * segments;
    const idx = floor(total);
    const t = total - idx;

    const p0 = path[constrain(idx, 0, segments - 1)];
    const p1 = path[constrain(idx + 1, 0, segments)];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    // Thickness reflects synaptic strength
    const w = map(e.baseAmplitude, 6, 30, 3, 12);

    // Color reflects synapse type
    const c = e.type === "exc"
      ? color(100, 240, 160)  // excitatory green
      : color(240, 100, 100); // inhibitory red

    push();
    stroke(c);
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
