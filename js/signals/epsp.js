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
    branch: synapse.branch,     // ← path reference
    progress: 0,                // 0 = synapse, 1 = soma
    amplitude: synapse.radius,  // bouton size encodes strength
    speed: 0.012,               // slightly faster for clarity
    decay: 0.995
  });

  console.log("EPSP spawned from synapse", synapse.id);
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
    if (!e.branch || e.branch.length === 0) return;

    // EPSP starts at distal end of dendrite
    const start = e.branch[e.branch.length - 1];

    // Interpolate toward soma (0,0)
    const x = lerp(start.x, 0, e.progress);
    const y = lerp(start.y, 0, e.progress);

    // Visual scaling strongly tied to synapse size
    const w = map(e.amplitude, 6, 30, 2, 10);

    push();
    stroke(80, 150, 255); // EPSP BLUE
    strokeWeight(w);
    point(x, y);
    pop();
  });
}
