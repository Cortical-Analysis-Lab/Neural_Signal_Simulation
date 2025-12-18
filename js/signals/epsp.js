// =====================================================
// EPSP SIGNAL MODEL
// =====================================================
console.log("epsp loaded");

// Active EPSPs traveling toward soma
const epsps = [];

/**
 * Spawn a new EPSP from a synapse
 * Called when a bouton is clicked
 */
function spawnEPSP(synapse) {
  epsps.push({
    synapse: synapse,
    branch: synapse.branch,
    progress: 0,
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius,
    speed: 0.012,
    decay: 0.995
  });
}


/**
 * Update EPSP propagation and decay
 * Called every frame in Overview mode
 */
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

/**
 * Draw EPSPs traveling along dendrites toward soma
 */
function drawEPSPs() {
  epsps.forEach(e => {
    const syn = neuron.synapses[e.synapseId];
    if (!syn || !syn.branch) return;

    // Build full path: distal → soma
    const branchPath = [...syn.branch].reverse();
    branchPath.push({ x: 0, y: 0 }); // ← ENSURE soma arrival

    const segments = branchPath.length - 1;
    if (segments <= 0) return;

    const totalProgress = e.progress * segments;
    const segIndex = floor(totalProgress);
    const localT = totalProgress - segIndex;

    const i0 = constrain(segIndex, 0, segments - 1);
    const i1 = constrain(segIndex + 1, 0, segments);

    const p0 = branchPath[i0];
    const p1 = branchPath[i1];

    const x = lerp(p0.x, p1.x, localT);
    const y = lerp(p0.y, p1.y, localT);

    const w = map(e.baseAmplitude, 6, 30, 4, 12);

    push();
    stroke(80, 150, 255);
    strokeWeight(w);
    point(x, y);
    pop();
  });
}

}




