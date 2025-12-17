// =====================================================
// EPSP SIGNAL MODEL
// =====================================================

// Active EPSPs traveling toward soma
const epsps = [];

/**
 * Spawn a new EPSP from a synapse
 * Called when a bouton is clicked
 */
function spawnEPSP(synapse) {
  epsps.push({
    synapseId: synapse.id,
    branch: synapse.branch,
    progress: 0,
    amplitude: synapse.radius,
    baseAmplitude: synapse.radius, // ← ADD THIS
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
    if (!e.branch || e.branch.length < 2) return;

    // Branch goes proximal → distal, so we reverse indexing
    const segments = e.branch.length - 1;

    // Progress runs from distal → soma
    const t = (1 - e.progress) * segments;
    const idx = floor(t);
    const localT = t - idx;

    const i = constrain(idx, 0, segments - 1);

    const p1 = e.branch[i + 1];
    const p2 = e.branch[i];

    const x = lerp(p1.x, p2.x, localT);
    const y = lerp(p1.y, p2.y, localT);

    // IMPORTANT: visual size depends on ORIGINAL synapse size
    const w = map(e.baseAmplitude, 6, 30, 3, 12);

    push();
    stroke(80, 150, 255); // EPSP BLUE
    strokeWeight(w);
    point(x, y);
    pop();
  });
}


