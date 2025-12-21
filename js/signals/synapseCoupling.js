// =====================================================
// PRESYNAPTIC → POSTSYNAPTIC COUPLING (CHEMICAL)
// =====================================================
console.log("synapseCoupling loaded");

// -----------------------------------------------------
// Parameters (visual timing, not physiological scale)
// -----------------------------------------------------
const SYNAPTIC_DELAY        = 15;  // AP → vesicle fusion
const CLEFT_DIFFUSION_DELAY = 10;  // vesicle → receptor binding
const RELEASE_PROB          = 0.9; // probabilistic release

// -----------------------------------------------------
// Pending delayed synaptic events
// -----------------------------------------------------
const pendingReleases = [];

// -----------------------------------------------------
// Called by axonSpike.js when terminal AP reaches bouton
// -----------------------------------------------------
function triggerSynapticRelease(bouton) {

  if (!bouton) return;

  // Stochastic vesicle release
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

  // Queue a chemical synapse event
  pendingReleases.push({
    bouton,
    synapse: target,
    timer: SYNAPTIC_DELAY,
    phase: "release"   // release → diffusion → psp
  });
}

// -----------------------------------------------------
// Update delayed chemical transmission
// -----------------------------------------------------
function updateSynapticCoupling() {

  for (let i = pendingReleases.length - 1; i >= 0; i--) {
    const e = pendingReleases[i];
    e.timer--;

    // ---------------------------------------------
    // Vesicle fusion & neurotransmitter release
    // ---------------------------------------------
    if (e.timer <= 0 && e.phase === "release") {

      if (typeof spawnVesicleBurst === "function") {
        spawnVesicleBurst(e.bouton, e.synapse);
      }

      // Advance to diffusion phase
      e.phase = "psp";
      e.timer = CLEFT_DIFFUSION_DELAY;
    }

    // ---------------------------------------------
    // Postsynaptic receptor activation (EPSP)
    // ---------------------------------------------
    else if (e.timer <= 0 && e.phase === "psp") {

      spawnPostsynapticPSP(e.synapse);
      pendingReleases.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn EPSP on neuron 2 dendrite → soma ONLY
// -----------------------------------------------------
function spawnPostsynapticPSP(synapse) {

  // Safety gate — neuron 2 only
  if (typeof spawnNeuron2EPSP !== "function") return;

  spawnNeuron2EPSP(synapse);
}
