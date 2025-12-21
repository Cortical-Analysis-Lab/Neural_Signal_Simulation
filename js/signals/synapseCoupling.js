// =====================================================
// PRESYNAPTIC → POSTSYNAPTIC COUPLING (CHEMICAL)
// =====================================================
console.log("synapseCoupling loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const SYNAPTIC_DELAY = 15;   // frames (visual chemical delay)
const RELEASE_PROB   = 0.9;  // probability of vesicle release

// -----------------------------------------------------
// Pending delayed synaptic events
// -----------------------------------------------------
const pendingReleases = [];

// -----------------------------------------------------
// Called by axonSpike.js when AP reaches bouton
// -----------------------------------------------------
function triggerSynapticRelease(bouton) {

  if (!bouton) return;

  // Probabilistic release
  if (random() > RELEASE_PROB) return;

  // Find nearest postsynaptic density
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

      // 🫧 Neurotransmitter vesicle burst
      if (typeof spawnVesicleBurst === "function") {
        spawnVesicleBurst(e.bouton, e.synapse);
      }

      // ⚡ Postsynaptic electrical response
      spawnPostsynapticPSP(e.synapse);

      pendingReleases.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn EPSP on neuron 2 dendrite → soma
// -----------------------------------------------------
function spawnPostsynapticPSP(synapse) {

  // Find dendritic branch closest to synapse
  let bestBranch = neuron2.dendrites[0];
  let minDist = Infinity;

  neuron2.dendrites.forEach(branch => {
    branch.forEach(p => {
      const d = dist(p.x, p.y, synapse.x, synapse.y);
      if (d < minDist) {
        minDist = d;
        bestBranch = branch;
      }
    });
  });

  // Dendrite → soma propagation
  const path = [...bestBranch].reverse();

  spawnEPSP({
    id: "n2_psp_" + frameCount,
    type: "exc",
    radius: 14,
    path
  });
}
