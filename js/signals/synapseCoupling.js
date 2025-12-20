// =====================================================
// PRESYNAPTIC → POSTSYNAPTIC COUPLING (CHEMICAL)
// =====================================================
console.log("synapseCoupling loaded");

// -----------------------------------------------------
// Parameters
// -----------------------------------------------------
const SYNAPTIC_DELAY = 10;     // frames
const RELEASE_PROB   = 0.9;    // probability of release

// Pending synaptic events
const pendingReleases = [];

// -----------------------------------------------------
// Called by axonSpike.js when terminal reaches bouton
// -----------------------------------------------------
function triggerSynapticRelease(bouton) {

  if (random() > RELEASE_PROB) return;

  // Pick nearest postsynaptic synapse
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
    bouton: bouton,
    synapse: target,
    timer: SYNAPTIC_DELAY
  });
}

// -----------------------------------------------------
// Update delayed synaptic transmission
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
// Spawn PSP on neuron 2 dendrite
// -----------------------------------------------------
function spawnPostsynapticPSP(synapse) {

  spawnEPSP({
    id: "n2_" + synapse.id,
    type: "exc",

    radius: 14,

    path: [
      // start AFTER cleft
      {
        x: synapse.x + synapse.cleftOffset.x,
        y: synapse.y + synapse.cleftOffset.y
      },
      // propagate to soma
      {
        x: neuron2.soma.x,
        y: neuron2.soma.y
      }
    ]
  });
}
