// =====================================================
// POSTSYNAPTIC POTENTIAL (EPSP / IPSP) MODEL
// =====================================================
console.log("psp loaded");

// Active postsynaptic potentials
const epsps = [];

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
    decay: 0.992,                   // ← stronger decay = weak PSPs fail

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
      addEPSPToSoma(e.amplitude, e.type);
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

    const c = e.type === "exc"
      ? color(90, 255, 150)   // excitatory green
      : color(255, 90, 90);   // inhibitory red

    push();
    stroke(c);
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
