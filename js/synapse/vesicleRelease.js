console.log("⚡ synapse/vesicleRelease loaded");

// =====================================================
// VESICLE RELEASE — AP TRIGGERED
// =====================================================

const MEMBRANE_X = 0;

function triggerVesicleReleaseFromAP() {

  for (const v of synapseVesicles) {
    if (v.state === VESICLE_STATE.LOADED) {
      v.state = "docking";
      v.timer = 0;
    }
  }
}

function updateVesicleRelease() {

  for (const v of synapseVesicles) {

    if (v.state === "docking") {
      v.x -= 2.0;
      if (v.x <= MEMBRANE_X + 2) {
        v.state = "fused";
        v.timer = 0;

        // Neurotransmitter dump
        if (typeof spawnNeurotransmitterBurst === "function") {
          spawnNeurotransmitterBurst(v.x, v.y);
        }
      }
    }

    if (v.state === "fused") {
      v.timer++;
      if (v.timer > 18) {
        v.state = "recycling";
      }
    }
  }
}
