// =====================================================
// EPSP SIGNAL MODEL
// =====================================================
console.log("epsp loaded");

// Active EPSPs traveling toward soma
const epsps = [];

// -----------------------------------------------------
// Spawn a new EPSP from a synapse
// -----------------------------------------------------
function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    branch: synapse.branch,
    progress: 0,                    // 0 → synapse, 1 → soma
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius,  // for thickness scaling
    speed: 0.012,
    decay: 0.995
  });
}

// -----------------------------------------------------
// Update EPSP propagation + decay
// -----------------------------------------------------
function updateEPSPs() {
  for (let i = epsps.length - 1; i >= 0; i--) {
    const e = epsps[i];

    e.progress += e.speed;
    e.amplitude *= e.decay;

    // Reached soma
    if (e.progress >= 1) {
      addEPSPToSoma(e.amplitude);
      epsps.splice(i, 1);
      continue;
    }

    // Fully decayed
    if (e.amplitude < 0.5) {
      epsps.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Draw EPSPs along dendritic branches
// -----------------------------------------------------
function drawEPSPs() {
  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    if (!syn || !syn.branch) return;
    console.log("drawing epsp", e.progress);

    // Branch is ordered soma → distal
    // EPSP travels distal → soma, so reverse
    const path = syn.path;

    const segments = path.length - 1;
    if (segments <= 0) return;

    // Map progress (0–1) onto branch segments
    const total = e.progress * segments;
    const idx = floor(total);
    const t = total - idx;

    const i0 = constrain(idx, 0, segments - 1);
    const i1 = constrain(idx + 1, 0, segments);

    const p0 = path[i0];
    const p1 = path[i1];

    const x = lerp(p0.x, p1.x, t);
    const y = lerp(p0.y, p1.y, t);

    // Thickness scales with synapse size
    const w = map(e.baseAmplitude, 6, 30, 3, 12);

    push();
    stroke(80, 150, 255); // EPSP blue
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
