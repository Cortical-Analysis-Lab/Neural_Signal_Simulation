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
    synapseId: synapse.id,      // which dendrite
    progress: 0,               // 0 = synapse, 1 = soma
    amplitude: synapse.radius, // strength proxy (bouton size)
    speed: 0.01,               // propagation speed
    decay: 0.995               // amplitude decay
  });

  console.log("EPSP spawned:", synapse.id);
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

    // Remove EPSP when it reaches soma or fades out
    if (e.progress >= 1 || e.amplitude < 1) {
      epsps.splice(i, 1);
    }
  }
}

/**
 * Draw EPSPs traveling along dendrites toward soma
 */
function drawEPSPs() {
  epsps.forEach(e => {
    const d = neuron.dendrites[e.synapseId];
    if (!d) return;

    // Starting position = dendrite endpoint
    const start = polarToCartesian(d.angle, d.length);

    // Interpolate toward soma (0,0)
    const x = lerp(start.x, 0, e.progress);
    const y = lerp(start.y, 0, e.progress);

    push();
    stroke(80, 150, 255); // EPSP BLUE
    strokeWeight(map(e.amplitude, 6, 30, 3, 10));
    point(x, y);
    pop();
  });
}
