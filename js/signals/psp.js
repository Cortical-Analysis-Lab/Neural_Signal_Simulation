// =====================================================
// POSTSYNAPTIC POTENTIAL (PSP) MODEL
// Supports EPSPs (excitatory) and IPSPs (inhibitory)
// =====================================================
console.log("psp loaded");

// Active postsynaptic potentials
const psps = [];

// -----------------------------------------------------
// Spawn a PSP from a synapse
// -----------------------------------------------------
function spawnPSP(synapse) {
  psps.push({
    synapseId: synapse.id,

    progress: 0,                    // 0 → synapse, 1 → soma
    amplitude: synapse.radius,      // decays over time
    baseAmplitude: synapse.radius,  // fixed reference for thickness

    speed: 0.012,
    decay: 0.995,

    type: synapse.type              // "exc" or "inh"
  });
}

// -----------------------------------------------------
// Backward compatibility (old name still works)
// -----------------------------------------------------
const spawnEPSP = spawnPSP;

// -----------------------------------------------------
// Update PSP propagation + decay
// -----------------------------------------------------
function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];

    e.progress += e.speed;

    // Stronger dendritic attenuation
    e.amplitude *= 0.985;   // was 0.995

    // Remove if too weak before soma
    if (e.amplitude < 1.0) {
      epsps.splice(i, 1);
      continue;
    }

    // Reached soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.amplitude, e.type);
      epsps.splice(i, 1);
    }
  }
}


// -----------------------------------------------------
// Draw PSPs along dendritic paths
// -----------------------------------------------------
function drawEPSPs() {
  psps.forEach(p => {
    const syn = neuron.synapses[p.synapseId];
    if (!syn || !syn.path) return;

    const path = syn.path;
    const segments = path.length - 1;
    if (segments <= 0) return;

    // Map progress onto dendritic segments
    const total = p.progress * segments;
    const idx = floor(total);
    const t = total - idx;

    const p0 = path[constrain(idx, 0, segments - 1)];
    const p1 = path[constrain(idx + 1, 0, segments)];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    // Thickness reflects synaptic strength
    const w = map(e.amplitude, 1, 30, 1, 12);

    // Color reflects synapse type
    const c = p.type === "exc"
      ? color(100, 240, 160)   // excitatory green
      : color(240, 100, 100);  // inhibitory red

    push();
    stroke(c);
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
