// =====================================================
// PRESYNAPTIC → POSTSYNAPTIC COUPLING (CHEMICAL)
// =====================================================
console.log("synapseCoupling loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const SYNAPTIC_DELAY = 10;     // frames (~150 ms visual)
const RELEASE_PROB   = 0.9;    // probability of vesicle release

// -----------------------------------------------------
// Pending delayed synaptic events
// -----------------------------------------------------
const pendingReleases = [];

// -----------------------------------------------------
// Called by axonSpike.js when terminal AP reaches bouton
// -----------------------------------------------------
function triggerSynapticRelease(bouton) {

  // Probabilistic release
  if (random() > RELEASE_PROB) return;

  // Find nearest postsynaptic contact
  let target = null;
  let minDist = Infinity;

  neuron2.synapses.forEach(s => {
    const d = dist(bouton.x, bouton.y, s.x, s.y);
    if (d < minDist) {
      minDist = d;
      target = s;
    }
  });

  if (!target) return;

  pendingReleases.push({
    bouton,
    synapse: target,
    timer: SYNAPTIC_DELAY
  });
}

// -----------------------------------------------------
// Update delayed chemical transmission
// -----------------------------------------------------
function updateSynapticCoupling() {
  for (let i = pendingReleases.length - 1; i >= 0; i--) {
    const e = pendingReleases[i];
    e.timer--;

    if (e.timer <= 0) {
      spawnPostsynapticPSP(e.synapse);
      pendingReleases.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn EPSP on neuron 2 dendrite → soma
// -----------------------------------------------------
function spawnPostsynapticPSP(synapse) {

  // Build dendrite → soma path
  const path = [
    { x: synapse.x, y: synapse.y },            // dendritic spine
    { x: neuron2.soma.x, y: neuron2.soma.y }   // soma
  ];

  spawnEPSP({
    id: "n2_psp_" + frameCount,
    type: "exc",

    radius: 14,
    path
  });
}
