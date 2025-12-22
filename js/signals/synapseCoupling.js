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
// Helpers
// -----------------------------------------------------
function getBoutonAmplitude(bouton) {
  // Robust strength estimate. Uses boutonRadius if present, otherwise a sane default.
  const br = (bouton && typeof bouton.boutonRadius === "number") ? bouton.boutonRadius : 6;

  // Convert bouton radius to an amplitude-ish scale similar to your synapse.radius range (6..30)
  // (Tune these numbers later if you want stronger/weaker inhibition)
  return constrain(map(br, 4, 10, 10, 26), 6, 30);
}

function findNearestPostsynapticTarget(bouton) {
  let target = null;
  let targetNeuron = null;
  let minDist = Infinity;

  // ---- Search neuron 2 synapses ----
  if (typeof neuron2 !== "undefined" && neuron2.synapses && neuron2.synapses.length) {
    neuron2.synapses.forEach(s => {
      const d = dist(bouton.x, bouton.y, s.x, s.y);
      if (d < minDist) {
        minDist = d;
        target = s;
        targetNeuron = "neuron2";
      }
    });
  }

  // ---- Search neuron 3 synapses (optional) ----
  if (typeof neuron3 !== "undefined" && neuron3.synapses && neuron3.synapses.length) {
    neuron3.synapses.forEach(s => {
      const d = dist(bouton.x, bouton.y, s.x, s.y);
      if (d < minDist) {
        minDist = d;
        target = s;
        targetNeuron = "neuron3";
      }
    });
  }

  return { target, targetNeuron, minDist };
}

// -----------------------------------------------------
// Called by axonSpike.js when terminal AP reaches bouton
// -----------------------------------------------------
function triggerSynapticRelease(bouton) {

  if (!bouton) return;

  // Stochastic vesicle release
  if (random() > RELEASE_PROB) return;

  // Find nearest postsynaptic density (neuron2 OR neuron3)
  const hit = findNearestPostsynapticTarget(bouton);
  if (!hit.target || !hit.targetNeuron) return;

  // Queue a chemical synapse event
  pendingReleases.push({
    bouton,
    synapse: hit.target,
    targetNeuron: hit.targetNeuron,
    timer: SYNAPTIC_DELAY,
    phase: "release"   // release → psp
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

      // Advance to diffusion/receptor activation phase
      e.phase = "psp";
      e.timer = CLEFT_DIFFUSION_DELAY;
    }

    // ---------------------------------------------
    // Postsynaptic receptor activation
    // ---------------------------------------------
    else if (e.timer <= 0 && e.phase === "psp") {

      spawnPostsynapticPSP(e.synapse, e.targetNeuron, e.bouton);
      pendingReleases.splice(i, 1);
    }
  }
}

// -----------------------------------------------------
// Spawn PSP on the appropriate postsynaptic target
// -----------------------------------------------------
function spawnPostsynapticPSP(synapse, targetNeuron, bouton) {

  // ----------------------------
  // Neuron 2: excitatory PSP path
  // ----------------------------
  if (targetNeuron === "neuron2") {
    if (typeof spawnNeuron2EPSP !== "function") return;
    spawnNeuron2EPSP(synapse);
    return;
  }

  // ----------------------------------------------------
  // Neuron 3: inhibitory interneuron path (feed-forward)
  // When neuron3 is the postsynaptic target of neuron1,
  // neuron3 produces an IPSP onto neuron1 soma.
  // ----------------------------------------------------
  if (targetNeuron === "neuron3") {

    // Optional: if you later add a visible PSP along neuron3 dendrite, call it here:
    // if (typeof spawnNeuron3EPSP === "function") spawnNeuron3EPSP(synapse);

    // Deliver inhibition to neuron 1 soma
    if (typeof addEPSPToSoma === "function") {
      const amp = getBoutonAmplitude(bouton);
      addEPSPToSoma(amp, "inh");
    }

    return;
  }
}
